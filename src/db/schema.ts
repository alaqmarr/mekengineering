import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const siteContent = sqliteTable(
  "site_content",
  {
    key: text("key").primaryKey(),
    value: text("value").notNull(),
    type: text("type").notNull().default("text"), // text | textarea | image | url | color
    label: text("label").notNull(),
    section: text("section").notNull().default("global"),
    updatedAt: text("updated_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [index("idx_site_content_section").on(table.section)]
);

export const pageSeo = sqliteTable("page_seo", {
  route: text("route").primaryKey(), // "/", "/products", "/categories", "/subcategories", "/brands", "/about", "/contact"
  title: text("title").notNull(),
  description: text("description").notNull(),
  keywords: text("keywords").notNull().default(""),
  ogTitle: text("og_title").notNull().default(""),
  ogDescription: text("og_description").notNull().default(""),
  ogImage: text("og_image").notNull().default("/images/carousel/store-interior.png"),
  canonicalUrl: text("canonical_url").notNull().default(""),
  noIndex: integer("no_index", { mode: "boolean" }).notNull().default(false),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const heroSlides = sqliteTable("hero_slides", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  badge: text("badge").notNull().default("Premium Industrial Supply"),
  titlePart1: text("title_part1").notNull().default(""),
  titleHighlight: text("title_highlight").notNull().default(""),
  titlePart2: text("title_part2").notNull().default(""),
  subtitle: text("subtitle").notNull().default(""),
  primaryCtaText: text("primary_cta_text").notNull().default("View Catalog"),
  primaryCtaHref: text("primary_cta_href").notNull().default("/products"),
  secondaryCtaText: text("secondary_cta_text").notNull().default("Contact Us"),
  secondaryCtaHref: text("secondary_cta_href").notNull().default("/contact"),
  imageUrl: text("image_url").notNull().default("/images/carousel/store-interior.png"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const categories = sqliteTable(
  "categories",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    badge: text("badge").notNull().default("Industrial Line"),
    shortDescription: text("short_description").notNull().default(""),
    description: text("description").notNull().default(""),
    imageUrl: text("image_url").notNull().default(""),
    featured: integer("featured", { mode: "boolean" }).notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    metaTitle: text("meta_title").notNull().default(""),
    metaDescription: text("meta_description").notNull().default(""),
    ogImage: text("og_image").notNull().default(""),
    createdAt: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [index("idx_categories_slug").on(table.slug)]
);

export const subcategories = sqliteTable(
  "subcategories",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    shortDescription: text("short_description").notNull().default(""),
    description: text("description").notNull().default(""),
    imageUrl: text("image_url").notNull().default(""),
    featured: integer("featured", { mode: "boolean" }).notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    metaTitle: text("meta_title").notNull().default(""),
    metaDescription: text("meta_description").notNull().default(""),
    ogImage: text("og_image").notNull().default(""),
    createdAt: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [
    index("idx_subcategories_slug").on(table.slug),
    index("idx_subcategories_category_id").on(table.categoryId),
  ]
);

export const brands = sqliteTable(
  "brands",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    tagline: text("tagline").notNull().default("Authorized Industrial Partner"),
    description: text("description").notNull().default(""),
    logoUrl: text("logo_url").notNull().default(""),
    bannerUrl: text("banner_url").notNull().default(""),
    websiteUrl: text("website_url").notNull().default(""),
    authorizedSince: text("authorized_since").notNull().default("1968"),
    rating: integer("rating").notNull().default(5),
    featured: integer("featured", { mode: "boolean" }).notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    metaTitle: text("meta_title").notNull().default(""),
    metaDescription: text("meta_description").notNull().default(""),
    ogImage: text("og_image").notNull().default(""),
    createdAt: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [index("idx_brands_slug").on(table.slug)]
);

export const products = sqliteTable(
  "products",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    sku: text("sku").notNull().default(""),
    modelNumber: text("model_number").notNull().default(""),
    shortDescription: text("short_description").notNull().default(""),
    description: text("description").notNull().default(""),
    priceText: text("price_text").notNull().default(""),
    inStock: integer("in_stock", { mode: "boolean" }).notNull().default(true),
    featured: integer("featured", { mode: "boolean" }).notNull().default(true),
    badge: text("badge").notNull().default(""),
    categoryId: integer("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    subcategoryId: integer("subcategory_id").references(() => subcategories.id, {
      onDelete: "set null",
    }),
    brandId: integer("brand_id").references(() => brands.id, {
      onDelete: "set null",
    }),
    imageUrl: text("image_url").notNull().default(""),
    galleryJson: text("gallery_json").notNull().default("[]"),
    specsJson: text("specs_json").notNull().default("[]"),
    featuresJson: text("features_json").notNull().default("[]"),
    datasheetUrl: text("datasheet_url").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
    metaTitle: text("meta_title").notNull().default(""),
    metaDescription: text("meta_description").notNull().default(""),
    ogImage: text("og_image").notNull().default(""),
    createdAt: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [
    index("idx_products_slug").on(table.slug),
    index("idx_products_category").on(table.categoryId),
    index("idx_products_subcategory").on(table.subcategoryId),
    index("idx_products_brand").on(table.brandId),
  ]
);

export const inquiries = sqliteTable("inquiries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  company: text("company").notNull().default(""),
  subject: text("subject").notNull().default("General Inquiry"),
  message: text("message").notNull(),
  productId: integer("product_id"),
  productName: text("product_name").notNull().default(""),
  status: text("status").notNull().default("new"), // new | read | replied | archived
  emailSent: integer("email_sent", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// Server-only table for sensitive integration credentials (Cloudflare R2, Nodemailer SMTP, etc.)
// Never serialized into public client props!
export const systemSecrets = sqliteTable("system_secrets", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export type User = typeof users.$inferSelect;
export type SiteContentItem = typeof siteContent.$inferSelect;
export type PageSeoItem = typeof pageSeo.$inferSelect;
export type HeroSlide = typeof heroSlides.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Subcategory = typeof subcategories.$inferSelect;
export type Brand = typeof brands.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Inquiry = typeof inquiries.$inferSelect;
export type SystemSecret = typeof systemSecrets.$inferSelect;
