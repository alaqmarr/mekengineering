import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BadgeCheck, ChevronRight, ExternalLink } from "lucide-react";
import {
  getBrandByIdOrSlug,
  getSiteBaseUrl,
  getSiteContentMap,
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
  const brand = await getBrandByIdOrSlug(id);
  if (!brand) return { title: "Brand Not Found" };

  const content = await getSiteContentMap();
  const siteUrl = await getSiteBaseUrl(content);
  const title =
    brand.metaTitle || `Authorized ${brand.name} Dealer | Tools & Machinery`;
  const description =
    brand.metaDescription || brand.description || brand.tagline;
  const ogImage = resolveAbsoluteUrl(
    brand.ogImage || brand.bannerUrl || "/images/carousel/bosch-store.png",
    siteUrl
  );
  const canonical = `${siteUrl}/brands/${brand.slug}`;

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
      images: [{ url: ogImage, width: 1200, height: 630, alt: brand.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function BrandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const brand = await getBrandByIdOrSlug(id);
  if (!brand) notFound();

  return (
    <div className="min-h-screen bg-secondary/20 pt-20 pb-24">
      {/* Brand Hero */}
      <section className="relative bg-black py-24 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: `url(${brand.bannerUrl || "/images/carousel/bosch-store.png"})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/50" />

        <div className="absolute top-6 right-6 z-30">
          <EditableImageTrigger
            label="Brand Hero Banner"
            entity={{
              endpoint: "brands",
              id: brand.id,
              field: "bannerUrl",
              currentValue: brand.bannerUrl,
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <TaxonomyDetailAdminBar
            endpoint="brands"
            entityLabel="Brand"
            item={brand}
          />

          <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/brands" className="hover:text-white transition-colors">
              Brands
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-primary">{brand.name}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/60 bg-primary/15 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-primary">
              <BadgeCheck className="h-4 w-4" />
              Authorized Distributor Since {brand.authorizedSince || "1968"}
            </span>

            {brand.websiteUrl && (
              <a
                href={brand.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-3.5 py-1 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Manufacturer Portal <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          <EditableEntityText
            endpoint="brands"
            id={brand.id}
            field="name"
            value={brand.name}
            label="Brand Name"
            as="h1"
            className="text-5xl md:text-7xl font-heading font-black uppercase tracking-tight text-white mb-3"
          />

          <EditableEntityText
            endpoint="brands"
            id={brand.id}
            field="tagline"
            value={brand.tagline}
            label="Brand Tagline"
            as="p"
            className="text-primary font-bold uppercase tracking-widest text-sm mb-5"
          />

          <EditableEntityText
            endpoint="brands"
            id={brand.id}
            field="description"
            value={brand.description}
            label="Brand Description"
            type="textarea"
            as="p"
            className="text-slate-300 text-lg max-w-3xl leading-relaxed"
          />
        </div>
      </section>

      {/* Brand Catalog */}
      <div className="container mx-auto px-4 pt-16">
        <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
          <EditableText
            contentKey="brandDetail.productsHeading"
            fallback="Official Brand Catalog"
            label="Brand Products Heading"
            section="brands"
            as="h2"
            className="text-2xl md:text-3xl font-heading font-bold uppercase tracking-tight text-foreground"
          />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {brand.products.length} Products
          </span>
        </div>

        {brand.products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center px-4">
            <p className="text-muted-foreground text-sm mb-4">
              Looking for a specific {brand.name} tool or OEM spare part? We stock the full range at our Ranigunj showroom.
            </p>
            <Link
              href="/contact"
              className="inline-block rounded-lg bg-primary px-6 py-3 text-xs font-bold uppercase tracking-wider text-white"
            >
              Request {brand.name} Wholesale Price List
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {brand.products.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
