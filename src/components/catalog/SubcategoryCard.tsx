import Link from "next/link";
import { ArrowRight, FolderTree, Crosshair } from "lucide-react";

interface SubcategoryCardItem {
  id: number;
  name: string;
  slug: string;
  shortDescription: string;
  imageUrl: string;
  productCount: number;
  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
}

export function SubcategoryCard({ subcategory }: { subcategory: SubcategoryCardItem }) {
  const hasImage = Boolean(subcategory.imageUrl && subcategory.imageUrl.trim());

  return (
    <Link
      href={`/subcategories/${subcategory.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-[#003b6a] via-[#07223b] to-[#0b111c]">
        {hasImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={subcategory.imageUrl}
              alt={subcategory.name}
              loading="lazy"
              className="h-full w-full object-cover opacity-85 transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Crosshair className="h-10 w-10 text-sky-400/50 transition-transform duration-500 group-hover:rotate-45 group-hover:scale-110" />
          </div>
        )}
        {subcategory.category && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded bg-black/75 border border-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary backdrop-blur-xs">
            <FolderTree className="h-3 w-3" />
            {subcategory.category.name}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-heading text-xl font-bold uppercase tracking-tight text-foreground group-hover:text-primary transition-colors mb-2">
          {subcategory.name}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-5 flex-1">
          {subcategory.shortDescription}
        </p>
        <div className="pt-4 border-t border-border flex items-center justify-between text-xs font-bold uppercase tracking-wider">
          <span className="text-muted-foreground">
            {subcategory.productCount} {subcategory.productCount === 1 ? "Product" : "Products"}
          </span>
          <span className="inline-flex items-center gap-1 text-primary group-hover:gap-2 transition-all">
            Explore <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
