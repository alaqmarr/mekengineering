import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import {
  buildRouteMetadata,
  getAllBrandsWithCounts,
  getAllCategoriesWithCounts,
  getAllSubcategoriesWithDetails,
  getEnrichedProducts,
} from "@/db/queries";
import { ProductsCatalogClient } from "@/components/catalog/ProductsCatalogClient";
import { EditableText } from "@/components/cms/Editable";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata("/products");
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    subcategory?: string;
    brand?: string;
    q?: string;
  }>;
}) {
  const [sp, products, categories, subcategories, brands] = await Promise.all([
    searchParams,
    getEnrichedProducts(),
    getAllCategoriesWithCounts(),
    getAllSubcategoriesWithDetails(),
    getAllBrandsWithCounts(),
  ]);

  return (
    <div className="min-h-screen bg-secondary/30 pt-28 pb-24">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-primary">Products</span>
        </nav>

        {/* Page Header */}
        <div className="mb-12 max-w-3xl">
          <EditableText
            contentKey="products.hero.badge"
            fallback="Industrial Catalog"
            label="Products Page Eyebrow Badge"
            section="products"
            as="span"
            className="text-primary font-bold uppercase tracking-widest text-xs mb-2 block"
          />
          <EditableText
            contentKey="products.hero.heading"
            fallback="All Industrial Products"
            label="Products Page Main Heading"
            section="products"
            as="h1"
            className="text-4xl md:text-5xl font-heading font-bold uppercase tracking-tight text-foreground mb-4"
          />
          <EditableText
            contentKey="products.hero.paragraph"
            fallback="Explore our complete range of power tools, hand tools, precision measuring instruments, and heavy workshop machinery from authorized global brands."
            label="Products Page Description"
            section="products"
            type="textarea"
            as="p"
            className="text-muted-foreground text-base md:text-lg leading-relaxed"
          />
        </div>

        {/* Interactive Filtered Catalog */}
        <ProductsCatalogClient
          products={products}
          categories={categories}
          subcategories={subcategories}
          brands={brands}
          initialCategory={sp.category || ""}
          initialSubcategory={sp.subcategory || ""}
          initialBrand={sp.brand || ""}
          initialQuery={sp.q || ""}
        />
      </div>
    </div>
  );
}
