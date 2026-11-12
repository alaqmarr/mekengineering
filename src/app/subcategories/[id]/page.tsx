import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import {
  getAllCategoriesWithCounts,
  getSiteBaseUrl,
  getSiteContentMap,
  getSubcategoryByIdOrSlug,
} from "@/db/queries";
import { resolveAbsoluteUrl } from "@/lib/utils";
import {
  EditableEntityText,
  EditableImageTrigger,
  EditableText,
} from "@/components/cms/Editable";
import { TaxonomyDetailAdminBar } from "@/components/cms/EntityQuickModal";
import { ProductCard } from "@/components/catalog/ProductCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const sub = await getSubcategoryByIdOrSlug(id);
  if (!sub) return { title: "Subcategory Not Found" };

  const content = await getSiteContentMap();
  const siteUrl = await getSiteBaseUrl(content);
  const title =
    sub.metaTitle ||
    `${sub.name}${sub.category ? ` — ${sub.category.name}` : ""}`;
  const description =
    sub.metaDescription || sub.shortDescription || sub.description.slice(0, 160);
  const ogImage = resolveAbsoluteUrl(
    sub.ogImage || sub.imageUrl || "/images/carousel/dewalt-site.png",
    siteUrl
  );
  const canonical = `${siteUrl}/subcategories/${sub.slug}`;

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
      images: [{ url: ogImage, width: 1200, height: 630, alt: sub.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function SubcategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sub = await getSubcategoryByIdOrSlug(id);
  if (!sub) notFound();

  const allCategories = await getAllCategoriesWithCounts();

  return (
    <div className="min-h-screen bg-secondary/20 pt-20 pb-24">
      {/* Subcategory Hero Banner */}
      <section className="relative bg-black py-24 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35"
          style={{
            backgroundImage: `url(${sub.imageUrl || "/images/carousel/dewalt-site.png"})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/50" />

        <div className="absolute top-6 right-6 z-30">
          <EditableImageTrigger
            label="Subcategory Banner Image"
            entity={{
              endpoint: "subcategories",
              id: sub.id,
              field: "imageUrl",
              currentValue: sub.imageUrl,
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <TaxonomyDetailAdminBar
            endpoint="subcategories"
            entityLabel="Subcategory"
            item={sub}
            parentCategories={allCategories}
          />

          <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href="/subcategories"
              className="hover:text-white transition-colors"
            >
              Subcategories
            </Link>
            {sub.category && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <Link
                  href={`/categories/${sub.category.slug}`}
                  className="hover:text-white transition-colors"
                >
                  {sub.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-primary">{sub.name}</span>
          </nav>

          {sub.category && (
            <Link
              href={`/categories/${sub.category.slug}`}
              className="inline-block border border-primary/60 bg-black/50 text-primary px-3.5 py-1 text-xs font-bold uppercase tracking-widest mb-4 hover:bg-primary hover:text-white transition-colors"
            >
              {sub.category.name}
            </Link>
          )}

          <EditableEntityText
            endpoint="subcategories"
            id={sub.id}
            field="name"
            value={sub.name}
            label="Subcategory Name"
            as="h1"
            className="text-4xl md:text-6xl font-heading font-bold uppercase tracking-tight text-white mb-4"
          />

          <EditableEntityText
            endpoint="subcategories"
            id={sub.id}
            field="description"
            value={sub.description || sub.shortDescription}
            label="Subcategory Description"
            type="textarea"
            as="p"
            className="text-slate-300 text-lg max-w-3xl leading-relaxed"
          />
        </div>
      </section>

      <div className="container mx-auto px-4 pt-14 space-y-12">
        {/* Sibling Subcategories Pills */}
        {sub.siblingSubcategories.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-2">
              Related in {sub.category?.name}:
            </span>
            {sub.siblingSubcategories.map((sib) => (
              <Link
                key={sib.id}
                href={`/subcategories/${sib.slug}`}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                  sib.id === sub.id
                    ? "bg-primary text-white"
                    : "bg-white border border-border text-foreground hover:border-primary"
                }`}
              >
                {sib.name}
              </Link>
            ))}
          </div>
        )}

        {/* Products */}
        <section>
          <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
            <EditableText
              contentKey="subcategoryDetail.productsHeading"
              fallback="Equipment in This Subcategory"
              label="Subcategory Products Heading"
              section="subcategories"
              as="h2"
              className="text-2xl md:text-3xl font-heading font-bold uppercase tracking-tight text-foreground"
            />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {sub.products.length} Products
            </span>
          </div>

          {sub.products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center px-4">
              <p className="text-muted-foreground text-sm mb-4">
                No equipment currently listed under {sub.name}. Contact us for wholesale inventory.
              </p>
              <Link
                href="/contact"
                className="inline-block rounded-lg bg-primary px-6 py-3 text-xs font-bold uppercase tracking-wider text-white"
              >
                Request Custom Quote
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sub.products.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
