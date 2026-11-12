import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import {
  getCategoryByIdOrSlug,
  getSiteBaseUrl,
  getSiteContentMap,
} from "@/db/queries";
import { resolveAbsoluteUrl } from "@/lib/utils";
import {
  EditableEntityText,
  EditableImageTrigger,
} from "@/components/cms/Editable";
import { TaxonomyDetailAdminBar } from "@/components/cms/EntityQuickModal";
import { CategoryProductsBrowser } from "@/components/catalog/CategoryProductsBrowser";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const cat = await getCategoryByIdOrSlug(id);
  if (!cat) return { title: "Category Not Found" };

  const content = await getSiteContentMap();
  const siteUrl = await getSiteBaseUrl(content);
  const title = cat.metaTitle || `${cat.name} | Industrial Category`;
  const description =
    cat.metaDescription || cat.shortDescription || cat.description.slice(0, 160);
  const ogImage = resolveAbsoluteUrl(
    cat.ogImage || cat.imageUrl || "/images/carousel/store-interior.png",
    siteUrl
  );
  const canonical = `${siteUrl}/categories/${cat.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: "en_IN",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: cat.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function CategoryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ subcategory?: string }>;
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const category = await getCategoryByIdOrSlug(id);
  if (!category) notFound();

  return (
    <div className="min-h-screen bg-secondary/20 pt-20 pb-24">
      {/* Category Hero Banner */}
      <section className="relative bg-black py-24 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35"
          style={{
            backgroundImage: `url(${category.imageUrl || "/images/carousel/store-interior.png"})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/50" />

        <div className="absolute top-6 right-6 z-30">
          <EditableImageTrigger
            label="Category Banner Image"
            entity={{
              endpoint: "categories",
              id: category.id,
              field: "imageUrl",
              currentValue: category.imageUrl,
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <TaxonomyDetailAdminBar
            endpoint="categories"
            entityLabel="Category"
            item={category}
          />

          <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/products" className="hover:text-white transition-colors">
              Products
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-primary">{category.name}</span>
          </nav>

          <div className="inline-block border border-primary/60 bg-black/50 text-primary px-3.5 py-1 text-xs font-bold uppercase tracking-widest mb-4">
            <EditableEntityText
              endpoint="categories"
              id={category.id}
              field="badge"
              value={category.badge}
              label="Category Badge"
            />
          </div>

          <EditableEntityText
            endpoint="categories"
            id={category.id}
            field="name"
            value={category.name}
            label="Category Title"
            as="h1"
            className="text-4xl md:text-6xl font-heading font-bold uppercase tracking-tight text-white mb-4"
          />

          <EditableEntityText
            endpoint="categories"
            id={category.id}
            field="description"
            value={category.description || category.shortDescription}
            label="Category Full Description"
            type="textarea"
            as="p"
            className="text-slate-300 text-lg max-w-3xl leading-relaxed"
          />
        </div>
      </section>

      <div className="container mx-auto px-4 pt-12">
        <CategoryProductsBrowser
          categoryName={category.name}
          subcategories={category.subcategories}
          products={category.products}
          initialSubcategory={sp.subcategory || ""}
        />
      </div>
    </div>
  );
}
