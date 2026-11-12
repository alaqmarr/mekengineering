import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Wrench, Truck, ArrowRight, Award } from "lucide-react";
import { buildRouteMetadata, getSiteBaseUrl, getSiteContentMap } from "@/db/queries";
import { EditableImageTrigger, EditableText } from "@/components/cms/Editable";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata("/about");
}

export default async function AboutPage() {
  const content = await getSiteContentMap();
  const siteUrl = await getSiteBaseUrl(content);

  const heroBg = content["about.hero.bgImage"] || "/images/carousel/bosch-store.png";
  const image1 = content["about.story.image1"] || "/images/carousel/store-interior.png";
  const image2 = content["about.story.image2"] || "/images/carousel/dewalt-site.png";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `About ${content["site.name"] || "Mek Engineering Corporation"}`,
    url: `${siteUrl}/about`,
    mainEntity: {
      "@type": "Organization",
      name: content["site.name"] || "Mek Engineering Corporation",
      foundingDate: "1968",
      url: siteUrl,
      location: "Victoria Ranigunj, Secunderabad, Telangana 500003, India",
    },
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Hero Banner */}
      <section className="relative overflow-hidden bg-black py-28 md:py-36">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/50" />

        <div className="absolute top-6 right-6 z-30">
          <EditableImageTrigger
            label="About Hero Background"
            contentKey="about.hero.bgImage"
            fallback="/images/carousel/bosch-store.png"
            section="about"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 border border-primary bg-black/60 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary mb-6">
            <Award className="h-3.5 w-3.5" />
            <EditableText
              contentKey="about.hero.badge"
              fallback="Since 1968"
              label="About Hero Badge"
              section="about"
            />
          </div>

          <EditableText
            contentKey="about.hero.heading"
            fallback="Building The Future"
            label="About Hero Heading"
            section="about"
            as="h1"
            className="text-4xl md:text-7xl font-heading font-bold uppercase tracking-tight text-white mb-6"
          />

          <EditableText
            contentKey="about.hero.paragraph"
            fallback="For over five decades, Mek Engineering Corporation has been the backbone of industrial supply in Secunderabad and across Southern India."
            label="About Hero Paragraph"
            section="about"
            type="textarea"
            as="p"
            className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto font-light"
          />
        </div>
      </section>

      {/* 2. Crimson Industrial Stats Strip */}
      <section className="bg-primary text-white py-12 border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y sm:divide-y-0 lg:divide-x divide-white/20">
            {[1, 2, 3, 4].map((idx) => {
              const defaults: Record<number, { v: string; l: string }> = {
                1: { v: "1968", l: "Year Established" },
                2: { v: "B2B & Retail", l: "Industrial Supply" },
                3: { v: "GST", l: "Tax Invoicing" },
                4: { v: "Ranigunj", l: "Secunderabad Showroom" },
              };
              return (
                <div key={idx} className="px-4 pt-4 sm:pt-0">
                  <EditableText
                    contentKey={`about.stat${idx}.value`}
                    fallback={defaults[idx].v}
                    label={`About Stat ${idx} Value`}
                    section="about"
                    as="div"
                    className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-1"
                  />
                  <EditableText
                    contentKey={`about.stat${idx}.label`}
                    fallback={defaults[idx].l}
                    label={`About Stat ${idx} Label`}
                    section="about"
                    as="div"
                    className="text-xs md:text-sm font-bold uppercase tracking-widest text-white/85"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Our Legacy Story & Showcase Images */}
      <section className="container mx-auto px-4 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
          <div className="lg:col-span-6 space-y-6">
            <EditableText
              contentKey="about.story.badge"
              fallback="Who We Are"
              label="About Story Eyebrow"
              section="about"
              as="span"
              className="text-primary font-bold uppercase tracking-widest text-sm block"
            />

            <EditableText
              contentKey="about.story.heading"
              fallback="Our Legacy"
              label="About Story Heading"
              section="about"
              as="h2"
              className="text-4xl md:text-5xl font-heading font-bold uppercase text-foreground tracking-tight"
            />

            <EditableText
              contentKey="about.story.paragraph1"
              fallback="We are a Sole Proprietorship based firm, engaged as the foremost Wholesale Trader of Tool Kits, Grease Dispensers, Saw Blades, Electric Drills, Angle Grinders, Precision Measuring Instruments, and Industrial Machinery."
              label="About Story Paragraph 1"
              section="about"
              type="textarea"
              as="p"
              className="text-base md:text-lg text-muted-foreground leading-relaxed"
            />

            <EditableText
              contentKey="about.story.paragraph2"
              fallback="Our products are high in demand due to their premium quality, seamless finish, heavy-duty endurance, and competitive wholesale prices. Furthermore, we ensure timely delivery of these products to our clients, holding our reputation as a trusted partner in the industrial supply chain since 1968."
              label="About Story Paragraph 2"
              section="about"
              type="textarea"
              as="p"
              className="text-base text-muted-foreground leading-relaxed"
            />

            <div className="border-l-4 border-primary bg-secondary/60 p-6 rounded-r-xl">
              <EditableText
                contentKey="about.story.quote"
                fallback={`"Under the direction of Zoeb Bootwala (Manager), we have been able to achieve a reputed name in the industry through unwavering integrity and technical excellence."`}
                label="About Leadership Quote"
                section="about"
                type="textarea"
                as="blockquote"
                className="italic text-foreground font-medium text-base leading-relaxed"
              />
            </div>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-red-700 px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-md transition-all"
              >
                Explore Catalog
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-white hover:border-primary px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-foreground transition-all"
              >
                Visit Showroom
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-border shadow-lg group">
              <Image
                src={image1}
                alt="Mek Engineering Corporation Showroom"
                fill
                sizes="(max-width: 768px) 100vw, 30vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized={image1.startsWith("http") || image1.startsWith("/api/")}
              />
              <div className="absolute top-3 right-3">
                <EditableImageTrigger
                  label="About Showcase Image 1"
                  contentKey="about.story.image1"
                  fallback="/images/carousel/store-interior.png"
                  section="about"
                />
              </div>
            </div>

            <div className="relative aspect-[4/5] sm:mt-10 rounded-2xl overflow-hidden border border-border shadow-lg group">
              <Image
                src={image2}
                alt="Heavy-Duty Industrial Equipment"
                fill
                sizes="(max-width: 768px) 100vw, 30vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized={image2.startsWith("http") || image2.startsWith("/api/")}
              />
              <div className="absolute top-3 right-3">
                <EditableImageTrigger
                  label="About Showcase Image 2"
                  contentKey="about.story.image2"
                  fallback="/images/carousel/dewalt-site.png"
                  section="about"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Why Professionals Choose Us */}
      <section className="py-24 bg-secondary/50 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <EditableText
              contentKey="about.why.heading"
              fallback="Why Professionals Choose Us"
              label="Why Choose Us Heading"
              section="about"
              as="h2"
              className="text-3xl md:text-5xl font-heading font-bold uppercase text-foreground mb-4"
            />
            <EditableText
              contentKey="about.why.subtitle"
              fallback="We define excellence through our commitment to genuine quality and responsive service."
              label="Why Choose Us Subtitle"
              section="about"
              type="textarea"
              as="p"
              className="text-muted-foreground text-base"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-border bg-white p-8 shadow-xs hover:shadow-md hover:border-primary/40 transition-all">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <EditableText
                contentKey="about.why.card1Title"
                fallback="Genuine Brand Supply"
                label="Card 1 Title"
                section="about"
                as="h3"
                className="font-heading text-2xl font-bold uppercase text-foreground mb-3"
              />
              <EditableText
                contentKey="about.why.card1Text"
                fallback="Authorized industrial supplier offering genuine tools and equipment from recognized manufacturers."
                label="Card 1 Text"
                section="about"
                type="textarea"
                as="p"
                className="text-sm text-muted-foreground leading-relaxed"
              />
            </div>

            <div className="rounded-2xl border border-border bg-white p-8 shadow-xs hover:shadow-md hover:border-primary/40 transition-all">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Wrench className="h-7 w-7" />
              </div>
              <EditableText
                contentKey="about.why.card2Title"
                fallback="Practical Tool Guidance"
                label="Card 2 Title"
                section="about"
                as="h3"
                className="font-heading text-2xl font-bold uppercase text-foreground mb-3"
              />
              <EditableText
                contentKey="about.why.card2Text"
                fallback="Our experienced showroom team helps you match the right power tools, instruments, and accessories to your application."
                label="Card 2 Text"
                section="about"
                type="textarea"
                as="p"
                className="text-sm text-muted-foreground leading-relaxed"
              />
            </div>

            <div className="rounded-2xl border border-border bg-white p-8 shadow-xs hover:shadow-md hover:border-primary/40 transition-all">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Truck className="h-7 w-7" />
              </div>
              <EditableText
                contentKey="about.why.card3Title"
                fallback="Wholesale & B2B Sourcing"
                label="Card 3 Title"
                section="about"
                as="h3"
                className="font-heading text-2xl font-bold uppercase text-foreground mb-3"
              />
              <EditableText
                contentKey="about.why.card3Text"
                fallback="Serving workshops, contractors, and industrial buyers from Victoria Ranigunj, Secunderabad with transparent quotations and GST billing."
                label="Card 3 Text"
                section="about"
                type="textarea"
                as="p"
                className="text-sm text-muted-foreground leading-relaxed"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
