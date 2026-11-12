"use client";

import React, { useMemo, useState } from "react";
import { Search, SlidersHorizontal, RotateCcw } from "lucide-react";
import type { Category, Subcategory, Brand } from "@/db/schema";
import type { EnrichedProduct } from "@/db/queries";
import { ProductCard } from "./ProductCard";
import { EditableText } from "@/components/cms/Editable";

interface ProductsCatalogClientProps {
  products: EnrichedProduct[];
  categories: Category[];
  subcategories: Subcategory[];
  brands: Brand[];
  initialCategory?: string;
  initialSubcategory?: string;
  initialBrand?: string;
  initialQuery?: string;
}

export function ProductsCatalogClient({
  products,
  categories,
  subcategories,
  brands,
  initialCategory = "",
  initialSubcategory = "",
  initialBrand = "",
  initialQuery = "",
}: ProductsCatalogClientProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState(initialSubcategory);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [sortBy, setSortBy] = useState<"featured" | "name-asc" | "newest">("featured");

  const visibleSubcategories = useMemo(() => {
    if (!selectedCategory) return subcategories;
    const cat = categories.find(
      (c) => c.slug === selectedCategory || String(c.id) === selectedCategory
    );
    if (!cat) return subcategories;
    return subcategories.filter((s) => s.categoryId === cat.id);
  }, [categories, subcategories, selectedCategory]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter((p) => {
      if (selectedCategory) {
        const matchCat =
          p.category?.slug === selectedCategory ||
          String(p.categoryId) === selectedCategory ||
          p.category?.name.toLowerCase() === selectedCategory.toLowerCase();
        if (!matchCat) return false;
      }
      if (selectedSubcategory) {
        const matchSub =
          p.subcategory?.slug === selectedSubcategory ||
          String(p.subcategoryId) === selectedSubcategory;
        if (!matchSub) return false;
      }
      if (selectedBrand) {
        const matchBrand =
          p.brand?.slug === selectedBrand ||
          String(p.brandId) === selectedBrand ||
          p.brand?.name.toLowerCase() === selectedBrand.toLowerCase();
        if (!matchBrand) return false;
      }
      if (q) {
        const haystack = `${p.name} ${p.sku} ${p.modelNumber} ${p.shortDescription} ${p.brand?.name || ""} ${p.category?.name || ""} ${p.subcategory?.name || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

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
    query,
    selectedCategory,
    selectedSubcategory,
    selectedBrand,
    sortBy,
  ]);

  function clearFilters() {
    setQuery("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedBrand("");
  }

  const hasFilters = Boolean(
    query || selectedCategory || selectedSubcategory || selectedBrand
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Sidebar Filters */}
      <aside className="lg:col-span-3 rounded-2xl border border-border bg-white p-6 shadow-xs space-y-6 lg:sticky lg:top-24">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <EditableText
              contentKey="products.filters.heading"
              fallback="Filter Catalog"
              label="Filter Sidebar Heading"
              section="products"
              as="h2"
              className="font-heading text-lg font-bold uppercase tracking-wide"
            />
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>

        {/* Search Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Search SKU / Equipment
          </label>
          <div className="relative">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Model, brand, keyword..."
              className="w-full rounded-lg border border-border bg-secondary/40 pl-10 pr-3 py-2.5 text-sm text-foreground focus:border-primary focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Categories Filter */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Categories
          </label>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("");
                setSelectedSubcategory("");
              }}
              className={`w-full text-left rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                !selectedCategory
                  ? "bg-primary text-white font-bold"
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.slug);
                  setSelectedSubcategory("");
                }}
                className={`w-full text-left rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  selectedCategory === cat.slug
                    ? "bg-primary text-white font-bold"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Subcategories Filter */}
        {visibleSubcategories.length > 0 && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Subcategories
            </label>
            <select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">All Subcategories</option>
              {visibleSubcategories.map((sub) => (
                <option key={sub.id} value={sub.slug}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Brands Filter */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Authorized Brands
          </label>
          <div className="flex flex-wrap gap-2">
            {brands.map((b) => {
              const active = selectedBrand === b.slug;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBrand(active ? "" : b.slug)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    active
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-secondary/40 text-foreground hover:border-primary"
                  }`}
                >
                  {b.name}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Product Grid */}
      <div className="lg:col-span-9 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-white px-5 py-3.5 shadow-xs">
          <p className="text-sm text-muted-foreground">
            Showing <strong className="text-foreground">{filteredProducts.length}</strong>{" "}
            {filteredProducts.length === 1 ? "industrial product" : "industrial products"}
          </p>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "featured" | "name-asc" | "newest")
              }
              className="rounded-lg border border-border bg-secondary/40 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-foreground focus:border-primary focus:outline-none"
            >
              <option value="featured">Featured First</option>
              <option value="name-asc">Alphabetical (A–Z)</option>
              <option value="newest">Newest Added</option>
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white py-20 px-6 text-center space-y-4">
            <EditableText
              contentKey="products.empty.heading"
              fallback="No Matching Equipment Found"
              label="Empty Catalog Heading"
              section="products"
              as="h3"
              className="font-heading text-2xl font-bold uppercase text-foreground"
            />
            <EditableText
              contentKey="products.empty.paragraph"
              fallback="Try clearing one or more filters or contact our sales desk with the model or part number you are looking for."
              label="Empty Catalog Paragraph"
              section="products"
              type="textarea"
              as="p"
              className="text-sm text-muted-foreground max-w-md mx-auto"
            />
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg bg-primary hover:bg-red-700 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
