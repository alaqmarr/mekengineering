"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import type { Subcategory } from "@/db/schema";
import type { EnrichedProduct } from "@/db/queries";
import { ProductCard } from "./ProductCard";
import { EditableText } from "@/components/cms/Editable";

export interface CategorySubcategoryOption extends Subcategory {
  productCount: number;
}

interface CategoryProductsBrowserProps {
  categoryName: string;
  subcategories: CategorySubcategoryOption[];
  products: EnrichedProduct[];
  initialSubcategory?: string;
}

type SortOption = "featured" | "subcategory" | "name-asc" | "newest";

export function CategoryProductsBrowser({
  categoryName,
  subcategories,
  products,
  initialSubcategory = "",
}: CategoryProductsBrowserProps) {
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<string>(initialSubcategory);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("featured");

  // Derive brands represented in this category's products
  const categoryBrands = useMemo(() => {
    const map = new Map<string, { slug: string; name: string; count: number }>();
    for (const p of products) {
      if (p.brand) {
        const existing = map.get(p.brand.slug);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(p.brand.slug, {
            slug: p.brand.slug,
            name: p.brand.name,
            count: 1,
          });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [products]);

  const subcategoryOrderMap = useMemo(() => {
    const map = new Map<number, number>();
    subcategories.forEach((sub, idx) => {
      map.set(sub.id, idx);
    });
    return map;
  }, [subcategories]);

  const activeSubcategoryObj = useMemo(
    () =>
      subcategories.find(
        (s) =>
          s.slug === selectedSubcategory ||
          String(s.id) === selectedSubcategory
      ) ?? null,
    [subcategories, selectedSubcategory]
  );

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = products.filter((p) => {
      if (selectedSubcategory) {
        const matchesSub =
          p.subcategory?.slug === selectedSubcategory ||
          String(p.subcategoryId) === selectedSubcategory;
        if (!matchesSub) return false;
      }

      if (selectedBrand) {
        if (p.brand?.slug !== selectedBrand) return false;
      }

      if (q) {
        const haystack = `${p.name} ${p.sku} ${p.modelNumber} ${p.shortDescription} ${p.brand?.name || ""} ${p.subcategory?.name || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });

    if (sortBy === "subcategory") {
      return [...list].sort((a, b) => {
        const orderA =
          a.subcategoryId != null
            ? (subcategoryOrderMap.get(a.subcategoryId) ?? 9999)
            : 9999;
        const orderB =
          b.subcategoryId != null
            ? (subcategoryOrderMap.get(b.subcategoryId) ?? 9999)
            : 9999;
        if (orderA !== orderB) return orderA - orderB;
        const subNameA = a.subcategory?.name || "ZZZ";
        const subNameB = b.subcategory?.name || "ZZZ";
        if (subNameA !== subNameB) return subNameA.localeCompare(subNameB);
        return a.sortOrder - b.sortOrder;
      });
    }

    if (sortBy === "name-asc") {
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sortBy === "newest") {
      return [...list].sort((a, b) => b.id - a.id);
    }

    return [...list].sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return a.sortOrder - b.sortOrder;
    });
  }, [
    products,
    selectedSubcategory,
    selectedBrand,
    query,
    sortBy,
    subcategoryOrderMap,
  ]);

  const hasFilters = Boolean(
    selectedSubcategory || selectedBrand || query.trim()
  );

  function resetFilters() {
    setSelectedSubcategory("");
    setSelectedBrand("");
    setQuery("");
  }

  return (
    <div className="space-y-8">
      {/* Top Quick Subcategory Filter Pills */}
      {subcategories.length > 0 && (
        <div className="rounded-2xl border border-border bg-white p-5 shadow-xs space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span>Filter by Subcategory</span>
            </div>
            {activeSubcategoryObj && (
              <Link
                href={`/subcategories/${activeSubcategoryObj.slug}`}
                className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary hover:underline"
              >
                Open {activeSubcategoryObj.name} Page
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedSubcategory("")}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                !selectedSubcategory
                  ? "border-primary bg-primary text-white shadow-xs"
                  : "border-border bg-secondary/40 text-foreground hover:border-primary/60 hover:bg-secondary"
              }`}
            >
              <span>All {categoryName}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] ${
                  !selectedSubcategory
                    ? "bg-white/20 text-white"
                    : "bg-white text-muted-foreground"
                }`}
              >
                {products.length}
              </span>
            </button>

            {subcategories.map((sub) => {
              const active = selectedSubcategory === sub.slug;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() =>
                    setSelectedSubcategory(active ? "" : sub.slug)
                  }
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    active
                      ? "border-primary bg-primary text-white shadow-xs"
                      : "border-border bg-secondary/40 text-foreground hover:border-primary/60 hover:bg-secondary"
                  }`}
                >
                  <span>{sub.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-white text-muted-foreground"
                    }`}
                  >
                    {sub.productCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Sidebar + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-3 rounded-2xl border border-border bg-white p-6 shadow-xs space-y-6 lg:sticky lg:top-24">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <h2 className="font-heading text-lg font-bold uppercase tracking-wide">
                Filter & Sort
              </h2>
            </div>
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            )}
          </div>

          {/* Search within Category */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Search in {categoryName}
            </label>
            <div className="relative">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Model, SKU, keyword..."
                className="w-full rounded-lg border border-border bg-secondary/40 pl-10 pr-3 py-2.5 text-sm text-foreground focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Subcategory List */}
          {subcategories.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Subcategories
              </label>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedSubcategory("")}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    !selectedSubcategory
                      ? "bg-primary text-white font-bold"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  <span>All Subcategories</span>
                  <span className="text-xs opacity-80">{products.length}</span>
                </button>
                {subcategories.map((sub) => {
                  const active = selectedSubcategory === sub.slug;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() =>
                        setSelectedSubcategory(active ? "" : sub.slug)
                      }
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors cursor-pointer ${
                        active
                          ? "bg-primary text-white font-bold"
                          : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      <span className="line-clamp-1 pr-2">{sub.name}</span>
                      <span className="shrink-0 text-xs opacity-80">
                        {sub.productCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Brands in this Category */}
          {categoryBrands.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Brands
              </label>
              <div className="flex flex-wrap gap-2">
                {categoryBrands.map((brand) => {
                  const active = selectedBrand === brand.slug;
                  return (
                    <button
                      key={brand.slug}
                      type="button"
                      onClick={() =>
                        setSelectedBrand(active ? "" : brand.slug)
                      }
                      className={`rounded-md border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        active
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-secondary/40 text-foreground hover:border-primary"
                      }`}
                    >
                      {brand.name} ({brand.count})
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* Product Grid + Sort Header */}
        <div className="lg:col-span-9 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-white px-5 py-3.5 shadow-xs">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <EditableText
                contentKey="categoryDetail.productsHeading"
                fallback="Available Equipment & Tools"
                label="Category Products Heading"
                section="categories"
                as="span"
                className="font-heading font-bold uppercase tracking-wide text-foreground mr-1"
              />
              <span>
                | Showing{" "}
                <strong className="text-foreground">
                  {filteredProducts.length}
                </strong>{" "}
                of {products.length}{" "}
                {products.length === 1 ? "product" : "products"}
                {activeSubcategoryObj
                  ? ` in ${activeSubcategoryObj.name}`
                  : ""}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm shrink-0">
              <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-lg border border-border bg-secondary/40 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-foreground focus:border-primary focus:outline-none"
              >
                <option value="featured">Featured First</option>
                <option value="subcategory">Subcategory</option>
                <option value="name-asc">Alphabetical (A–Z)</option>
                <option value="newest">Newest Added</option>
              </select>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center px-4">
              <p className="text-muted-foreground text-sm mb-4">
                No products have been assigned to {categoryName} yet.
              </p>
              <Link
                href="/contact"
                className="inline-block rounded-lg bg-primary px-6 py-3 text-xs font-bold uppercase tracking-wider text-white"
              >
                Contact Sales Desk
              </Link>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center px-4 space-y-4">
              <h3 className="font-heading text-2xl font-bold uppercase text-foreground">
                No Matching Products in {categoryName}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Try selecting another subcategory or clearing active filters.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-700 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Show All {categoryName} Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
