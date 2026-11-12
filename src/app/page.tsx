import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Phone } from "lucide-react";
import {
  buildRouteMetadata,
  getAllBrandsWithCounts,
  getAllCategoriesWithCounts,
  getAllSubcategoriesWithDetails,
  getEnrichedProducts,
  getHeroSlides,
  getSiteBaseUrl,
  getSiteContentMap,
} from "@/db/queries";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategoryCard } from "@/components/catalog/CategoryCard";
import { SubcategoryCard } from "@/components/catalog/SubcategoryCard";
import { ProductCard } from "@/components/catalog/ProductCard";
import { EditableText, EditableImageTrigger } from "@/components/cms/Editable";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata("/");
}

export default async function HomePage() {
  const [slides, categories, subcategories, allProducts, brands, content] =
    await Promise.all([
      getHeroSlides(),
      getAllCategoriesWithCounts(),
      getAllSubcategoriesWithDetails(),
      getEnrichedProducts(),
      getAllBrandsWithCounts(),
      getSiteContentMap(),
    ]);
  const siteUrl = await getSiteBaseUrl(content);

  const featuredProducts = allProducts.filter((p) => p.featured).slice(0, 4);
  const displayProducts =
    featuredProducts.length > 0 ? featuredProducts : allProducts.slice(0, 4);
  const featuredCategories = categories.filter((c) => c.featured).slice(0, 6);
  const featuredSubcategories = subcategories.filter((s) => s.featured).slice(0, 4);

  const legacyBg =
    content["home.legacy.bgImage"] || "/images/carousel/store-interior.png";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HardwareStore",
    name: content["site.name"] || "Mek Engineering Corporation",
    url: siteUrl,
    logo: `${siteUrl}/favicon.ico`,
    image: `${siteUrl}/images/carousel/store-interior.png`,
    foundingDate: "1968",
    telephone: content["contact.phone"] || "+91 93910 79492",
    email: content["contact.email"] || "info@mekengg.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: `${content["contact.addressLine1"] || "5-1-458, Victoria Ranigunj, Bolaram Nagar"}`,
      addressLocality: "Secunderabad",
      addressRegion: "Telangana",
      postalCode: "500003",
      addressCountry: "IN",
    },
  };

  return (
    <div className="flex flex-col bg-background min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Fullscreen Hero Carousel */}
      <HeroCarousel slides={slides} />

      {/* 2. Shop by Category */}
      <section className="py-24 bg-secondary/40 border-b border-border/60">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <EditableText
                contentKey="home.categories.badge"
                fallback="Our Catalog"
                label="Categories Eyebrow Badge"
                section="home"
                as="span"
                className="text-primary font-bold uppercase tracking-widest text-sm mb-2 block"
              />
              <EditableText
                contentKey="home.categories.heading"
                fallback="Shop by Category"
                label="Categories Section Heading"
                section="home"
                as="h2"
                className="text-4xl md:text-5xl font-heading font-bold text-foreground uppercase tracking-tight mb-3"
              />
              <EditableText
                contentKey="home.categories.description"
                fallback="Explore industrial-grade tool lines, workshop equipment, and heavy machinery built for demanding jobsites."
                label="Categories Section Description"
                section="home"
                type="textarea"
                as="p"
                className="text-muted-foreground text-base leading-relaxed"
              />
            </div>

            <Link
              href="/categories"
              className="text-foreground font-bold uppercase tracking-wider text-sm hover:text-primary transition-colors inline-flex items-center gap-2 border-b-2 border-primary pb-1 shrink-0"
            >
              <EditableText
                contentKey="home.categories.cta"
                fallback="View All Categories"
                label="Categories Section Link"
                section="home"
              />
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(featuredCategories.length > 0 ? featuredCategories : categories.slice(0, 6)).map(
              (cat) => (
                <CategoryCard key={cat.id} category={cat} />
              )
            )}
          </div>
        </div>
      </section>

      {/* 3. Featured Equipment / Products */}
      <section className="container mx-auto px-4 py-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-6 border-b border-border pb-6">
          <div className="max-w-2xl">
            <EditableText
              contentKey="home.featured.badge"
              fallback="Editor's Pick"
              label="Featured Products Badge"
              section="home"
              as="span"
              className="inline-block text-primary font-bold tracking-widest uppercase text-sm mb-2"
            />
            <EditableText
              contentKey="home.featured.heading"
              fallback="Featured Equipment"
              label="Featured Products Heading"
              section="home"
              as="h2"
              className="text-4xl md:text-5xl font-heading font-bold text-foreground uppercase tracking-tight mb-2"
            />
            <EditableText
              contentKey="home.featured.description"
              fallback="Hand-picked flagship machines and workshop essentials trusted by fabrication plants, contractors, and engineers across India."
              label="Featured Products Description"
              section="home"
              type="textarea"
              as="p"
              className="text-muted-foreground text-base"
            />
          </div>

          <Link
            href="/products"
            className="bg-foreground hover:bg-primary text-white px-8 py-3.5 rounded-lg font-bold uppercase tracking-wider text-sm transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2 shrink-0"
          >
            <EditableText
              contentKey="home.featured.cta"
              fallback="View Full Catalog"
              label="Featured Products Button"
              section="home"
            />
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 4. Specialized Subcategories Strip */}
      {featuredSubcategories.length > 0 && (
        <section className="py-20 bg-secondary/30 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
              <div className="max-w-2xl">
                <EditableText
                  contentKey="home.subcategories.badge"
                  fallback="Specialized Segments"
                  label="Subcategories Eyebrow Badge"
                  section="home"
                  as="span"
                  className="text-primary font-bold uppercase tracking-widest text-sm mb-2 block"
                />
                <EditableText
                  contentKey="home.subcategories.heading"
                  fallback="Browse by Subcategory"
                  label="Subcategories Heading"
                  section="home"
                  as="h2"
                  className="text-3xl md:text-4xl font-heading font-bold text-foreground uppercase tracking-tight mb-2"
                />
                <EditableText
                  contentKey="home.subcategories.description"
                  fallback="Pinpoint the exact industrial tool class you need — from SDS-Plus rotary hammers to precision digital metrology."
                  label="Subcategories Description"
                  section="home"
                  type="textarea"
                  as="p"
                  className="text-muted-foreground text-sm md:text-base"
                />
              </div>

              <Link
                href="/subcategories"
                className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-sm hover:gap-3 transition-all shrink-0"
              >
                <EditableText
                  contentKey="home.subcategories.cta"
                  fallback="Explore All Subcategories"
                  label="Subcategories Link"
                  section="home"
                />
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredSubcategories.map((sub) => (
                <SubcategoryCard key={sub.id} subcategory={sub} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Trusted Global Brands Strip */}
      <section className="py-20 bg-white border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <EditableText
            contentKey="home.brands.badge"
            fallback="Trusted by Professionals"
            label="Brands Strip Eyebrow"
            section="home"
            as="span"
            className="text-muted-foreground font-bold tracking-[0.25em] uppercase text-xs mb-3 block"
          />
          <EditableText
            contentKey="home.brands.heading"
            fallback="Authorized Global Manufacturers"
            label="Brands Strip Heading"
            section="home"
            as="h2"
            className="text-2xl md:text-3xl font-heading font-bold uppercase text-foreground mb-10"
          />

          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.slug}`}
                className="text-2xl md:text-3xl font-heading font-black text-slate-400 uppercase hover:text-primary transition-colors"
              >
                {brand.name}
              </Link>
            ))}
          </div>

          <div className="mt-12">
            <Link
              href="/brands"
              className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-sm hover:gap-3 transition-all"
            >
              <EditableText
                contentKey="home.brands.cta"
                fallback="See All Brands"
                label="Brands Strip Link"
                section="home"
              />
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Legacy & Stats Dark Section */}
      <section className="relative py-32 overflow-hidden bg-black">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${legacyBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/50" />

        <div className="absolute top-6 right-6 z-30">
          <EditableImageTrigger
            label="Legacy Section Background"
            contentKey="home.legacy.bgImage"
            fallback="/images/carousel/store-interior.png"
            section="home"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-left">
            <div className="inline-block border border-primary text-primary px-3.5 py-1 text-xs font-bold uppercase tracking-widest mb-6 bg-black/50 backdrop-blur-xs">
              <EditableText
                contentKey="home.legacy.badge"
                fallback="Since 1968"
                label="Legacy Badge"
                section="home"
              />
            </div>

            <h2 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6 uppercase leading-none drop-shadow-lg">
              <EditableText
                contentKey="home.legacy.headingLine1"
                fallback="Mek Engineering"
                label="Legacy Heading Line 1"
                section="home"
              />
              <br />
              <EditableText
                contentKey="home.legacy.headingLine2"
                fallback="Corporation"
                label="Legacy Heading Line 2"
                section="home"
                className="text-primary"
              />
            </h2>

            <EditableText
              contentKey="home.legacy.paragraph"
              fallback="For over 55 years, we have defined excellence in industrial supply. As premier wholesale traders in Secunderabad, we bridge the gap between global manufacturers and local industry needs with 100% genuine equipment."
              label="Legacy Section Paragraph"
              section="home"
              type="textarea"
              as="p"
              className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed max-w-xl font-light"
            />

            <div className="flex flex-wrap gap-4">
              <Link
                href="/about"
                className="bg-primary hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold uppercase tracking-wider text-sm transition-all shadow-lg hover:shadow-primary/40"
              >
                <EditableText
                  contentKey="home.legacy.ctaPrimary"
                  fallback="Our Legacy"
                  label="Legacy Primary Button"
                  section="home"
                />
              </Link>
              <Link
                href="/contact"
                className="border border-white/25 hover:bg-white hover:text-black text-white px-8 py-4 rounded-lg font-bold uppercase tracking-wider text-sm transition-all"
              >
                <EditableText
                  contentKey="home.legacy.ctaSecondary"
                  fallback="Request Bulk Quote"
                  label="Legacy Secondary Button"
                  section="home"
                />
              </Link>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-4 w-full">
            <div className="bg-white/5 backdrop-blur-xs border border-white/10 p-8 text-center rounded-xl hover:bg-white/10 transition-colors">
              <EditableText
                contentKey="home.legacy.stat1Value"
                fallback="55+"
                label="Stat 1 Value"
                section="home"
                as="div"
                className="text-5xl font-heading font-black text-white mb-2"
              />
              <EditableText
                contentKey="home.legacy.stat1Label"
                fallback="Years Experience"
                label="Stat 1 Label"
                section="home"
                as="div"
                className="text-white/60 text-xs uppercase tracking-widest font-bold"
              />
            </div>

            <div className="bg-white/5 backdrop-blur-xs border border-white/10 p-8 text-center rounded-xl hover:bg-white/10 transition-colors">
              <EditableText
                contentKey="home.legacy.stat2Value"
                fallback="10k+"
                label="Stat 2 Value"
                section="home"
                as="div"
                className="text-5xl font-heading font-black text-primary mb-2"
              />
              <EditableText
                contentKey="home.legacy.stat2Label"
                fallback="Products Sold"
                label="Stat 2 Label"
                section="home"
                as="div"
                className="text-white/60 text-xs uppercase tracking-widest font-bold"
              />
            </div>

            <div className="bg-white/5 backdrop-blur-xs border border-white/10 p-8 text-center rounded-xl col-span-2 hover:bg-white/10 transition-colors">
              <EditableText
                contentKey="home.legacy.stat3Value"
                fallback="100%"
                label="Stat 3 Value"
                section="home"
                as="div"
                className="text-5xl font-heading font-black text-white mb-2"
              />
              <EditableText
                contentKey="home.legacy.stat3Label"
                fallback="Client Satisfaction & Genuine Supply"
                label="Stat 3 Label"
                section="home"
                as="div"
                className="text-white/60 text-xs uppercase tracking-widest font-bold"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 7. Wholesale Procurement CTA Banner */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <EditableText
              contentKey="home.cta.badge"
              fallback="Wholesale & Institutional Procurement"
              label="Bottom CTA Eyebrow"
              section="home"
              as="span"
              className="text-xs font-bold uppercase tracking-[0.25em] text-white/80 block mb-2"
            />
            <EditableText
              contentKey="home.cta.heading"
              fallback="Need Bulk Pricing or Custom Industrial Sourcing?"
              label="Bottom CTA Heading"
              section="home"
              as="h2"
              className="text-3xl md:text-4xl font-heading font-bold uppercase tracking-tight mb-3"
            />
            <EditableText
              contentKey="home.cta.paragraph"
              fallback="Connect directly with our technical sales desk at Victoria Ranigunj, Secunderabad for GST wholesale invoicing, plant setup toolkits, and genuine OEM spares."
              label="Bottom CTA Paragraph"
              section="home"
              type="textarea"
              as="p"
              className="text-white/90 text-base leading-relaxed"
            />
          </div>

          <Link
            href="/contact"
            className="inline-flex items-center gap-2.5 rounded-lg bg-[#111318] hover:bg-black px-8 py-4 font-bold uppercase tracking-wider text-sm text-white shadow-xl transition-all shrink-0"
          >
            <Phone className="h-4 w-4 text-primary" />
            <EditableText
              contentKey="home.cta.button"
              fallback="Speak With Our Engineers"
              label="Bottom CTA Button"
              section="home"
            />
          </Link>
        </div>
      </section>
    </div>
  );
}
