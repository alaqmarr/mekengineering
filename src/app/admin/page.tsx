import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSafeSession, isAdminAuthenticated } from "@/auth";
import { getDbHealth } from "@/db";
import {
  getAllBrandsWithCounts,
  getAllCategoriesWithCounts,
  getAllInquiries,
  getAllPageSeo,
  getAllSubcategoriesWithDetails,
  getEnrichedProducts,
  getHeroSlides,
  getSiteContentMap,
  hasAdminAccount,
} from "@/db/queries";
import { buildMaskedIntegrationsResponse } from "@/lib/integrations";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Dashboard | Mek Engineering Corporation",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!(await hasAdminAccount())) {
    redirect("/setup");
  }

  if (!(await isAdminAuthenticated())) {
    redirect("/login");
  }

  const [
    session,
    dbHealth,
    products,
    categories,
    subcategories,
    brands,
    slides,
    inquiries,
    seo,
    content,
    maskedIntegrations,
  ] = await Promise.all([
    getSafeSession(),
    getDbHealth(),
    getEnrichedProducts(),
    getAllCategoriesWithCounts(),
    getAllSubcategoriesWithDetails(),
    getAllBrandsWithCounts(),
    getHeroSlides(true),
    getAllInquiries(),
    getAllPageSeo(),
    getSiteContentMap(),
    buildMaskedIntegrationsResponse(),
  ]);

  return (
    <AdminDashboardClient
      adminName={session?.user?.name || "Administrator"}
      adminEmail={session?.user?.email || "admin@mekengg.com"}
      journalMode={dbHealth.journalMode}
      initialProducts={products}
      initialCategories={categories}
      initialSubcategories={subcategories}
      initialBrands={brands}
      initialSlides={slides}
      initialInquiries={inquiries}
      initialSeo={seo}
      initialContent={content}
      initialIntegrations={maskedIntegrations}
    />
  );
}
