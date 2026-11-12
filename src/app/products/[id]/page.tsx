import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight, ShieldCheck, CheckCircle2, Tag, Cpu } from "lucide-react";
import {
  getAllBrandsWithCounts,
  getAllCategoriesWithCounts,
  getAllSubcategoriesWithDetails,
  getProductByIdOrSlug,
  getSiteBaseUrl,
  getSiteContentMap,
} from "@/db/queries";
import { resolveAbsoluteUrl, safeJsonParse } from "@/lib/utils";
import { EditableEntityText, EditableText } from "@/components/cms/Editable";
import { ProductDetailAdminBar } from "@/components/cms/EntityQuickModal";
import {
  ProductGallery,
  ProductQuoteActions,
} from "@/components/catalog/ProductQuoteActions";
import { ProductCard } from "@/components/catalog/ProductCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductByIdOrSlug(id);
  if (!product) {
    return { title: "Product Not Found" };
  }

  const content = await getSiteContentMap();
  const siteUrl = await getSiteBaseUrl(content);
  const siteName = content["site.name"] || "Mek Engineering Corporation";

  const title =
    product.metaTitle ||
    `${product.name}${product.brand ? ` | ${product.brand.name}` : ""}`;
  const description =
    product.metaDescription ||
    product.shortDescription ||
    product.description.slice(0, 160);
  const ogImage = resolveAbsoluteUrl(
    product.ogImage || product.imageUrl || "/images/carousel/store-interior.png",
    siteUrl
  );
  const canonical = `${siteUrl}/products/${product.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      locale: "en_IN",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductByIdOrSlug(id);
  if (!product) notFound();

  const [categories, subcategories, brands, content] = await Promise.all([
    getAllCategoriesWithCounts(),
    getAllSubcategoriesWithDetails(),
    getAllBrandsWithCounts(),
    getSiteContentMap(),
  ]);
  const siteUrl = await getSiteBaseUrl(content);

  const gallery = safeJsonParse<string[]>(product.galleryJson, []);
  const specs = safeJsonParse<Array<{ label: string; value: string }>>(
    product.specsJson,
    []
  );
  const features = safeJsonParse<string[]>(product.featuresJson, []);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku || undefined,
    mpn: product.modelNumber || undefined,
    description: product.shortDescription || product.description,
    image: resolveAbsoluteUrl(product.imageUrl, siteUrl),
    brand: product.brand
      ? {
          "@type": "Brand",
          name: product.brand.name,
        }
      : undefined,
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/products/${product.slug}`,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/PreOrder",
      seller: {
        "@type": "Organization",
        name: content["site.name"] || "Mek Engineering Corporation",
      },
    },
  };

  return (
    <div className="min-h-screen bg-secondary/20 pt-28 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <div className="container mx-auto px-4">
        {/* Individual Admin Toolbar right on this Product Page */}
        <ProductDetailAdminBar
          product={product}
          categories={categories}
          subcategories={subcategories}
          brands={brands}
        />

        {/* Breadcrumbs */}
        <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/products" className="hover:text-primary transition-colors">
            Products
          </Link>
          {product.category && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link
                href={`/categories/${product.category.slug}`}
                className="hover:text-primary transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          {product.subcategory && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link
                href={`/subcategories/${product.subcategory.slug}`}
                className="hover:text-primary transition-colors"
              >
                {product.subcategory.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-primary truncate max-w-[260px]">{product.name}</span>
        </nav>

        {/* Main Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white rounded-2xl border border-border p-6 md:p-10 shadow-xs">
          {/* Left: Gallery */}
          <div className="lg:col-span-6">
            <ProductGallery
              productId={product.id}
              productName={product.name}
              primaryImage={product.imageUrl}
              gallery={gallery}
            />
          </div>

          {/* Right: Summary & Actions */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Brand & Badge Row */}
              <div className="flex flex-wrap items-center gap-2.5">
                {product.brand && (
                  <Link
                    href={`/brands/${product.brand.slug}`}
                    className="inline-flex items-center gap-1.5 rounded bg-[#111318] hover:bg-primary px-3 py-1 text-xs font-heading font-bold uppercase tracking-widest text-white transition-colors"
                  >
                    {product.brand.name}
                  </Link>
                )}

                <EditableEntityText
                  endpoint="products"
                  id={product.id}
                  field="badge"
                  value={product.badge}
                  label="Product Highlight Badge"
                  placeholder="+ Add Badge"
                  className="inline-flex items-center gap-1 rounded bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary"
                />

                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                    product.inStock
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {product.inStock ? "Ready Stock" : "Order Basis"}
                </span>
              </div>

              {/* Product Title (Editable Inline) */}
              <EditableEntityText
                endpoint="products"
                id={product.id}
                field="name"
                value={product.name}
                label="Product Title"
                as="h1"
                className="text-3xl md:text-4xl font-heading font-bold uppercase tracking-tight text-foreground leading-tight"
              />

              {/* SKU & Model Meta */}
              <div className="flex flex-wrap items-center gap-5 text-xs font-mono text-muted-foreground pt-1">
                <span className="inline-flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-primary" />
                  SKU:{" "}
                  <EditableEntityText
                    endpoint="products"
                    id={product.id}
                    field="sku"
                    value={product.sku}
                    label="Product SKU"
                    placeholder="N/A"
                    className="font-semibold text-foreground"
                  />
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-primary" />
                  Model:{" "}
                  <EditableEntityText
                    endpoint="products"
                    id={product.id}
                    field="modelNumber"
                    value={product.modelNumber}
                    label="Model Number"
                    placeholder="Standard"
                    className="font-semibold text-foreground"
                  />
                </span>
              </div>

              {/* Price / Wholesale Quote Callout */}
              <div className="rounded-xl border border-border bg-secondary/40 px-5 py-4">
                <span className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                  Pricing & Wholesale Availability
                </span>
                <EditableEntityText
                  endpoint="products"
                  id={product.id}
                  field="priceText"
                  value={product.priceText}
                  label="Price or Wholesale Label"
                  as="div"
                  className="text-2xl font-heading font-bold uppercase text-primary"
                />
              </div>

              {/* Short Summary (Editable Inline) */}
              <EditableEntityText
                endpoint="products"
                id={product.id}
                field="shortDescription"
                value={product.shortDescription}
                label="Short Product Summary"
                type="textarea"
                as="p"
                className="text-base text-muted-foreground leading-relaxed"
              />

              {/* Key Feature Bullets */}
              {features.length > 0 && (
                <div className="pt-2 space-y-2.5">
                  <EditableText
                    contentKey="productDetail.featuresHeading"
                    fallback="Key Industrial Highlights"
                    label="Highlights Heading"
                    section="products"
                    as="h2"
                    className="text-xs font-bold uppercase tracking-widest text-foreground"
                  />
                  <ul className="space-y-2">
                    {features.map((feat, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 text-sm text-slate-700"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Quote & WhatsApp Buttons + Guarantee */}
            <div className="space-y-5 pt-4 border-t border-border">
              <ProductQuoteActions
                productId={product.id}
                productName={product.name}
                datasheetUrl={product.datasheetUrl}
              />

              <div className="flex items-start gap-3 rounded-xl bg-primary/5 border border-primary/15 p-4">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <EditableText
                    contentKey="productDetail.assuranceTitle"
                    fallback="100% Genuine Authorized Dealer Guarantee"
                    label="Guarantee Title"
                    section="products"
                    as="h3"
                    className="text-xs font-bold uppercase tracking-wider text-foreground mb-0.5"
                  />
                  <EditableText
                    contentKey="productDetail.assuranceText"
                    fallback="Supplied with official manufacturer warranty, GST tax invoice, and authorized service support from Mek Engineering Corporation."
                    label="Guarantee Description"
                    section="products"
                    type="textarea"
                    as="p"
                    className="text-xs text-muted-foreground leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Overview + Technical Specifications */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 rounded-2xl border border-border bg-white p-8 shadow-xs">
            <EditableText
              contentKey="productDetail.descriptionHeading"
              fallback="Detailed Overview"
              label="Overview Section Heading"
              section="products"
              as="h2"
              className="text-2xl font-heading font-bold uppercase tracking-tight text-foreground mb-4 pb-3 border-b border-border"
            />
            <EditableEntityText
              endpoint="products"
              id={product.id}
              field="description"
              value={product.description}
              label="Full Product Description"
              type="textarea"
              as="p"
              className="text-slate-700 leading-relaxed whitespace-pre-line text-base"
            />
          </div>

          <div className="lg:col-span-5 rounded-2xl border border-border bg-white p-8 shadow-xs">
            <EditableText
              contentKey="productDetail.specsHeading"
              fallback="Technical Specifications"
              label="Specs Table Heading"
              section="products"
              as="h2"
              className="text-2xl font-heading font-bold uppercase tracking-tight text-foreground mb-4 pb-3 border-b border-border"
            />
            {specs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Contact our technical sales desk for complete engineering specifications.
              </p>
            ) : (
              <dl className="divide-y divide-border text-sm">
                {specs.map((spec, idx) => (
                  <div
                    key={idx}
                    className="py-3 flex items-center justify-between gap-4"
                  >
                    <dt className="font-medium text-muted-foreground">{spec.label}</dt>
                    <dd className="font-semibold text-foreground text-right">
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>

        {/* Related Products */}
        {product.related.length > 0 && (
          <section className="mt-20">
            <EditableText
              contentKey="productDetail.relatedHeading"
              fallback="Related Industrial Equipment"
              label="Related Products Heading"
              section="products"
              as="h2"
              className="text-3xl font-heading font-bold uppercase tracking-tight text-foreground mb-8"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {product.related.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
