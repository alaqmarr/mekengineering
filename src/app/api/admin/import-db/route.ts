import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient, type Client } from "@libsql/client";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { isAdminAuthenticated } from "@/auth";
import { ensureDbReady, libsql } from "@/db";

const MAX_DB_BYTES = 64 * 1024 * 1024; // 64 MB
const SQLITE_MAGIC = "SQLite format 3\0";

function str(val: unknown, fallback = ""): string {
  if (val === null || val === undefined) return fallback;
  return String(val).replace(/\u2014/g, "-");
}

function num(val: unknown, fallback = 0): number {
  if (val === null || val === undefined) return fallback;
  const parsed = Number(val);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function boolInt(val: unknown, fallback = 1): number {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "boolean") return val ? 1 : 0;
  const parsed = Number(val);
  if (Number.isFinite(parsed)) return parsed ? 1 : 0;
  return fallback;
}

async function cleanupTempDb(filePath: string) {
  for (const suffix of ["", "-wal", "-shm"]) {
    try {
      await fs.unlink(`${filePath}${suffix}`);
    } catch {
      // Ignore missing sidecar files
    }
  }
}

/**
 * GET /api/admin/import-db
 * Exports a clean standalone SQLite (.db) snapshot containing catalog tables
 * (categories, subcategories, products, brands) with sensitive auth/secret tables scrubbed.
 */
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureDbReady();
  const tmpExportPath = path.join(
    os.tmpdir(),
    `mekeng-catalog-export-${randomUUID()}.db`
  );
  let exportClient: Client | null = null;

  try {
    const escapedPath = tmpExportPath.replace(/'/g, "''");
    await libsql.execute(`VACUUM INTO '${escapedPath}';`);

    exportClient = createClient({ url: pathToFileURL(tmpExportPath).href });
    await exportClient.executeMultiple(`
      DELETE FROM users;
      DELETE FROM system_secrets;
      DELETE FROM inquiries;
      VACUUM;
    `);
    exportClient.close();
    exportClient = null;

    const buffer = await fs.readFile(tmpExportPath);
    const stamp = new Date().toISOString().slice(0, 10);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.sqlite3",
        "Content-Disposition": `attachment; filename="mekengineering-catalog-${stamp}.db"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[Export DB API]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to export .db snapshot" },
      { status: 500 }
    );
  } finally {
    if (exportClient) {
      try {
        exportClient.close();
      } catch {
        // Ignore close errors
      }
    }
    await cleanupTempDb(tmpExportPath);
  }
}

/**
 * POST /api/admin/import-db
 * Uploads a SQLite (.db) file and copies Categories, Subcategories, and Products
 * (plus any referenced Brands) into the active database, remapping foreign keys by slug.
 */
export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let tmpImportPath = "";
  let sourceClient: Client | null = null;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const mode = formData.get("mode") === "replace" ? "replace" : "merge";

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Please select a valid SQLite .db file to upload." },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "Uploaded .db file is empty." }, { status: 400 });
    }

    if (file.size > MAX_DB_BYTES) {
      return NextResponse.json(
        { error: "Database file exceeds 64MB upload limit." },
        { status: 400 }
      );
    }

    const arrayBuf = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    // Verify 16-byte SQLite v3 header
    const header = buffer.subarray(0, 16).toString("utf8");
    if (header !== SQLITE_MAGIC) {
      return NextResponse.json(
        { error: "Invalid file header. Only SQLite 3 (.db / .sqlite) files are supported." },
        { status: 400 }
      );
    }

    tmpImportPath = path.join(
      os.tmpdir(),
      `mekeng-catalog-import-${randomUUID()}.db`
    );
    await fs.writeFile(tmpImportPath, buffer);

    sourceClient = createClient({ url: pathToFileURL(tmpImportPath).href });

    // Check required tables in source .db
    const tablesRes = await sourceClient.execute(
      "SELECT name FROM sqlite_master WHERE type = 'table'"
    );
    const tableNames = new Set(tablesRes.rows.map((r) => String(r.name)));

    for (const required of ["categories", "subcategories", "products"]) {
      if (!tableNames.has(required)) {
        return NextResponse.json(
          {
            error: `Uploaded .db file is missing required table "${required}". Found tables: ${
              Array.from(tableNames).join(", ") || "none"
            }`,
          },
          { status: 400 }
        );
      }
    }

    // Read source tables
    const srcCategoriesRes = await sourceClient.execute(
      "SELECT * FROM categories ORDER BY sort_order ASC, id ASC"
    );
    const srcSubcategoriesRes = await sourceClient.execute(
      "SELECT * FROM subcategories ORDER BY sort_order ASC, id ASC"
    );
    const srcProductsRes = await sourceClient.execute(
      "SELECT * FROM products ORDER BY sort_order ASC, id ASC"
    );
    const srcBrandsRes = tableNames.has("brands")
      ? await sourceClient.execute("SELECT * FROM brands ORDER BY sort_order ASC, id ASC")
      : { rows: [] };

    await ensureDbReady();
    const nowIso = new Date().toISOString();

    if (mode === "replace") {
      await libsql.batch(
        [
          { sql: "DELETE FROM products", args: [] },
          { sql: "DELETE FROM subcategories", args: [] },
          { sql: "DELETE FROM categories", args: [] },
        ],
        "write"
      );
    }

    // 1. Ensure referenced brands exist in target DB so product brand_id foreign keys map cleanly
    const sourceBrandSlugById = new Map<number, string>();
    for (const b of srcBrandsRes.rows) {
      const slug = str(b.slug).trim();
      if (!slug) continue;
      sourceBrandSlugById.set(num(b.id), slug);

      await libsql.execute({
        sql: `INSERT INTO brands (
                name, slug, tagline, description, logo_url, banner_url, website_url,
                authorized_since, rating, featured, sort_order, meta_title, meta_description, og_image,
                created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(slug) DO NOTHING`,
        args: [
          str(b.name, slug),
          slug,
          str(b.tagline, "Authorized Industrial Partner"),
          str(b.description),
          str(b.logo_url),
          str(b.banner_url),
          str(b.website_url),
          str(b.authorized_since, "1968"),
          num(b.rating, 5),
          boolInt(b.featured, 1),
          num(b.sort_order, 0),
          str(b.meta_title),
          str(b.meta_description),
          str(b.og_image),
          str(b.created_at, nowIso),
          nowIso,
        ],
      });
    }

    const targetBrandsRes = await libsql.execute("SELECT id, slug FROM brands");
    const targetBrandIdBySlug = new Map<string, number>();
    for (const b of targetBrandsRes.rows) {
      targetBrandIdBySlug.set(str(b.slug), num(b.id));
    }

    // 2. Copy / Upsert Categories
    const sourceCatSlugById = new Map<number, string>();
    let importedCategories = 0;

    for (const c of srcCategoriesRes.rows) {
      const slug = str(c.slug).trim();
      const name = str(c.name).trim();
      if (!slug || !name) continue;

      sourceCatSlugById.set(num(c.id), slug);

      await libsql.execute({
        sql: `INSERT INTO categories (
                name, slug, badge, short_description, description, image_url,
                featured, sort_order, meta_title, meta_description, og_image,
                created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(slug) DO UPDATE SET
                name = excluded.name,
                badge = excluded.badge,
                short_description = excluded.short_description,
                description = excluded.description,
                image_url = CASE WHEN excluded.image_url != '' THEN excluded.image_url ELSE categories.image_url END,
                featured = excluded.featured,
                sort_order = excluded.sort_order,
                meta_title = excluded.meta_title,
                meta_description = excluded.meta_description,
                og_image = CASE WHEN excluded.og_image != '' THEN excluded.og_image ELSE categories.og_image END,
                updated_at = excluded.updated_at`,
        args: [
          name,
          slug,
          str(c.badge, "Industrial Line"),
          str(c.short_description),
          str(c.description),
          str(c.image_url),
          boolInt(c.featured, 1),
          num(c.sort_order, 0),
          str(c.meta_title),
          str(c.meta_description),
          str(c.og_image),
          str(c.created_at, nowIso),
          nowIso,
        ],
      });
      importedCategories++;
    }

    const targetCategoriesRes = await libsql.execute("SELECT id, slug FROM categories");
    const targetCatIdBySlug = new Map<string, number>();
    for (const c of targetCategoriesRes.rows) {
      targetCatIdBySlug.set(str(c.slug), num(c.id));
    }

    // 3. Copy / Upsert Subcategories (remapping category_id by category slug)
    const sourceSubSlugById = new Map<number, string>();
    let importedSubcategories = 0;

    for (const sc of srcSubcategoriesRes.rows) {
      const slug = str(sc.slug).trim();
      const name = str(sc.name).trim();
      if (!slug || !name) continue;

      const parentSlug = sourceCatSlugById.get(num(sc.category_id));
      const targetCategoryId = parentSlug ? targetCatIdBySlug.get(parentSlug) : undefined;
      if (!targetCategoryId) continue;

      sourceSubSlugById.set(num(sc.id), slug);

      await libsql.execute({
        sql: `INSERT INTO subcategories (
                category_id, name, slug, short_description, description, image_url,
                featured, sort_order, meta_title, meta_description, og_image,
                created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(slug) DO UPDATE SET
                category_id = excluded.category_id,
                name = excluded.name,
                short_description = excluded.short_description,
                description = excluded.description,
                image_url = CASE WHEN excluded.image_url != '' THEN excluded.image_url ELSE subcategories.image_url END,
                featured = excluded.featured,
                sort_order = excluded.sort_order,
                meta_title = excluded.meta_title,
                meta_description = excluded.meta_description,
                og_image = CASE WHEN excluded.og_image != '' THEN excluded.og_image ELSE subcategories.og_image END,
                updated_at = excluded.updated_at`,
        args: [
          targetCategoryId,
          name,
          slug,
          str(sc.short_description),
          str(sc.description),
          str(sc.image_url),
          boolInt(sc.featured, 1),
          num(sc.sort_order, 0),
          str(sc.meta_title),
          str(sc.meta_description),
          str(sc.og_image),
          str(sc.created_at, nowIso),
          nowIso,
        ],
      });
      importedSubcategories++;
    }

    const targetSubcategoriesRes = await libsql.execute(
      "SELECT id, slug FROM subcategories"
    );
    const targetSubIdBySlug = new Map<string, number>();
    for (const sc of targetSubcategoriesRes.rows) {
      targetSubIdBySlug.set(str(sc.slug), num(sc.id));
    }

    // 4. Copy / Upsert Products (remapping category_id, subcategory_id & brand_id by slug)
    let importedProducts = 0;

    for (const p of srcProductsRes.rows) {
      const slug = str(p.slug).trim();
      const name = str(p.name).trim();
      if (!slug || !name) continue;

      const catSlug =
        p.category_id !== null && p.category_id !== undefined
          ? sourceCatSlugById.get(num(p.category_id))
          : undefined;
      const subSlug =
        p.subcategory_id !== null && p.subcategory_id !== undefined
          ? sourceSubSlugById.get(num(p.subcategory_id))
          : undefined;
      const brandSlug =
        p.brand_id !== null && p.brand_id !== undefined
          ? sourceBrandSlugById.get(num(p.brand_id))
          : undefined;

      const targetCategoryId = catSlug ? targetCatIdBySlug.get(catSlug) ?? null : null;
      const targetSubcategoryId = subSlug ? targetSubIdBySlug.get(subSlug) ?? null : null;
      const targetBrandId = brandSlug
        ? targetBrandIdBySlug.get(brandSlug) ?? null
        : targetBrandIdBySlug.get("bosch") ?? null;

      await libsql.execute({
        sql: `INSERT INTO products (
                name, slug, sku, model_number, short_description, description,
                price_text, in_stock, featured, badge, category_id, subcategory_id,
                brand_id, image_url, gallery_json, specs_json, features_json,
                datasheet_url, sort_order, meta_title, meta_description, og_image,
                created_at, updated_at
              ) VALUES (
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?
              )
              ON CONFLICT(slug) DO UPDATE SET
                name = excluded.name,
                sku = excluded.sku,
                model_number = excluded.model_number,
                short_description = excluded.short_description,
                description = excluded.description,
                price_text = excluded.price_text,
                in_stock = excluded.in_stock,
                featured = excluded.featured,
                badge = excluded.badge,
                category_id = excluded.category_id,
                subcategory_id = excluded.subcategory_id,
                brand_id = COALESCE(excluded.brand_id, products.brand_id),
                image_url = CASE WHEN excluded.image_url != '' THEN excluded.image_url ELSE products.image_url END,
                gallery_json = CASE WHEN excluded.gallery_json != '[]' AND excluded.gallery_json != '' THEN excluded.gallery_json ELSE products.gallery_json END,
                specs_json = excluded.specs_json,
                features_json = excluded.features_json,
                datasheet_url = CASE WHEN excluded.datasheet_url != '' THEN excluded.datasheet_url ELSE products.datasheet_url END,
                sort_order = excluded.sort_order,
                meta_title = excluded.meta_title,
                meta_description = excluded.meta_description,
                og_image = CASE WHEN excluded.og_image != '' THEN excluded.og_image ELSE products.og_image END,
                updated_at = excluded.updated_at`,
        args: [
          name,
          slug,
          str(p.sku),
          str(p.model_number),
          str(p.short_description),
          str(p.description),
          str(p.price_text),
          boolInt(p.in_stock, 1),
          boolInt(p.featured, 0),
          str(p.badge),
          targetCategoryId,
          targetSubcategoryId,
          targetBrandId,
          str(p.image_url),
          str(p.gallery_json, "[]"),
          str(p.specs_json, "[]"),
          str(p.features_json, "[]"),
          str(p.datasheet_url),
          num(p.sort_order, 0),
          str(p.meta_title),
          str(p.meta_description),
          str(p.og_image),
          str(p.created_at, nowIso),
          nowIso,
        ],
      });
      importedProducts++;
    }

    await libsql.execute("PRAGMA wal_checkpoint(PASSIVE);");

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/categories");
    revalidatePath("/subcategories");
    revalidatePath("/brands");
    revalidatePath("/admin");

    return NextResponse.json({
      ok: true,
      mode,
      fileName: file.name,
      imported: {
        categories: importedCategories,
        subcategories: importedSubcategories,
        products: importedProducts,
      },
    });
  } catch (err) {
    console.error("[Import DB API]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to import categories, subcategories, and products from .db file.",
      },
      { status: 500 }
    );
  } finally {
    if (sourceClient) {
      try {
        sourceClient.close();
      } catch {
        // Ignore close errors
      }
    }
    if (tmpImportPath) {
      await cleanupTempDb(tmpImportPath);
    }
  }
}
