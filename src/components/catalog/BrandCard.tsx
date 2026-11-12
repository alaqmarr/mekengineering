import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface BrandCardItem {
  id: number;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logoUrl: string;
  rating: number;
  productCount: number;
}

export function BrandCard({ brand }: { brand: BrandCardItem }) {
  return (
    <Link
      href={`/brands/${brand.slug}`}
      className="group bg-white rounded-xl overflow-hidden border border-border shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
    >
      <div className="h-40 bg-slate-50 flex items-center justify-center relative border-b border-border/60 px-6">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.025)_25%,rgba(0,0,0,0.025)_50%,transparent_50%,transparent_75%,rgba(0,0,0,0.025)_75%,rgba(0,0,0,0.025)_100%)] bg-[length:20px_20px]" />
        {brand.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={brand.logoUrl}
            alt={brand.name}
            className="relative z-10 max-h-20 max-w-[200px] object-contain group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="relative z-10 text-3xl md:text-4xl font-black font-heading tracking-widest text-slate-800 uppercase drop-shadow-xs group-hover:scale-110 group-hover:text-primary transition-all duration-300 text-center">
            {brand.name}
          </div>
        )}
      </div>

      <div className="p-7 flex flex-1 flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-heading font-bold uppercase text-foreground group-hover:text-primary transition-colors">
            {brand.name}
          </h3>
          <span className="rounded bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            Authorized
          </span>
        </div>

        <p className="text-xs font-bold uppercase tracking-wider text-primary/90 mb-2">
          {brand.tagline}
        </p>

        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-6 flex-1">
          {brand.description}
        </p>

        <div className="flex items-center justify-between pt-5 border-t border-border">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {brand.productCount} {brand.productCount === 1 ? "Product" : "Products"}
          </span>
          <span className="text-primary font-bold text-sm uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all">
            View Catalog <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
