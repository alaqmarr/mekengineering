"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings2, X, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { useCms } from "./CmsContext";
import { ImageUploaderField } from "./ImageUploaderField";
import { notify } from "@/lib/toast";
import { safeJsonParse } from "@/lib/utils";
import type { Category, Subcategory, Brand, Product } from "@/db/schema";

interface ProductEditorButtonProps {
  product: Product;
  categories: Category[];
  subcategories: Subcategory[];
  brands: Brand[];
}

export function ProductDetailAdminBar({
  product,
  categories,
  subcategories,
  brands,
}: ProductEditorButtonProps) {
  const { isAdmin } = useCms();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    modelNumber: product.modelNumber,
    badge: product.badge,
    priceText: product.priceText,
    inStock: product.inStock,
    featured: product.featured,
    categoryId: product.categoryId ? String(product.categoryId) : "",
    subcategoryId: product.subcategoryId ? String(product.subcategoryId) : "",
    brandId: product.brandId ? String(product.brandId) : "",
    imageUrl: product.imageUrl,
    gallery: safeJsonParse<string[]>(product.galleryJson, []),
    specs: safeJsonParse<Array<{ label: string; value: string }>>(product.specsJson, []),
    features: safeJsonParse<string[]>(product.featuresJson, []),
    datasheetUrl: product.datasheetUrl,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
  });

  if (!isAdmin) return null;

  const filteredSubcategories = form.categoryId
    ? subcategories.filter((s) => String(s.categoryId) === form.categoryId)
    : subcategories;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          categoryId: form.categoryId ? Number(form.categoryId) : null,
          subcategoryId: form.subcategoryId ? Number(form.subcategoryId) : null,
          brandId: form.brandId ? Number(form.brandId) : null,
          specs: form.specs.filter((s) => s.label.trim() || s.value.trim()),
          features: form.features.filter((f) => f.trim()),
          gallery: form.gallery.filter((g) => g.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update product");

      notify.success("Product Saved", "All product fields updated in database.");
      setOpen(false);
      if (data.item?.slug && data.item.slug !== product.slug) {
        router.replace(`/products/${data.item.slug}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      notify.error("Save Failed", err instanceof Error ? err.message : "Error saving product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/25 bg-[#111318] px-5 py-3 text-white shadow-md">
        <div className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="font-bold uppercase tracking-wider text-white">
            Admin Product Controls:
          </span>
          <span className="text-slate-300">
            Hover any text/image below to edit inline, or open full configuration.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-red-700 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors cursor-pointer"
        >
          <Settings2 className="h-3.5 w-3.5" />
          Configure Specs, Media & SEO
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => !saving && setOpen(false)}
        >
          <div
            className="my-8 w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-[#111318] px-6 py-4 border-b-2 border-primary shrink-0">
              <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-white">
                Edit Product - {product.name}
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Model Number
                  </label>
                  <input
                    type="text"
                    value={form.modelNumber}
                    onChange={(e) => setForm({ ...form, modelNumber: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Department / Category
                  </label>
                  <select
                    value={form.categoryId}
                    onChange={(e) =>
                      setForm({ ...form, categoryId: e.target.value, subcategoryId: "" })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white"
                  >
                    <option value="">-- Uncategorized --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Subcategory
                  </label>
                  <select
                    value={form.subcategoryId}
                    onChange={(e) => setForm({ ...form, subcategoryId: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white"
                  >
                    <option value="">-- Optional Subcategory --</option>
                    {filteredSubcategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Brand
                  </label>
                  <select
                    value={form.brandId}
                    onChange={(e) => setForm({ ...form, brandId: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white"
                  >
                    <option value="">-- Optional Brand --</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Amount / Reference Price (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Optional - leave blank"
                    value={form.priceText}
                    onChange={(e) => setForm({ ...form, priceText: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-6 rounded-lg bg-slate-50 p-3.5 border border-slate-200">
                <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.inStock}
                    onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
                    className="h-4 w-4 accent-primary"
                  />
                  Available for Inquiry
                </label>
                <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="h-4 w-4 accent-primary"
                  />
                  Featured on Homepage
                </label>
              </div>

              <ImageUploaderField
                label="Primary Product Image (Cloudflare R2)"
                value={form.imageUrl}
                onChange={(url) => setForm({ ...form, imageUrl: url })}
                folder="products"
              />

              {/* Additional Gallery URLs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Additional Gallery Images
                  </label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, gallery: [...form.gallery, ""] })}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Gallery Image
                  </button>
                </div>
                {form.gallery.map((gUrl, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="flex-1">
                      <ImageUploaderField
                        label=""
                        value={gUrl}
                        onChange={(nextUrl) => {
                          const copy = [...form.gallery];
                          copy[idx] = nextUrl;
                          setForm({ ...form, gallery: copy });
                        }}
                        folder="products"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          gallery: form.gallery.filter((_, i) => i !== idx),
                        })
                      }
                      className="mt-2 rounded p-2 text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Technical Specifications */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Technical Specifications Table
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        specs: [...form.specs, { label: "", value: "" }],
                      })
                    }
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Spec Row
                  </button>
                </div>
                {form.specs.map((spec, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Parameter (e.g. Power Input)"
                      value={spec.label}
                      onChange={(e) => {
                        const copy = [...form.specs];
                        copy[idx] = { ...copy[idx], label: e.target.value };
                        setForm({ ...form, specs: copy });
                      }}
                      className="w-1/2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. 800 W)"
                      value={spec.value}
                      onChange={(e) => {
                        const copy = [...form.specs];
                        copy[idx] = { ...copy[idx], value: e.target.value };
                        setForm({ ...form, specs: copy });
                      }}
                      className="w-1/2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          specs: form.specs.filter((_, i) => i !== idx),
                        })
                      }
                      className="rounded p-2 text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Key Highlights */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Key Feature Bullets
                  </label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, features: [...form.features, ""] })}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Bullet
                  </button>
                </div>
                {form.features.map((feat, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={feat}
                      placeholder="Key product highlight..."
                      onChange={(e) => {
                        const copy = [...form.features];
                        copy[idx] = e.target.value;
                        setForm({ ...form, features: copy });
                      }}
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          features: form.features.filter((_, i) => i !== idx),
                        })
                      }
                      className="rounded p-2 text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <ImageUploaderField
                label="Optional Technical Datasheet / Brochure (PDF or Image)"
                value={form.datasheetUrl}
                onChange={(url) => setForm({ ...form, datasheetUrl: url })}
                folder="datasheets"
                accept="application/pdf,image/*"
                placeholder="Paste PDF URL or upload to R2..."
              />

              {/* SEO Overrides */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200 pt-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    SEO Meta Title Override
                  </label>
                  <input
                    type="text"
                    value={form.metaTitle}
                    placeholder={`${form.name} | Mek Engineering`}
                    onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    SEO Meta Description Override
                  </label>
                  <input
                    type="text"
                    value={form.metaDescription}
                    placeholder="Custom search engine snippet..."
                    onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-slate-200 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-red-700 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md cursor-pointer"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

interface TaxonomyAdminBarProps {
  endpoint: "categories" | "subcategories" | "brands";
  entityLabel: string;
  item: {
    id: number;
    name: string;
    slug: string;
    imageUrl?: string;
    logoUrl?: string;
    bannerUrl?: string;
    websiteUrl?: string;
    authorizedSince?: string;
    categoryId?: number;
    metaTitle: string;
    metaDescription: string;
  };
  parentCategories?: Category[];
}

export function TaxonomyDetailAdminBar({
  endpoint,
  entityLabel,
  item,
  parentCategories,
}: TaxonomyAdminBarProps) {
  const { isAdmin } = useCms();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: item.name,
    slug: item.slug,
    categoryId: item.categoryId ? String(item.categoryId) : "",
    imageUrl: item.imageUrl || "",
    logoUrl: item.logoUrl || "",
    bannerUrl: item.bannerUrl || "",
    websiteUrl: item.websiteUrl || "",
    authorizedSince: item.authorizedSince || "",
    metaTitle: item.metaTitle || "",
    metaDescription: item.metaDescription || "",
  });

  if (!isAdmin) return null;

  const basePath =
    endpoint === "categories"
      ? "/categories"
      : endpoint === "subcategories"
      ? "/subcategories"
      : "/brands";

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        slug: form.slug,
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
      };
      if (endpoint === "subcategories" && form.categoryId) {
        payload.categoryId = Number(form.categoryId);
      }
      if (endpoint === "brands") {
        payload.logoUrl = form.logoUrl;
        payload.bannerUrl = form.bannerUrl;
        payload.websiteUrl = form.websiteUrl;
        payload.authorizedSince = form.authorizedSince;
      } else {
        payload.imageUrl = form.imageUrl;
      }

      const res = await fetch(`/api/admin/${endpoint}/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");

      notify.success(`${entityLabel} Updated`, "Saved directly to SQLite database.");
      setOpen(false);
      if (data.item?.slug && data.item.slug !== item.slug) {
        router.replace(`${basePath}/${data.item.slug}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      notify.error("Update Failed", err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/15 bg-black/65 backdrop-blur-md px-5 py-3 text-white">
        <div className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="font-bold uppercase tracking-wider">
            Admin {entityLabel} Controls:
          </span>
          <span className="text-slate-300">
            Hover headings & paragraphs to edit inline, or configure media & SEO.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-red-700 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors cursor-pointer"
        >
          <Settings2 className="h-3.5 w-3.5" />
          Configure {entityLabel} & SEO
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => !saving && setOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-[#111318] px-6 py-4 border-b-2 border-primary">
              <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-white">
                Edit {entityLabel} - {item.name}
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    {entityLabel} Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-slate-900"
                  />
                </div>
              </div>

              {endpoint === "subcategories" && parentCategories && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Parent Category
                  </label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white"
                  >
                    {parentCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {endpoint === "brands" ? (
                <>
                  <ImageUploaderField
                    label="Brand Logo Image (Optional - leave blank for bold industrial wordmark)"
                    value={form.logoUrl}
                    onChange={(url) => setForm({ ...form, logoUrl: url })}
                    folder="brands"
                  />
                  <ImageUploaderField
                    label="Brand Hero Banner Image"
                    value={form.bannerUrl}
                    onChange={(url) => setForm({ ...form, bannerUrl: url })}
                    folder="brands"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Authorized Dealer Since
                      </label>
                      <input
                        type="text"
                        value={form.authorizedSince}
                        onChange={(e) =>
                          setForm({ ...form, authorizedSince: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Official Brand Website
                      </label>
                      <input
                        type="text"
                        value={form.websiteUrl}
                        onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <ImageUploaderField
                  label={`${entityLabel} Banner / Card Image`}
                  value={form.imageUrl}
                  onChange={(url) => setForm({ ...form, imageUrl: url })}
                  folder={endpoint}
                />
              )}

              <div className="border-t border-slate-200 pt-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    SEO Meta Title Override
                  </label>
                  <input
                    type="text"
                    value={form.metaTitle}
                    onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    SEO Meta Description Override
                  </label>
                  <textarea
                    rows={2}
                    value={form.metaDescription}
                    onChange={(e) =>
                      setForm({ ...form, metaDescription: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-red-700 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white cursor-pointer"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
