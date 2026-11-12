import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";

interface CategoryCardItem {
  id: number;
  name: string;
  slug: string;
  badge: string;
  shortDescription: string;
  imageUrl: string;
  productCount: number;
  subcategoryCount: number;
}

export function CategoryCard({ category }: { category: CategoryCardItem }) {
  const hasImage = Boolean(category.imageUrl && category.imageUrl.trim());

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group relative h-72 rounded-xl overflow-hidden block border border-border shadow-xs hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-[#003b6a] via-[#07223b] to-[#0b111c]"
    >
      {hasImage ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={category.imageUrl}
            alt={category.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 group-hover:from-black/95 transition-colors" />
        </>
      ) : (
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.45) 1px, transparent 0)",
            backgroundSize: "20px 20px",
          }}
        />
      )}

      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <span className="rounded bg-primary/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
          {category.badge || "Bosch Professional"}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-black/60 border border-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-xs">
          <Layers className="h-3 w-3 text-primary" />
          {category.subcategoryCount} Subcategories
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-7 flex flex-col justify-end">
        <h3 className="text-2xl md:text-3xl font-heading font-bold text-white uppercase tracking-tight mb-1.5 group-hover:text-primary transition-colors">
          {category.name}
        </h3>
        <p className="text-slate-300 text-sm line-clamp-2 mb-4">
          {category.shortDescription}
        </p>
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
          <span className="text-white/75">
            {category.productCount} {category.productCount === 1 ? "Model" : "Models"}
          </span>
          <span className="inline-flex items-center gap-1.5 text-primary group-hover:translate-x-1 transition-transform">
            Browse Category <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
