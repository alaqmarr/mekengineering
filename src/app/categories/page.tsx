import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { buildRouteMetadata, getAllCategoriesWithCounts } from "@/db/queries";
import { CategoryCard } from "@/components/catalog/CategoryCard";
import { EditableText } from "@/components/cms/Editable";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata("/categories");
}

export default async function CategoriesPage() {
  const categories = await getAllCategoriesWithCounts();

  return (
    <div className="min-h-screen bg-secondary/30 pt-28 pb-24">
      <div className="container mx-auto px-4">
        <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-primary">Categories</span>
        </nav>

        <div className="text-center max-w-3xl mx-auto mb-16">
          <EditableText
            contentKey="categories.hero.badge"
            fallback="Our Catalog"
            label="Categories Page Badge"
            section="categories"
            as="span"
            className="text-primary font-bold uppercase tracking-widest text-xs mb-2 block"
          />
          <EditableText
            contentKey="categories.hero.heading"
            fallback="Product Categories"
            label="Categories Page Heading"
            section="categories"
            as="h1"
            className="text-4xl md:text-5xl font-heading font-bold uppercase tracking-tight text-foreground mb-5"
          />
          <EditableText
            contentKey="categories.hero.paragraph"
            fallback="Explore our comprehensive range of professional-grade tools, precision instruments, and industrial machinery organized by department."
            label="Categories Page Description"
            section="categories"
            type="textarea"
            as="p"
            className="text-muted-foreground text-lg leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </div>
    </div>
  );
}
