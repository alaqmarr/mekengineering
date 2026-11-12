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
      price_text TEXT NOT NULL DEFAULT '',
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

const LEGACY_DUMMY_CONTENT_REPLACEMENTS: Array<{
  key: string;
  oldValues: string[];
}> = [
  { key: "social.facebook", oldValues: ["https://facebook.com"] },
  { key: "social.twitter", oldValues: ["https://x.com", "https://twitter.com"] },
  { key: "social.instagram", oldValues: ["https://instagram.com"] },
  { key: "social.linkedin", oldValues: ["https://linkedin.com"] },
  { key: "contact.phoneAvailability", oldValues: ["Mon – Sat • 10:00 AM to 8:00 PM IST"] },
  { key: "contact.email", oldValues: ["info@mekengineering.com"] },
  { key: "contact.emailResponse", oldValues: ["Response time: < 24 hrs"] },
  {
    key: "home.categories.description",
    oldValues: [
      "Explore Bosch Professional laser rangefinders, thermal detectors, line & rotary lasers, optical levels, digital inclinometers, and genuine accessories.",
    ],
  },
  {
    key: "home.subcategories.description",
    oldValues: [
      "Pinpoint the exact Bosch Professional measuring instrument class for your jobsite \u2014 from green-beam rangefinders to radar wallscanners.",
    ],
  },
  {
    key: "home.featured.description",
    oldValues: [
      "Hand-picked flagship Bosch Professional measuring instruments trusted by civil engineers, MEP contractors, and industrial plants across India.",
    ],
  },
  {
    key: "home.legacy.paragraph",
    oldValues: [
      "For over 55 years, we have defined excellence in industrial supply. As premier wholesale traders in Secunderabad, we bridge the gap between global manufacturers and local industry needs with 100% genuine equipment.",
    ],
  },
  { key: "home.legacy.stat1Value", oldValues: ["55+"] },
  { key: "home.legacy.stat1Label", oldValues: ["Years Experience"] },
  { key: "home.legacy.stat2Value", oldValues: ["10k+"] },
  { key: "home.legacy.stat2Label", oldValues: ["Products Sold"] },
  { key: "home.legacy.stat3Value", oldValues: ["100%"] },
  { key: "home.legacy.stat3Label", oldValues: ["Client Satisfaction & Genuine Supply"] },
  {
    key: "home.cta.paragraph",
    oldValues: [
      "Connect directly with our technical sales desk at Victoria Ranigunj, Secunderabad for GST wholesale invoicing, plant setup toolkits, and genuine OEM spares.",
    ],
  },
  { key: "home.cta.button", oldValues: ["Speak With Our Engineers"] },
  {
    key: "products.hero.paragraph",
    oldValues: [
      "Explore our complete range of Bosch Professional laser rangefinders, thermal imaging cameras, wall detectors, line & rotary lasers, optical levels, inclinometers, and accessories.",
    ],
  },
  {
    key: "products.empty.paragraph",
    oldValues: [
      "Try clearing one or more filters or contact our sales desk \u2014 we stock thousands of additional SKUs offline.",
    ],
  },
  { key: "productDetail.assuranceTitle", oldValues: ["100% Genuine Authorized Dealer Guarantee"] },
  {
    key: "productDetail.assuranceText",
    oldValues: [
      "Supplied with official manufacturer warranty, GST tax invoice, and authorized service support from Mek Engineering Corporation.",
    ],
  },
  {
    key: "categories.hero.paragraph",
    oldValues: [
      "Explore our comprehensive range of Bosch Professional measuring instruments and accessories organized by category.",
    ],
  },
  {
    key: "subcategories.hero.paragraph",
    oldValues: [
      "Drill down into specialized Bosch Professional measuring tool classes across laser rangefinders, thermal cameras, radar detectors, line/rotary lasers, optical levels, and accessories.",
    ],
  },
  { key: "brands.pillar1.title", oldValues: ["100% Authentic"] },
  {
    key: "brands.pillar1.text",
    oldValues: [
      "No grey market imports. Only genuine factory-sealed products direct from manufacturers.",
    ],
  },
  { key: "brands.pillar2.title", oldValues: ["Full Warranty"] },
  { key: "brands.pillar3.title", oldValues: ["Service Support"] },
  { key: "about.stat1.value", oldValues: ["55+"] },
  { key: "about.stat1.label", oldValues: ["Years of Legacy"] },
  { key: "about.stat2.value", oldValues: ["10k+"] },
  { key: "about.stat2.label", oldValues: ["Products Cataloged"] },
  { key: "about.stat3.value", oldValues: ["5k+"] },
  { key: "about.stat3.label", oldValues: ["Happy Clients"] },
  { key: "about.stat4.value", oldValues: ["20+"] },
  { key: "about.stat4.label", oldValues: ["Partner Brands"] },
  { key: "about.why.card1Title", oldValues: ["Authenticity Guaranteed"] },
  {
    key: "about.why.card1Text",
    oldValues: [
      "We are official authorized dealers. 100% genuine products sourced directly from manufacturers.",
    ],
  },
  { key: "about.why.card3Title", oldValues: ["Rapid Logistics"] },
  {
    key: "about.why.card3Text",
    oldValues: [
      "Ready stock in Ranigunj, Secunderabad ensuring fast dispatch so your jobsite never stalls.",
    ],
  },
  {
    key: "contact.form.paragraph",
    oldValues: [
      "Fill out the inquiry form below and our sales engineers will respond promptly via email or phone.",
    ],
  },
];

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

  // 1b. Scrub untouched legacy dummy site_content values from earlier seed versions
  const defaultMap = new Map(DEFAULT_SITE_CONTENT.map((i) => [i.key, i.value]));
  const contentCleanups = LEGACY_DUMMY_CONTENT_REPLACEMENTS.flatMap(({ key, oldValues }) => {
    const nextVal = defaultMap.get(key);
    if (nextVal === undefined) return [];
    return oldValues.map((oldVal) => ({
      sql: `UPDATE site_content SET value = ?, updated_at = ? WHERE key = ? AND value = ?`,
      args: [nextVal, now, key, oldVal],
    }));
  });
  if (contentCleanups.length > 0) {
    await client.batch(contentCleanups, "write");
  }

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

  // 2b. Upgrade legacy measuring-only page_seo titles if untouched
  for (const seo of DEFAULT_PAGE_SEO) {
    await client.execute({
      sql: `UPDATE page_seo
            SET title = ?, description = ?, keywords = ?, og_title = ?, og_description = ?, updated_at = ?
            WHERE route = ? AND (title LIKE '%Bosch Measuring%' OR title LIKE '%55+ Years%')`,
      args: [
        seo.title,
        seo.description,
        seo.keywords,
        seo.ogTitle,
        seo.ogDescription,
        now,
        seo.route,
      ],
    });
  }

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
  } else {
    // Scrub fabricated dummy per-brand authorized_since years and measuring-only Bosch description
    await client.execute({
      sql: `UPDATE brands
            SET authorized_since = '', updated_at = ?
            WHERE authorized_since IN ('1985', '1998', '1975', '2012', '2015', '2005')`,
      args: [now],
    });
    const boschDefault = DEFAULT_BRANDS.find((b) => b.slug === "bosch");
    if (boschDefault) {
      await client.execute({
        sql: `UPDATE brands
              SET tagline = ?, description = ?, updated_at = ?
              WHERE slug = 'bosch' AND description LIKE 'Official authorized distributor for Bosch Professional (Blue) measuring devices%'`,
        args: [boschDefault.tagline, boschDefault.description, now],
      });
    }
  }

  // 5. Replace any em dashes (U+2014 / char(8212)) with normal hyphens across all DB text columns
  const emDashColumnGroups: Array<{ table: string; cols: string[] }> = [
    { table: "site_content", cols: ["value", "label"] },
    { table: "page_seo", cols: ["title", "description", "og_title", "og_description"] },
    { table: "hero_slides", cols: ["badge", "title_part1", "title_highlight", "title_part2", "subtitle"] },
    { table: "categories", cols: ["name", "badge", "short_description", "description", "meta_title", "meta_description"] },
    { table: "subcategories", cols: ["name", "short_description", "description", "meta_title", "meta_description"] },
    { table: "brands", cols: ["name", "tagline", "description", "meta_title", "meta_description"] },
    { table: "products", cols: ["name", "short_description", "description", "badge", "specs_json", "features_json", "meta_title", "meta_description"] },
  ];

  const emDashStatements = emDashColumnGroups.map(({ table, cols }) => {
    const sets = cols.map((c) => `${c} = REPLACE(${c}, char(8212), '-')`).join(", ");
    const where = cols.map((c) => `${c} LIKE '%' || char(8212) || '%'`).join(" OR ");
    return { sql: `UPDATE ${table} SET ${sets} WHERE ${where}`, args: [] };
  });
  await client.batch(emDashStatements, "write");
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
