import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import * as schema from "./schema";
import {
  DEFAULT_SITE_CONTENT,
  DEFAULT_PAGE_SEO,
  DEFAULT_HERO_SLIDES,
  DEFAULT_BRANDS,
} from "./defaults";

type GlobalWithLibSql = typeof globalThis & {
  __mekLibsql?: Client;
  __mekDb?: LibSQLDatabase<typeof schema>;
  __mekInitPromise?: Promise<void>;
};

const globalForDb = globalThis as GlobalWithLibSql;

function resolveLibsqlUrl(): string {
  if (process.env.LIBSQL_URL) {
    return process.env.LIBSQL_URL;
  }
  const configured = process.env.DATABASE_PATH || "./data/mekengineering.db";
  const absPath = path.isAbsolute(configured)
    ? configured
    : path.resolve(process.cwd(), configured);
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  return pathToFileURL(absPath).href;
}

function getLibsqlClient(): Client {
  if (!globalForDb.__mekLibsql) {
    globalForDb.__mekLibsql = createClient({
      url: resolveLibsqlUrl(),
      authToken: process.env.LIBSQL_AUTH_TOKEN,
    });
  }
  return globalForDb.__mekLibsql;
}

export const libsql = getLibsqlClient();
export const db: LibSQLDatabase<typeof schema> =
  globalForDb.__mekDb ?? (globalForDb.__mekDb = drizzle(libsql, { schema }));

async function runInitialization(client: Client): Promise<void> {
  // High-concurrency & smooth performance SQLite/libSQL PRAGMAs
  await client.execute("PRAGMA journal_mode = WAL;");
  await client.execute("PRAGMA busy_timeout = 5000;");
  await client.execute("PRAGMA synchronous = NORMAL;");
  await client.execute("PRAGMA cache_size = -64000;");
  await client.execute("PRAGMA foreign_keys = ON;");
  await client.execute("PRAGMA temp_store = MEMORY;");
  await client.execute("PRAGMA wal_autocheckpoint = 1000;");

  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'text',
      label TEXT NOT NULL,
      section TEXT NOT NULL DEFAULT 'global',
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_site_content_section ON site_content(section);

    CREATE TABLE IF NOT EXISTS page_seo (
      route TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      keywords TEXT NOT NULL DEFAULT '',
      og_title TEXT NOT NULL DEFAULT '',
      og_description TEXT NOT NULL DEFAULT '',
      og_image TEXT NOT NULL DEFAULT '/images/carousel/store-interior.png',
      canonical_url TEXT NOT NULL DEFAULT '',
      no_index INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS hero_slides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      badge TEXT NOT NULL DEFAULT 'Premium Industrial Supply',
      title_part1 TEXT NOT NULL DEFAULT '',
      title_highlight TEXT NOT NULL DEFAULT '',
      title_part2 TEXT NOT NULL DEFAULT '',
      subtitle TEXT NOT NULL DEFAULT '',
      primary_cta_text TEXT NOT NULL DEFAULT 'View Catalog',
      primary_cta_href TEXT NOT NULL DEFAULT '/products',
      secondary_cta_text TEXT NOT NULL DEFAULT 'Contact Us',
      secondary_cta_href TEXT NOT NULL DEFAULT '/contact',
      image_url TEXT NOT NULL DEFAULT '/images/carousel/store-interior.png',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      badge TEXT NOT NULL DEFAULT 'Industrial Line',
      short_description TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL DEFAULT '',
      featured INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      meta_title TEXT NOT NULL DEFAULT '',
      meta_description TEXT NOT NULL DEFAULT '',
      og_image TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

    CREATE TABLE IF NOT EXISTS subcategories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      short_description TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL DEFAULT '',
      featured INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      meta_title TEXT NOT NULL DEFAULT '',
      meta_description TEXT NOT NULL DEFAULT '',
      og_image TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_subcategories_slug ON subcategories(slug);
    CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories(category_id);

    CREATE TABLE IF NOT EXISTS brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      tagline TEXT NOT NULL DEFAULT 'Authorized Industrial Partner',
      description TEXT NOT NULL DEFAULT '',
      logo_url TEXT NOT NULL DEFAULT '',
      banner_url TEXT NOT NULL DEFAULT '',
      website_url TEXT NOT NULL DEFAULT '',
      authorized_since TEXT NOT NULL DEFAULT '1968',
      rating INTEGER NOT NULL DEFAULT 5,
      featured INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      meta_title TEXT NOT NULL DEFAULT '',
      meta_description TEXT NOT NULL DEFAULT '',
      og_image TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      sku TEXT NOT NULL DEFAULT '',
      model_number TEXT NOT NULL DEFAULT '',
      short_description TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      price_text TEXT NOT NULL DEFAULT 'Request Wholesale Quote',
      in_stock INTEGER NOT NULL DEFAULT 1,
      featured INTEGER NOT NULL DEFAULT 1,
      badge TEXT NOT NULL DEFAULT '',
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE SET NULL,
      brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL,
      image_url TEXT NOT NULL DEFAULT '',
      gallery_json TEXT NOT NULL DEFAULT '[]',
      specs_json TEXT NOT NULL DEFAULT '[]',
      features_json TEXT NOT NULL DEFAULT '[]',
      datasheet_url TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      meta_title TEXT NOT NULL DEFAULT '',
      meta_description TEXT NOT NULL DEFAULT '',
      og_image TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory_id);
    CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);

    CREATE TABLE IF NOT EXISTS inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      company TEXT NOT NULL DEFAULT '',
      subject TEXT NOT NULL DEFAULT 'General Inquiry',
      message TEXT NOT NULL,
      product_id INTEGER,
      product_name TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'new',
      email_sent INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS system_secrets (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL
    );
  `);

  await seedDefaultsIfEmpty(client);
}

async function seedDefaultsIfEmpty(client: Client): Promise<void> {
  const now = new Date().toISOString();

  // 1. Insert missing default site_content keys without overwriting admin edits
  await client.batch(
    DEFAULT_SITE_CONTENT.map((item) => ({
      sql: `INSERT OR IGNORE INTO site_content (key, value, type, label, section, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [item.key, item.value, item.type, item.label, item.section, now],
    })),
    "write"
  );

  // 2. Insert missing page SEO entries without overwriting admin edits
  await client.batch(
    DEFAULT_PAGE_SEO.map((seo) => ({
      sql: `INSERT OR IGNORE INTO page_seo (route, title, description, keywords, og_title, og_description, og_image, canonical_url, no_index, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, '', 0, ?)`,
      args: [
        seo.route,
        seo.title,
        seo.description,
        seo.keywords,
        seo.ogTitle,
        seo.ogDescription,
        seo.ogImage,
        now,
      ],
    })),
    "write"
  );

  // 3. Seed hero slides only if empty
  const slideCountRes = await client.execute("SELECT COUNT(*) as cnt FROM hero_slides");
  const slideCount = Number(slideCountRes.rows[0]?.cnt ?? 0);
  if (slideCount === 0) {
    await client.batch(
      DEFAULT_HERO_SLIDES.map((s) => ({
        sql: `INSERT INTO hero_slides (
                badge, title_part1, title_highlight, title_part2, subtitle,
                primary_cta_text, primary_cta_href, secondary_cta_text, secondary_cta_href,
                image_url, sort_order, is_active, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          s.badge,
          s.titlePart1,
          s.titleHighlight,
          s.titlePart2,
          s.subtitle,
          s.primaryCtaText,
          s.primaryCtaHref,
          s.secondaryCtaText,
          s.secondaryCtaHref,
          s.imageUrl,
          s.sortOrder,
          s.isActive ? 1 : 0,
          now,
          now,
        ],
      })),
      "write"
    );
  }

  // 4. Seed authorized brands if empty (categories, subcategories & products are managed via Admin / .db import)
  const brandCountRes = await client.execute("SELECT COUNT(*) as cnt FROM brands");
  const brandCount = Number(brandCountRes.rows[0]?.cnt ?? 0);

  if (brandCount === 0) {
    await client.batch(
      DEFAULT_BRANDS.map((b) => ({
        sql: `INSERT INTO brands (
                name, slug, tagline, description, logo_url, banner_url, website_url,
                authorized_since, rating, featured, sort_order, meta_title, meta_description, og_image, created_at, updated_at
              ) VALUES (?, ?, ?, ?, '', '/images/carousel/bosch-store.png', ?, ?, ?, ?, ?, '', '', '', ?, ?)`,
        args: [
          b.name,
          b.slug,
          b.tagline,
          b.description,
          b.websiteUrl,
          b.authorizedSince,
          b.rating,
          b.featured ? 1 : 0,
          b.sortOrder,
          now,
          now,
        ],
      })),
      "write"
    );
  }
}

export function ensureDbReady(): Promise<void> {
  if (!globalForDb.__mekInitPromise) {
    globalForDb.__mekInitPromise = runInitialization(libsql).catch((err) => {
      globalForDb.__mekInitPromise = undefined;
      throw err;
    });
  }
  return globalForDb.__mekInitPromise;
}

export async function getDbHealth() {
  await ensureDbReady();
  const walRes = await libsql.execute("PRAGMA journal_mode;");
  const syncRes = await libsql.execute("PRAGMA synchronous;");
  const busyRes = await libsql.execute("PRAGMA busy_timeout;");

  return {
    ok: true,
    engine: "libsql",
    journalMode: String(walRes.rows[0]?.journal_mode ?? "wal"),
    synchronous: Number(syncRes.rows[0]?.synchronous ?? 1),
    busyTimeout: Number(busyRes.rows[0]?.timeout ?? 5000),
  };
}
