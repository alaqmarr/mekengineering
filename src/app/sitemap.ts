import type { MetadataRoute } from "next";
import {
  getAllBrandsWithCounts,
  getAllCategoriesWithCounts,
  getAllSubcategoriesWithDetails,
  getEnrichedProducts,
  getSiteBaseUrl,
} from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [siteUrl, products, categories, subcategories, brands] =
    await Promise.all([
      getSiteBaseUrl(),
      getEnrichedProducts(),
      getAllCategoriesWithCounts(),
      getAllSubcategoriesWithDetails(),
      getAllBrandsWithCounts(),
    ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${siteUrl}/products`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${siteUrl}/categories`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/subcategories`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${siteUrl}/brands`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${siteUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${siteUrl}/products/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${siteUrl}/categories/${c.slug}`,
    lastModified: c.updatedAt ? new Date(c.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const subcategoryRoutes: MetadataRoute.Sitemap = subcategories.map((s) => ({
    url: `${siteUrl}/subcategories/${s.slug}`,
    lastModified: s.updatedAt ? new Date(s.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  const brandRoutes: MetadataRoute.Sitemap = brands.map((b) => ({
    url: `${siteUrl}/brands/${b.slug}`,
    lastModified: b.updatedAt ? new Date(b.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...subcategoryRoutes,
    ...brandRoutes,
    ...productRoutes,
  ];
}
