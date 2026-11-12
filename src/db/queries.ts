import { asc, desc, eq, or } from "drizzle-orm";
import type { Metadata } from "next";
import { db, ensureDbReady, libsql } from "./index";
import {
  users,
  siteContent,
  pageSeo,
  heroSlides,
  categories,
  subcategories,
  brands,
  products,
  inquiries,
  systemSecrets,
} from "./schema";
import { resolveAbsoluteUrl } from "@/lib/utils";

export async function hasAdminAccount(): Promise<boolean> {
  await ensureDbReady();
  const res = await libsql.execute("SELECT COUNT(*) as cnt FROM users");
  return Number(res.rows[0]?.cnt ?? 0) > 0;
}

export async function getSiteContentMap(): Promise<Record<string, string>> {
  await ensureDbReady();
  const rows = await db.select().from(siteContent).all();
  const map: Record<string, string> = {};
  for (const r of rows) {
    map[r.key] = r.value;
  }
  return map;
}

export async function getSiteBaseUrl(
  contentMap?: Record<string, string>
): Promise<string> {
  const map = contentMap ?? (await getSiteContentMap());
  const configured =
    map["site.url"] || process.env.NEXT_PUBLIC_SITE_URL || "https://mekengg.com";
  return configured.replace(/\/$/, "");
}

export async function getSystemSecretsMap(): Promise<Record<string, string>> {
  await ensureDbReady();
  const rows = await db.select().from(systemSecrets).all();
  const map: Record<string, string> = {};
  for (const r of rows) {
    map[r.key] = r.value;
  }
  return map;
}

export interface R2ConnectionConfig {
  slot: 1 | 2;
  enabled: boolean;
  verified: boolean;
  accountId: string;
  accountName: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
  apiToken: string;
}

export interface IntegrationCredentials {
  r2Connections: [R2ConnectionConfig, R2ConnectionConfig];
  r2AccountId: string;
  r2AccessKeyId: string;
  r2SecretAccessKey: string;
  r2BucketName: string;
  r2PublicUrl: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  smtpFromName: string;
  smtpFromEmail: string;
  adminNotificationEmail: string;
}

function parseSlotR2Config(
  slot: 1 | 2,
  secrets: Record<string, string>
): R2ConnectionConfig {
  const prefix = slot === 1 ? "r2" : "r2_2";
  const envPrefix = slot === 1 ? "R2" : "R2_2";

  const accountId = (
    secrets[`${prefix}.accountId`] ??
    process.env[`${envPrefix}_ACCOUNT_ID`] ??
    ""
  ).trim();
  const accountName = (secrets[`${prefix}.accountName`] ?? "").trim();
  const accessKeyId = (
    secrets[`${prefix}.accessKeyId`] ??
    process.env[`${envPrefix}_ACCESS_KEY_ID`] ??
    ""
  ).trim();
  const secretAccessKey = (
    secrets[`${prefix}.secretAccessKey`] ??
    process.env[`${envPrefix}_SECRET_ACCESS_KEY`] ??
    ""
  ).trim();
  const bucketName = (
    secrets[`${prefix}.bucketName`] ??
    process.env[`${envPrefix}_BUCKET_NAME`] ??
    ""
  ).trim();
  const publicUrl = (
    secrets[`${prefix}.publicUrl`] ??
    process.env[`${envPrefix}_PUBLIC_URL`] ??
    ""
  )
    .trim()
    .replace(/\/$/, "");
  const apiToken = (secrets[`${prefix}.apiToken`] ?? "").trim();

  const enabledRaw = secrets[`${prefix}.enabled`];
  const enabled =
    enabledRaw === undefined ? true : enabledRaw === "true" || enabledRaw === "1";

  const hasFullEnv = Boolean(
    !secrets[`${prefix}.accountId`] &&
      process.env[`${envPrefix}_ACCOUNT_ID`] &&
      process.env[`${envPrefix}_ACCESS_KEY_ID`] &&
      process.env[`${envPrefix}_SECRET_ACCESS_KEY`] &&
      process.env[`${envPrefix}_BUCKET_NAME`]
  );
  const verifiedRaw = secrets[`${prefix}.verified`];
  const verified =
    verifiedRaw === "true" ||
    verifiedRaw === "1" ||
    (verifiedRaw === undefined && hasFullEnv);

  return {
    slot,
    enabled,
    verified,
    accountId,
    accountName,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicUrl,
    apiToken,
  };
}

export async function getIntegrationCredentials(): Promise<IntegrationCredentials> {
  const [secrets, content] = await Promise.all([
    getSystemSecretsMap(),
    getSiteContentMap(),
  ]);

  const portStr = secrets["smtp.port"] || process.env.SMTP_PORT || "465";
  const port = Number.parseInt(portStr, 10) || 465;
  const secureRaw =
    secrets["smtp.secure"] ??
    process.env.SMTP_SECURE ??
    (port === 465 ? "true" : "false");

  const conn1 = parseSlotR2Config(1, secrets);
  const conn2 = parseSlotR2Config(2, secrets);

  return {
    r2Connections: [conn1, conn2],
    r2AccountId: conn1.accountId,
    r2AccessKeyId: conn1.accessKeyId,
    r2SecretAccessKey: conn1.secretAccessKey,
    r2BucketName: conn1.bucketName,
    r2PublicUrl: conn1.publicUrl,
    smtpHost: (secrets["smtp.host"] || process.env.SMTP_HOST || "smtp.gmail.com").trim(),
    smtpPort: port,
    smtpSecure: secureRaw === "true" || secureRaw === "1",
    smtpUser: (secrets["smtp.user"] || process.env.SMTP_USER || "").trim(),
    smtpPass: (secrets["smtp.pass"] || process.env.SMTP_PASS || "").trim(),
    smtpFromName: (
      secrets["smtp.fromName"] ||
      process.env.SMTP_FROM_NAME ||
      content["site.name"] ||
      "Mek Engineering Corporation"
    ).trim(),
    smtpFromEmail: (
      secrets["smtp.fromEmail"] ||
      process.env.SMTP_FROM_EMAIL ||
      secrets["smtp.user"] ||
      process.env.SMTP_USER ||
      "info@mekengg.com"
    ).trim(),
    adminNotificationEmail: (
      secrets["smtp.adminEmail"] ||
      process.env.ADMIN_NOTIFICATION_EMAIL ||
      content["contact.email"] ||
      "info@mekengg.com"
    ).trim(),
  };
}

export async function upsertSystemSecrets(
  entries: Record<string, string>
): Promise<void> {
  await ensureDbReady();
  const items = Object.entries(entries);
  if (items.length === 0) return;
  const now = new Date().toISOString();

  await libsql.batch(
    items.map(([key, value]) => ({
      sql: `INSERT INTO system_secrets (key, value, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      args: [key, value, now],
    })),
    "write"
  );
}

export async function getHeroSlides(includeInactive = false) {
  await ensureDbReady();
  const all = await db
    .select()
    .from(heroSlides)
    .orderBy(asc(heroSlides.sortOrder), asc(heroSlides.id))
    .all();
  return includeInactive ? all : all.filter((s) => s.isActive);
}

export async function getAllCategoriesWithCounts() {
  await ensureDbReady();
  const [allCats, allSubs, allProds] = await Promise.all([
    db
      .select()
      .from(categories)
      .orderBy(asc(categories.sortOrder), asc(categories.name))
      .all(),
    db.select().from(subcategories).all(),
    db.select().from(products).all(),
  ]);

  return allCats.map((cat) => ({
    ...cat,
    subcategoryCount: allSubs.filter((s) => s.categoryId === cat.id).length,
    productCount: allProds.filter((p) => p.categoryId === cat.id).length,
    subcategories: allSubs
      .filter((s) => s.categoryId === cat.id)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  }));
}

export async function getCategoryByIdOrSlug(idOrSlug: string) {
  await ensureDbReady();
  const decoded = decodeURIComponent(idOrSlug);
  const numericId = /^\d+$/.test(decoded) ? Number.parseInt(decoded, 10) : -1;
  const cat = await db
    .select()
    .from(categories)
    .where(
      numericId > 0
        ? or(eq(categories.id, numericId), eq(categories.slug, decoded))
        : eq(categories.slug, decoded)
    )
    .get();
  if (!cat) return null;

  const [subs, enriched] = await Promise.all([
    db
      .select()
      .from(subcategories)
      .where(eq(subcategories.categoryId, cat.id))
      .orderBy(asc(subcategories.sortOrder), asc(subcategories.name))
      .all(),
    getEnrichedProducts(),
  ]);

  const allProds = enriched.filter((p) => p.categoryId === cat.id);

  return {
    ...cat,
    subcategories: subs.map((s) => ({
      ...s,
      productCount: allProds.filter((p) => p.subcategoryId === s.id).length,
    })),
    products: allProds,
  };
}

export async function getAllSubcategoriesWithDetails() {
  await ensureDbReady();
  const [allSubs, allCats, allProds] = await Promise.all([
    db
      .select()
      .from(subcategories)
      .orderBy(asc(subcategories.sortOrder), asc(subcategories.name))
      .all(),
    db.select().from(categories).all(),
    db.select().from(products).all(),
  ]);

  const catMap = new Map(allCats.map((c) => [c.id, c]));

  return allSubs.map((sub) => ({
    ...sub,
    category: catMap.get(sub.categoryId) ?? null,
    productCount: allProds.filter((p) => p.subcategoryId === sub.id).length,
  }));
}

export async function getSubcategoryByIdOrSlug(idOrSlug: string) {
  await ensureDbReady();
  const decoded = decodeURIComponent(idOrSlug);
  const numericId = /^\d+$/.test(decoded) ? Number.parseInt(decoded, 10) : -1;
  const sub = await db
    .select()
    .from(subcategories)
    .where(
      numericId > 0
        ? or(eq(subcategories.id, numericId), eq(subcategories.slug, decoded))
        : eq(subcategories.slug, decoded)
    )
    .get();
  if (!sub) return null;

  const [category, siblingSubs, enriched] = await Promise.all([
    db.select().from(categories).where(eq(categories.id, sub.categoryId)).get(),
    db
      .select()
      .from(subcategories)
      .where(eq(subcategories.categoryId, sub.categoryId))
      .orderBy(asc(subcategories.sortOrder))
      .all(),
    getEnrichedProducts(),
  ]);

  const subProducts = enriched.filter((p) => p.subcategoryId === sub.id);

  return {
    ...sub,
    category: category ?? null,
    siblingSubcategories: siblingSubs,
    products: subProducts,
  };
}

export async function getAllBrandsWithCounts() {
  await ensureDbReady();
  const [allBrands, allProds] = await Promise.all([
    db
      .select()
      .from(brands)
      .orderBy(asc(brands.sortOrder), asc(brands.name))
      .all(),
    db.select().from(products).all(),
  ]);

  return allBrands.map((b) => ({
    ...b,
    productCount: allProds.filter((p) => p.brandId === b.id).length,
  }));
}

export async function getBrandByIdOrSlug(idOrSlug: string) {
  await ensureDbReady();
  const decoded = decodeURIComponent(idOrSlug);
  const numericId = /^\d+$/.test(decoded) ? Number.parseInt(decoded, 10) : -1;
  const brand = await db
    .select()
    .from(brands)
    .where(
      numericId > 0
        ? or(eq(brands.id, numericId), eq(brands.slug, decoded))
        : eq(brands.slug, decoded)
    )
    .get();
  if (!brand) return null;

  const enriched = await getEnrichedProducts();
  const brandProducts = enriched.filter((p) => p.brandId === brand.id);
  return {
    ...brand,
    products: brandProducts,
  };
}

export async function getEnrichedProducts() {
  await ensureDbReady();
  const [allProds, allCats, allSubs, allBrands] = await Promise.all([
    db
      .select()
      .from(products)
      .orderBy(asc(products.sortOrder), desc(products.id))
      .all(),
    db.select().from(categories).all(),
    db.select().from(subcategories).all(),
    db.select().from(brands).all(),
  ]);

  const catMap = new Map(allCats.map((c) => [c.id, c]));
  const subMap = new Map(allSubs.map((s) => [s.id, s]));
  const brandMap = new Map(allBrands.map((b) => [b.id, b]));

  return allProds.map((p) => ({
    ...p,
    category: p.categoryId ? (catMap.get(p.categoryId) ?? null) : null,
    subcategory: p.subcategoryId ? (subMap.get(p.subcategoryId) ?? null) : null,
    brand: p.brandId ? (brandMap.get(p.brandId) ?? null) : null,
  }));
}

export type EnrichedProduct = Awaited<ReturnType<typeof getEnrichedProducts>>[number];

export async function getProductByIdOrSlug(idOrSlug: string) {
  const decoded = decodeURIComponent(idOrSlug);
  const numericId = /^\d+$/.test(decoded) ? Number.parseInt(decoded, 10) : -1;
  const all = await getEnrichedProducts();
  const found = all.find(
    (p) => (numericId > 0 && p.id === numericId) || p.slug === decoded
  );
  if (!found) return null;

  const related = all
    .filter(
      (p) =>
        p.id !== found.id &&
        (p.categoryId === found.categoryId || p.brandId === found.brandId)
    )
    .slice(0, 4);

  return {
    ...found,
    related,
  };
}

export async function getAllInquiries() {
  await ensureDbReady();
  return db.select().from(inquiries).orderBy(desc(inquiries.id)).all();
}

export async function getAllPageSeo() {
  await ensureDbReady();
  return db.select().from(pageSeo).orderBy(asc(pageSeo.route)).all();
}

export async function buildRouteMetadata(route: string): Promise<Metadata> {
  await ensureDbReady();
  const content = await getSiteContentMap();
  const siteUrl = await getSiteBaseUrl(content);
  const siteName = content["site.name"] || "Mek Engineering Corporation";
  const seo = await db
    .select()
    .from(pageSeo)
    .where(eq(pageSeo.route, route))
    .get();

  const title =
    seo?.title || `${siteName} | Premium Power Tools & Industrial Machinery`;
  const description =
    seo?.description ||
    "Authorized Wholesale Dealer for Bosch, DeWalt, Taparia, CZAR Power Pro, and TEZ since 1968 in Secunderabad.";
  const ogTitle = seo?.ogTitle || title;
  const ogDescription = seo?.ogDescription || description;
  const ogImage = resolveAbsoluteUrl(
    seo?.ogImage || "/images/carousel/store-interior.png",
    siteUrl
  );
  const canonical = seo?.canonicalUrl || `${siteUrl}${route === "/" ? "" : route}`;

  return {
    title,
    description,
    keywords: seo?.keywords
      ? seo.keywords.split(",").map((k) => k.trim())
      : undefined,
    authors: [{ name: siteName, url: siteUrl }],
    alternates: {
      canonical,
    },
    robots: seo?.noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      siteName,
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: ogTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [ogImage],
    },
  };
}

export { users };
