import type { Metadata } from "next";
import { BadgeCheck } from "lucide-react";
import { buildRouteMetadata, getAllBrandsWithCounts } from "@/db/queries";
import { BrandCard } from "@/components/catalog/BrandCard";
import { EditableText } from "@/components/cms/Editable";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata("/brands");
}

export default async function BrandsPage() {
  const brands = await getAllBrandsWithCounts();

  return (
    <div className="min-h-screen bg-secondary/20 pt-32 pb-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-white border border-border px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-primary mb-5 shadow-xs">
            <BadgeCheck className="h-4 w-4" />
            <EditableText
              contentKey="brands.hero.badge"
              fallback="Authorized Dealer"
              label="Brands Page Badge"
              section="brands"
            />
          </div>

          <EditableText
            contentKey="brands.hero.heading"
            fallback="Premium Industrial Brands"
            label="Brands Page Heading"
            section="brands"
            as="h1"
            className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6 uppercase tracking-tight"
          />

          <EditableText
            contentKey="brands.hero.paragraph"
            fallback="We partner directly with global manufacturing leaders to bring you authentic, high-performance tools. Zero compromise on quality."
            label="Brands Page Description"
            section="brands"
            type="textarea"
            as="p"
            className="text-muted-foreground text-lg leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {brands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>

        {/* 3 Trust Pillars matching existing site */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-primary/5 border border-primary/15 p-8 rounded-xl text-center">
            <EditableText
              contentKey="brands.pillar1.title"
              fallback="Genuine Products"
              label="Pillar 1 Title"
              section="brands"
              as="h2"
              className="font-heading font-bold text-xl text-primary uppercase mb-2"
            />
            <EditableText
              contentKey="brands.pillar1.text"
              fallback="Authentic factory-sealed power tools, hand tools, and measuring instruments from recognized industrial manufacturers."
              label="Pillar 1 Description"
              section="brands"
              type="textarea"
              as="p"
              className="text-sm text-muted-foreground leading-relaxed"
            />
          </div>

          <div className="bg-primary/5 border border-primary/15 p-8 rounded-xl text-center">
            <EditableText
              contentKey="brands.pillar2.title"
              fallback="Manufacturer Warranty"
              label="Pillar 2 Title"
              section="brands"
              as="h2"
              className="font-heading font-bold text-xl text-primary uppercase mb-2"
            />
            <EditableText
              contentKey="brands.pillar2.text"
              fallback="Official manufacturer warranty and proper GST tax invoicing on wholesale and retail purchases."
              label="Pillar 2 Description"
              section="brands"
              type="textarea"
              as="p"
              className="text-sm text-muted-foreground leading-relaxed"
            />
          </div>

          <div className="bg-primary/5 border border-primary/15 p-8 rounded-xl text-center">
            <EditableText
              contentKey="brands.pillar3.title"
              fallback="Wholesale Quotations"
              label="Pillar 3 Title"
              section="brands"
              as="h2"
              className="font-heading font-bold text-xl text-primary uppercase mb-2"
            />
            <EditableText
              contentKey="brands.pillar3.text"
              fallback="Dedicated B2B pricing and sourcing assistance from our showroom in Victoria Ranigunj, Secunderabad."
              label="Pillar 3 Description"
              section="brands"
              type="textarea"
              as="p"
              className="text-sm text-muted-foreground leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
