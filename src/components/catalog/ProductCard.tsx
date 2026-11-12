import Link from "next/link";
import { ArrowUpRight, Crosshair } from "lucide-react";
import type { EnrichedProduct } from "@/db/queries";

export function ProductCard({ product }: { product: EnrichedProduct }) {
  const hasImage = Boolean(product.imageUrl && product.imageUrl.trim());

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image or Clean Technical Blueprint Placeholder */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900 border-b border-border/60">
        {hasImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-contain bg-white p-4 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-50 group-hover:opacity-70 transition-opacity pointer-events-none" />
          </>
        ) : (
          <div className="relative flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#003b6a] via-[#072642] to-[#0b1320] p-6 text-center select-none">
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.45) 1px, transparent 0)",
                backgroundSize: "18px 18px",
              }}
            />
            <Crosshair className="h-8 w-8 text-sky-400/70 mb-2.5 transition-transform duration-500 group-hover:rotate-45 group-hover:scale-110" />
            <span className="font-heading text-lg font-bold uppercase tracking-wider text-white/95 line-clamp-1 px-2">
              {product.modelNumber || product.name}
            </span>
            {product.sku && (
              <span className="mt-1 font-mono text-[11px] tracking-widest text-sky-200/75">
                Part No: {product.sku}
              </span>
            )}
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          {product.brand ? (
            <span className="rounded bg-black/80 px-2.5 py-1 text-[10px] font-heading font-bold uppercase tracking-widest text-white backdrop-blur-xs">
              {product.brand.name}
            </span>
          ) : (
            <span />
          )}
          {product.badge && (
            <span className="rounded bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              {product.badge}
            </span>
          )}
        </div>

        {/* Bottom Subcategory / Category Pill */}
        {(product.subcategory || product.category) && (
          <div className="absolute bottom-3 left-3">
            <span className="rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-800 shadow-xs">
              {product.subcategory?.name || product.category?.name}
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col p-6">
        {product.sku && (
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
            Part No: {product.sku}
          </span>
        )}
        <h3 className="font-heading text-xl font-bold uppercase tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-5 flex-1">
          {product.shortDescription || product.description}
        </p>

        <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Request Quote to Get Final Price
            </span>
            <span className="text-[11px] text-muted-foreground font-medium mt-0.5">
              {product.modelNumber ? `Model: ${product.modelNumber}` : "Wholesale & B2B Inquiry"}
            </span>
          </div>

          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground group-hover:bg-primary group-hover:text-white transition-colors">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
