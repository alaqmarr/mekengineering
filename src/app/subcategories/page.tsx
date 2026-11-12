import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import {
  buildRouteMetadata,
  getAllCategoriesWithCounts,
  getAllSubcategoriesWithDetails,
} from "@/db/queries";
import { SubcategoryCard } from "@/components/catalog/SubcategoryCard";
import { EditableText } from "@/components/cms/Editable";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata("/subcategories");
}

export default async function SubcategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const [sp, categories, allSubcategories] = await Promise.all([
    searchParams,
    getAllCategoriesWithCounts(),
    getAllSubcategoriesWithDetails(),
  ]);
  const activeCatSlug = sp.category || "";

  const filtered = activeCatSlug
    ? allSubcategories.filter(
        (s) =>
          s.category?.slug === activeCatSlug ||
          String(s.categoryId) === activeCatSlug
      )
    : allSubcategories;

  return (
    <div className="min-h-screen bg-secondary/30 pt-28 pb-24">
      <div className="container mx-auto px-4">
        <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-primary">Subcategories</span>
        </nav>

        <div className="text-center max-w-3xl mx-auto mb-12">
          <EditableText
            contentKey="subcategories.hero.badge"
            fallback="Precision Classification"
            label="Subcategories Badge"
            section="subcategories"
            as="span"
            className="text-primary font-bold uppercase tracking-widest text-xs mb-2 block"
          />
          <EditableText
            contentKey="subcategories.hero.heading"
            fallback="All Product Subcategories"
            label="Subcategories Heading"
            section="subcategories"
            as="h1"
            className="text-4xl md:text-5xl font-heading font-bold uppercase tracking-tight text-foreground mb-5"
          />
          <EditableText
            contentKey="subcategories.hero.paragraph"
            fallback="Drill down into specialized industrial tool classes across power tools, hand tools, metrology, abrasives, and workshop equipment."
            label="Subcategories Description"
            section="subcategories"
            type="textarea"
            as="p"
            className="text-muted-foreground text-lg leading-relaxed"
          />
        </div>

        {/* Parent Category Filter Pills */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-12">
          <Link
            href="/subcategories"
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
              !activeCatSlug
                ? "bg-primary text-white shadow-sm"
                : "bg-white border border-border text-foreground hover:border-primary"
            }`}
          >
            All Departments ({allSubcategories.length})
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/subcategories?category=${cat.slug}`}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                activeCatSlug === cat.slug
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white border border-border text-foreground hover:border-primary"
              }`}
            >
              {cat.name} ({cat.subcategoryCount})
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((sub) => (
            <SubcategoryCard key={sub.id} subcategory={sub} />
          ))}
        </div>
      </div>
    </div>
  );
}
