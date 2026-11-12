"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Layers,
  Award,
  Images,
  Inbox,
  Globe,
  KeyRound,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  LogOut,
  Database,
  Cloud,
  Mail,
  Send,
  ShieldCheck,
  Palette,
} from "lucide-react";
import { ImageUploaderField } from "@/components/cms/ImageUploaderField";
import {
  R2DualConnectionsManager,
  type MaskedIntegrationsPayload,
} from "@/components/admin/R2DualConnectionsManager";
import { CatalogDbImporter } from "@/components/admin/CatalogDbImporter";
import { notify } from "@/lib/toast";
import { cn, safeJsonParse } from "@/lib/utils";
import type { EnrichedProduct } from "@/db/queries";

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  badge: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  featured: boolean;
  sortOrder: number;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  subcategoryCount: number;
  productCount: number;
}

interface SubcategoryItem {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  featured: boolean;
  sortOrder: number;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  category: { id: number; name: string; slug: string } | null;
  productCount: number;
}

interface BrandItem {
  id: number;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  websiteUrl: string;
  authorizedSince: string;
  rating: number;
  featured: boolean;
  sortOrder: number;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  productCount: number;
}

interface SlideItem {
  id: number;
  badge: string;
  titlePart1: string;
  titleHighlight: string;
  titlePart2: string;
  subtitle: string;
  primaryCtaText: string;
  primaryCtaHref: string;
  secondaryCtaText: string;
  secondaryCtaHref: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}

interface InquiryItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
  productId: number | null;
  productName: string;
  status: string;
  emailSent: boolean;
  createdAt: string;
}

interface SeoItem {
  id?: number;
  route: string;
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonicalUrl: string;
  noIndex: boolean;
}

type MaskedIntegrations = MaskedIntegrationsPayload;

interface AdminDashboardClientProps {
  adminName: string;
  adminEmail: string;
  journalMode: string;
  initialProducts: EnrichedProduct[];
  initialCategories: CategoryItem[];
  initialSubcategories: SubcategoryItem[];
  initialBrands: BrandItem[];
  initialSlides: SlideItem[];
  initialInquiries: InquiryItem[];
  initialSeo: SeoItem[];
  initialContent: Record<string, string>;
  initialIntegrations: MaskedIntegrations;
}

type AdminTab =
  | "overview"
  | "products"
  | "categories"
  | "subcategories"
  | "brands"
  | "database"
  | "slides"
  | "inquiries"
  | "seo"
  | "credentials";

const MASK = "••••••••••••••••";

export function AdminDashboardClient({
  adminName,
  adminEmail,
  journalMode,
  initialProducts,
  initialCategories,
  initialSubcategories,
  initialBrands,
  initialSlides,
  initialInquiries,
  initialSeo,
  initialContent,
  initialIntegrations,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  const [productsList, setProductsList] = useState<EnrichedProduct[]>(initialProducts);
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>(initialCategories);
  const [subcategoriesList, setSubcategoriesList] = useState<SubcategoryItem[]>(initialSubcategories);
  const [brandsList, setBrandsList] = useState<BrandItem[]>(initialBrands);
  const [slidesList, setSlidesList] = useState<SlideItem[]>(initialSlides);
  const [inquiriesList, setInquiriesList] = useState<InquiryItem[]>(initialInquiries);
  const [seoList, setSeoList] = useState<SeoItem[]>(initialSeo);
  const [contentMap, setContentMap] = useState<Record<string, string>>(initialContent);
  const [integrations, setIntegrations] = useState<MaskedIntegrations>(initialIntegrations);

  // Search & filters
  const [productQuery, setProductQuery] = useState("");
  const [inquiryFilter, setInquiryFilter] = useState<string>("all");

  // Modal state for CRUD
  const [saving, setSaving] = useState(false);

  // 1) Product Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    slug: "",
    sku: "",
    modelNumber: "",
    shortDescription: "",
    description: "",
    priceText: "Request Wholesale Quote",
    inStock: true,
    featured: false,
    badge: "",
    categoryId: "",
    subcategoryId: "",
    brandId: "",
    imageUrl: "/images/carousel/store-interior.png",
    gallery: [] as string[],
    specs: [] as Array<{ label: string; value: string }>,
    features: [] as string[],
    datasheetUrl: "",
    sortOrder: 0,
    metaTitle: "",
    metaDescription: "",
    ogImage: "",
  });

  // 2) Category Modal State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    badge: "Industrial Line",
    shortDescription: "",
    description: "",
    imageUrl: "/images/carousel/store-interior.png",
    featured: true,
    sortOrder: 0,
    metaTitle: "",
    metaDescription: "",
    ogImage: "",
  });

  // 3) Subcategory Modal State
  const [subcategoryModalOpen, setSubcategoryModalOpen] = useState(false);
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<number | null>(null);
  const [subcategoryForm, setSubcategoryForm] = useState({
    categoryId: "",
    name: "",
    slug: "",
    shortDescription: "",
    description: "",
    imageUrl: "/images/carousel/dewalt-site.png",
    featured: true,
    sortOrder: 0,
    metaTitle: "",
    metaDescription: "",
    ogImage: "",
  });

  // 4) Brand Modal State
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [editingBrandId, setEditingBrandId] = useState<number | null>(null);
  const [brandForm, setBrandForm] = useState({
    name: "",
    slug: "",
    tagline: "Authorized Industrial Partner",
    description: "",
    logoUrl: "",
    bannerUrl: "/images/carousel/bosch-store.png",
    websiteUrl: "",
    authorizedSince: "1968",
    rating: 5,
    featured: true,
    sortOrder: 0,
    metaTitle: "",
    metaDescription: "",
    ogImage: "",
  });

  // 5) Slide Modal State
  const [slideModalOpen, setSlideModalOpen] = useState(false);
  const [editingSlideId, setEditingSlideId] = useState<number | null>(null);
  const [slideForm, setSlideForm] = useState({
    badge: "Premium Industrial Supply",
    titlePart1: "AUTHORIZED",
    titleHighlight: "BOSCH",
    titlePart2: "DEALER",
    subtitle: "",
    primaryCtaText: "View Catalog",
    primaryCtaHref: "/products",
    secondaryCtaText: "Contact Us",
    secondaryCtaHref: "/contact",
    imageUrl: "/images/carousel/bosch-store.png",
    sortOrder: 1,
    isActive: true,
  });

  // 6) SEO & Branding State
  const [selectedSeoRoute, setSelectedSeoRoute] = useState<string>(
    initialSeo[0]?.route || "/"
  );
  const currentSeoItem = useMemo(() => {
    return (
      seoList.find((s) => s.route === selectedSeoRoute) || {
        id: 0,
        route: selectedSeoRoute,
        title: "",
        description: "",
        keywords: "",
        ogTitle: "",
        ogDescription: "",
        ogImage: "/images/carousel/store-interior.png",
        canonicalUrl: "",
        noIndex: false,
      }
    );
  }, [seoList, selectedSeoRoute]);

  const [seoForm, setSeoForm] = useState(currentSeoItem);
  React.useEffect(() => {
    setSeoForm(currentSeoItem);
  }, [currentSeoItem]);

  // 7) Credentials State (SMTP + Password)
  const [smtpForm, setSmtpForm] = useState({
    host: initialIntegrations.smtp.host || "smtp.gmail.com",
    port: initialIntegrations.smtp.port || "465",
    secure: initialIntegrations.smtp.secure,
    user: initialIntegrations.smtp.user,
    pass: initialIntegrations.smtp.passMask || "",
    fromName: initialIntegrations.smtp.fromName || "Mek Engineering Corporation",
    fromEmail: initialIntegrations.smtp.fromEmail,
    adminEmail: initialIntegrations.smtp.adminEmail,
  });
  const [testRecipient, setTestRecipient] = useState(
    initialIntegrations.smtp.adminEmail || adminEmail
  );
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const newInquiriesCount = useMemo(
    () => inquiriesList.filter((i) => i.status === "new").length,
    [inquiriesList]
  );

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    if (!q) return productsList;
    return productsList.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.modelNumber.toLowerCase().includes(q) ||
        (p.brand?.name || "").toLowerCase().includes(q) ||
        (p.category?.name || "").toLowerCase().includes(q)
    );
  }, [productsList, productQuery]);

  const filteredInquiries = useMemo(() => {
    if (inquiryFilter === "all") return inquiriesList;
    return inquiriesList.filter((i) => i.status === inquiryFilter);
  }, [inquiriesList, inquiryFilter]);

  async function refreshCollections() {
    const [pRes, cRes, sRes, bRes, slRes] = await Promise.all([
      fetch("/api/admin/products"),
      fetch("/api/admin/categories"),
      fetch("/api/admin/subcategories"),
      fetch("/api/admin/brands"),
      fetch("/api/admin/slides"),
    ]);
    if (pRes.ok) setProductsList((await pRes.json()).items);
    if (cRes.ok) setCategoriesList((await cRes.json()).items);
    if (sRes.ok) setSubcategoriesList((await sRes.json()).items);
    if (bRes.ok) setBrandsList((await bRes.json()).items);
    if (slRes.ok) setSlidesList((await slRes.json()).items);
    router.refresh();
  }

  // --- Product Handlers ---
  function openNewProduct() {
    setEditingProductId(null);
    setProductForm({
      name: "",
      slug: "",
      sku: "",
      modelNumber: "",
      shortDescription: "",
      description: "",
      priceText: "Request Wholesale Quote",
      inStock: true,
      featured: false,
      badge: "",
      categoryId: categoriesList[0]?.id ? String(categoriesList[0].id) : "",
      subcategoryId: "",
      brandId: brandsList[0]?.id ? String(brandsList[0].id) : "",
      imageUrl: "/images/carousel/store-interior.png",
      gallery: [],
      specs: [{ label: "Brand Warranty", value: "Official Manufacturer Warranty" }],
      features: ["100% Genuine Factory-Sealed Industrial Supply"],
      datasheetUrl: "",
      sortOrder: 0,
      metaTitle: "",
      metaDescription: "",
      ogImage: "",
    });
    setProductModalOpen(true);
  }

  function openEditProduct(p: EnrichedProduct) {
    setEditingProductId(p.id);
    setProductForm({
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      modelNumber: p.modelNumber,
      shortDescription: p.shortDescription,
      description: p.description,
      priceText: p.priceText,
      inStock: p.inStock,
      featured: p.featured,
      badge: p.badge,
      categoryId: p.categoryId ? String(p.categoryId) : "",
      subcategoryId: p.subcategoryId ? String(p.subcategoryId) : "",
      brandId: p.brandId ? String(p.brandId) : "",
      imageUrl: p.imageUrl,
      gallery: safeJsonParse<string[]>(p.galleryJson, []),
      specs: safeJsonParse<Array<{ label: string; value: string }>>(p.specsJson, []),
      features: safeJsonParse<string[]>(p.featuresJson, []),
      datasheetUrl: p.datasheetUrl,
      sortOrder: p.sortOrder,
      metaTitle: p.metaTitle,
      metaDescription: p.metaDescription,
      ogImage: p.ogImage,
    });
    setProductModalOpen(true);
  }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...productForm,
        categoryId: productForm.categoryId ? Number(productForm.categoryId) : null,
        subcategoryId: productForm.subcategoryId ? Number(productForm.subcategoryId) : null,
        brandId: productForm.brandId ? Number(productForm.brandId) : null,
        galleryJson: JSON.stringify(productForm.gallery.filter((g) => g.trim())),
        specsJson: JSON.stringify(
          productForm.specs.filter((s) => s.label.trim() || s.value.trim())
        ),
        featuresJson: JSON.stringify(productForm.features.filter((f) => f.trim())),
      };

      const url = editingProductId
        ? `/api/admin/products/${editingProductId}`
        : "/api/admin/products";
      const method = editingProductId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product");

      notify.success(
        editingProductId ? "Product Updated" : "Product Created",
        `${productForm.name} saved to catalog.`
      );
      setProductModalOpen(false);
      await refreshCollections();
    } catch (err) {
      notify.error("Error", err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(id: number, name: string) {
    if (!window.confirm(`Delete product "${name}" permanently?`)) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete product");
      notify.success("Deleted", `${name} removed from catalog.`);
      await refreshCollections();
    } catch (err) {
      notify.error("Delete Failed", err instanceof Error ? err.message : "Error");
    }
  }

  // --- Category Handlers ---
  function openNewCategory() {
    setEditingCategoryId(null);
    setCategoryForm({
      name: "",
      slug: "",
      badge: "Industrial Line",
      shortDescription: "",
      description: "",
      imageUrl: "/images/carousel/store-interior.png",
      featured: true,
      sortOrder: categoriesList.length + 1,
      metaTitle: "",
      metaDescription: "",
      ogImage: "",
    });
    setCategoryModalOpen(true);
  }

  function openEditCategory(c: CategoryItem) {
    setEditingCategoryId(c.id);
    setCategoryForm({
      name: c.name,
      slug: c.slug,
      badge: c.badge,
      shortDescription: c.shortDescription,
      description: c.description,
      imageUrl: c.imageUrl,
      featured: c.featured,
      sortOrder: c.sortOrder,
      metaTitle: c.metaTitle,
      metaDescription: c.metaDescription,
      ogImage: c.ogImage,
    });
    setCategoryModalOpen(true);
  }

  async function saveCategory(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingCategoryId
        ? `/api/admin/categories/${editingCategoryId}`
        : "/api/admin/categories";
      const res = await fetch(url, {
        method: editingCategoryId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save category");
      notify.success(
        editingCategoryId ? "Category Updated" : "Category Created",
        `${categoryForm.name} saved.`
      );
      setCategoryModalOpen(false);
      await refreshCollections();
    } catch (err) {
      notify.error("Error", err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(id: number, name: string) {
    if (!window.confirm(`Delete category "${name}" and its subcategories?`)) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      notify.success("Category Deleted", name);
      await refreshCollections();
    } else {
      notify.error("Delete Failed", "Could not delete category.");
    }
  }

  // --- Subcategory Handlers ---
  function openNewSubcategory() {
    setEditingSubcategoryId(null);
    setSubcategoryForm({
      categoryId: categoriesList[0]?.id ? String(categoriesList[0].id) : "",
      name: "",
      slug: "",
      shortDescription: "",
      description: "",
      imageUrl: "/images/carousel/dewalt-site.png",
      featured: true,
      sortOrder: subcategoriesList.length + 1,
      metaTitle: "",
      metaDescription: "",
      ogImage: "",
    });
    setSubcategoryModalOpen(true);
  }

  function openEditSubcategory(s: SubcategoryItem) {
    setEditingSubcategoryId(s.id);
    setSubcategoryForm({
      categoryId: String(s.categoryId),
      name: s.name,
      slug: s.slug,
      shortDescription: s.shortDescription,
      description: s.description,
      imageUrl: s.imageUrl,
      featured: s.featured,
      sortOrder: s.sortOrder,
      metaTitle: s.metaTitle,
      metaDescription: s.metaDescription,
      ogImage: s.ogImage,
    });
    setSubcategoryModalOpen(true);
  }

  async function saveSubcategory(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingSubcategoryId
        ? `/api/admin/subcategories/${editingSubcategoryId}`
        : "/api/admin/subcategories";
      const res = await fetch(url, {
        method: editingSubcategoryId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...subcategoryForm,
          categoryId: Number(subcategoryForm.categoryId),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save subcategory");
      notify.success(
        editingSubcategoryId ? "Subcategory Updated" : "Subcategory Created",
        `${subcategoryForm.name} saved.`
      );
      setSubcategoryModalOpen(false);
      await refreshCollections();
    } catch (err) {
      notify.error("Error", err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function deleteSubcategory(id: number, name: string) {
    if (!window.confirm(`Delete subcategory "${name}"?`)) return;
    const res = await fetch(`/api/admin/subcategories/${id}`, { method: "DELETE" });
    if (res.ok) {
      notify.success("Subcategory Deleted", name);
      await refreshCollections();
    } else {
      notify.error("Delete Failed", "Could not delete subcategory.");
    }
  }

  // --- Brand Handlers ---
  function openNewBrand() {
    setEditingBrandId(null);
    setBrandForm({
      name: "",
      slug: "",
      tagline: "Authorized Industrial Partner",
      description: "",
      logoUrl: "",
      bannerUrl: "/images/carousel/bosch-store.png",
      websiteUrl: "",
      authorizedSince: "1968",
      rating: 5,
      featured: true,
      sortOrder: brandsList.length + 1,
      metaTitle: "",
      metaDescription: "",
      ogImage: "",
    });
    setBrandModalOpen(true);
  }

  function openEditBrand(b: BrandItem) {
    setEditingBrandId(b.id);
    setBrandForm({
      name: b.name,
      slug: b.slug,
      tagline: b.tagline,
      description: b.description,
      logoUrl: b.logoUrl,
      bannerUrl: b.bannerUrl,
      websiteUrl: b.websiteUrl,
      authorizedSince: b.authorizedSince,
      rating: b.rating,
      featured: b.featured,
      sortOrder: b.sortOrder,
      metaTitle: b.metaTitle,
      metaDescription: b.metaDescription,
      ogImage: b.ogImage,
    });
    setBrandModalOpen(true);
  }

  async function saveBrand(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingBrandId
        ? `/api/admin/brands/${editingBrandId}`
        : "/api/admin/brands";
      const res = await fetch(url, {
        method: editingBrandId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brandForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save brand");
      notify.success(
        editingBrandId ? "Brand Updated" : "Brand Created",
        `${brandForm.name} saved.`
      );
      setBrandModalOpen(false);
      await refreshCollections();
    } catch (err) {
      notify.error("Error", err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function deleteBrand(id: number, name: string) {
    if (!window.confirm(`Delete brand "${name}"?`)) return;
    const res = await fetch(`/api/admin/brands/${id}`, { method: "DELETE" });
    if (res.ok) {
      notify.success("Brand Deleted", name);
      await refreshCollections();
    } else {
      notify.error("Delete Failed", "Could not delete brand.");
    }
  }

  // --- Hero Slides Handlers ---
  function openNewSlide() {
    setEditingSlideId(null);
    setSlideForm({
      badge: "Premium Industrial Supply",
      titlePart1: "AUTHORIZED",
      titleHighlight: "DEALER",
      titlePart2: "NETWORK",
      subtitle: "100% Genuine Tools & Workshop Machinery Since 1968",
      primaryCtaText: "View Catalog",
      primaryCtaHref: "/products",
      secondaryCtaText: "Contact Us",
      secondaryCtaHref: "/contact",
      imageUrl: "/images/carousel/store-interior.png",
      sortOrder: slidesList.length + 1,
      isActive: true,
    });
    setSlideModalOpen(true);
  }

  function openEditSlide(s: SlideItem) {
    setEditingSlideId(s.id);
    setSlideForm({
      badge: s.badge,
      titlePart1: s.titlePart1,
      titleHighlight: s.titleHighlight,
      titlePart2: s.titlePart2,
      subtitle: s.subtitle,
      primaryCtaText: s.primaryCtaText,
      primaryCtaHref: s.primaryCtaHref,
      secondaryCtaText: s.secondaryCtaText,
      secondaryCtaHref: s.secondaryCtaHref,
      imageUrl: s.imageUrl,
      sortOrder: s.sortOrder,
      isActive: s.isActive,
    });
    setSlideModalOpen(true);
  }

  async function saveSlide(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingSlideId
        ? `/api/admin/slides/${editingSlideId}`
        : "/api/admin/slides";
      const res = await fetch(url, {
        method: editingSlideId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slideForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save slide");
      notify.success(editingSlideId ? "Slide Updated" : "Slide Added");
      setSlideModalOpen(false);
      await refreshCollections();
    } catch (err) {
      notify.error("Error", err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function toggleSlideActive(s: SlideItem) {
    const res = await fetch(`/api/admin/slides/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !s.isActive }),
    });
    if (res.ok) {
      notify.info(s.isActive ? "Slide Hidden" : "Slide Activated");
      await refreshCollections();
    }
  }

  async function deleteSlide(id: number) {
    if (!window.confirm("Delete this hero carousel slide?")) return;
    const res = await fetch(`/api/admin/slides/${id}`, { method: "DELETE" });
    if (res.ok) {
      notify.success("Slide Removed");
      await refreshCollections();
    }
  }

  // --- Inquiries Handlers ---
  async function updateInquiryStatus(id: number, status: string) {
    const res = await fetch(`/api/admin/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setInquiriesList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );
      notify.success("Status Updated", `Marked inquiry #${id} as ${status}.`);
    }
  }

  async function deleteInquiry(id: number) {
    if (!window.confirm(`Delete inquiry #${id} permanently?`)) return;
    const res = await fetch(`/api/admin/inquiries/${id}`, { method: "DELETE" });
    if (res.ok) {
      setInquiriesList((prev) => prev.filter((item) => item.id !== id));
      notify.success("Inquiry Deleted");
    }
  }

  // --- SEO & Global Branding Handlers ---
  async function saveSeoSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/seo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(seoForm),
      });
      if (!res.ok) throw new Error("Failed to save SEO metadata");
      const refreshed = await fetch("/api/admin/seo");
      if (refreshed.ok) setSeoList((await refreshed.json()).items);
      notify.success("SEO Saved", `Metadata updated for route ${seoForm.route}`);
      router.refresh();
    } catch (err) {
      notify.error("Error", err instanceof Error ? err.message : "Failed to save SEO");
    } finally {
      setSaving(false);
    }
  }

  async function saveGlobalIdentity(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const keysToSave = [
        { key: "theme.primaryColor", type: "color", section: "settings" },
        { key: "site.name", type: "text", section: "global" },
        { key: "site.shortName", type: "text", section: "global" },
        { key: "site.established", type: "text", section: "global" },
        { key: "site.logoUrl", type: "image", section: "global" },
        { key: "site.url", type: "url", section: "settings" },
        { key: "social.whatsapp", type: "text", section: "global" },
        { key: "social.facebook", type: "url", section: "global" },
        { key: "social.instagram", type: "url", section: "global" },
        { key: "social.linkedin", type: "url", section: "global" },
        { key: "contact.mapEmbedUrl", type: "url", section: "contact" },
      ];

      const res = await fetch("/api/cms/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: keysToSave.map((k) => ({
            key: k.key,
            value: contentMap[k.key] ?? "",
            type: k.type,
            section: k.section,
          })),
        }),
      });
      if (!res.ok) throw new Error("Failed to save global identity");
      notify.success("Branding Updated", "Theme color, logo, and site URL saved live.");
      router.refresh();
    } catch (err) {
      notify.error("Error", err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  // --- Credentials Handlers ---
  async function saveIntegrations(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/integrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          smtp: smtpForm,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save credentials");

      if (data.data) {
        setIntegrations(data.data);
        setSmtpForm((prev) => ({
          ...prev,
          pass: data.data.smtp.passMask || "",
        }));
      }

      notify.success(
        "SMTP Credentials Saved",
        "Nodemailer + Gmail SMTP settings stored in database."
      );
    } catch (err) {
      notify.error("Error", err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleTestSmtp() {
    setTestingSmtp(true);
    try {
      const res = await fetch("/api/admin/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test-smtp",
          recipientEmail: testRecipient,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.message || "SMTP test failed");
      }
      notify.success("Test Email Dispatched!", data.message);
    } catch (err) {
      notify.error(
        "SMTP Test Failed",
        err instanceof Error ? err.message : "Check Gmail App Password & SMTP settings"
      );
    } finally {
      setTestingSmtp(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      notify.error("Mismatch", "New password and confirmation do not match.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change-password",
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Could not update password");
      }
      notify.success("Password Updated", data.message);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      notify.error("Password Error", err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  const navItems: Array<{
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }> = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package, badge: productsList.length },
    { id: "categories", label: "Categories", icon: FolderTree, badge: categoriesList.length },
    { id: "subcategories", label: "Subcategories", icon: Layers, badge: subcategoriesList.length },
    { id: "brands", label: "Brands", icon: Award, badge: brandsList.length },
    { id: "database", label: "Import .db Catalog", icon: Database },
    { id: "slides", label: "Hero Slides", icon: Images, badge: slidesList.length },
    { id: "inquiries", label: "Inquiries", icon: Inbox, badge: newInquiriesCount || undefined },
    { id: "seo", label: "SEO & Branding", icon: Globe },
    { id: "credentials", label: "R2 & SMTP Keys", icon: KeyRound },
  ];

  return (
    <div className="min-h-screen bg-secondary/40 pt-20">
      {/* Top Admin Header Bar */}
      <div className="bg-slate-950 text-white border-b border-white/10">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-primary mb-1">
              <ShieldCheck className="h-4 w-4" />
              <span>Mek Engineering Command Center</span>
            </div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-tight">
              Admin Dashboard & Catalog Manager
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Signed in as <span className="text-white font-medium">{adminName}</span> ({adminEmail}) • Tip: Visit any live page to hover & click pencil icons for inline text/image edits.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("database")}
              className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-primary/90 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors cursor-pointer"
            >
              <Database className="h-3.5 w-3.5" />
              Upload .db Catalog
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5 text-primary" />
              Live Visual Storefront
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="inline-flex items-center gap-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-red-200 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3 rounded-2xl border border-border bg-white p-3 shadow-xs lg:sticky lg:top-24">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer",
                      active
                        ? "bg-primary text-white shadow-sm"
                        : "text-slate-600 hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </span>
                    {item.badge !== undefined && (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold",
                          active
                            ? "bg-white/20 text-white"
                            : item.id === "inquiries"
                            ? "bg-primary text-white"
                            : "bg-secondary text-slate-600"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Tab Content */}
          <main className="lg:col-span-9 space-y-6">
            {/* ==================== 1. OVERVIEW TAB ==================== */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="rounded-2xl border border-border bg-white p-5 shadow-xs">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Products
                    </p>
                    <p className="font-heading text-3xl font-bold text-foreground mt-1">
                      {productsList.length}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("products")}
                      className="mt-2 text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Manage Catalog →
                    </button>
                  </div>

                  <div className="rounded-2xl border border-border bg-white p-5 shadow-xs">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Categories & Subs
                    </p>
                    <p className="font-heading text-3xl font-bold text-foreground mt-1">
                      {categoriesList.length} / {subcategoriesList.length}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("categories")}
                      className="mt-2 text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Edit Taxonomy →
                    </button>
                  </div>

                  <div className="rounded-2xl border border-border bg-white p-5 shadow-xs">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Authorized Brands
                    </p>
                    <p className="font-heading text-3xl font-bold text-foreground mt-1">
                      {brandsList.length}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("brands")}
                      className="mt-2 text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Manage Brands →
                    </button>
                  </div>

                  <div className="rounded-2xl border border-border bg-white p-5 shadow-xs">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Customer Inquiries
                    </p>
                    <p className="font-heading text-3xl font-bold text-foreground mt-1">
                      {inquiriesList.length}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("inquiries")}
                      className="mt-2 text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                      {newInquiriesCount > 0
                        ? `${newInquiriesCount} New Unread →`
                        : "View Inbox →"}
                    </button>
                  </div>
                </div>

                {/* Infrastructure & DB Credentials Status */}
                <div className="rounded-2xl border border-border bg-white p-6 shadow-xs space-y-4">
                  <h2 className="font-heading text-xl font-bold uppercase text-foreground">
                    System & Cloud Integration Health
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 flex items-start gap-3">
                      <Database className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                          SQLite Engine ({journalMode.toUpperCase()})
                        </p>
                        <p className="text-xs text-emerald-700 mt-0.5">
                          Concurrent WAL mode, busy_timeout & memory temp_store active.
                        </p>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "rounded-xl border p-4 flex items-start gap-3",
                        integrations.activeR2PoolCount > 0
                          ? "border-emerald-200 bg-emerald-50/60"
                          : "border-amber-200 bg-amber-50/60"
                      )}
                    >
                      <Cloud
                        className={cn(
                          "h-5 w-5 shrink-0 mt-0.5",
                          integrations.activeR2PoolCount > 0
                            ? "text-emerald-600"
                            : "text-amber-600"
                        )}
                      />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-900">
                          Cloudflare R2 Pool ({integrations.activeR2PoolCount}/2 Active)
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {integrations.activeR2PoolCount === 2
                            ? `Random 2-bucket load balancing (${integrations.r2Connections[0].bucketName} & ${integrations.r2Connections[1].bucketName})`
                            : integrations.activeR2PoolCount === 1
                            ? `Connected to active bucket "${
                                integrations.r2Connections.find((c) => c.configured && c.enabled)?.bucketName
                              }"`
                            : "Local fallback active. Use One-Click Cloudflare Connect in Credentials."}
                        </p>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "rounded-xl border p-4 flex items-start gap-3",
                        integrations.smtp.configured
                          ? "border-emerald-200 bg-emerald-50/60"
                          : "border-amber-200 bg-amber-50/60"
                      )}
                    >
                      <Mail
                        className={cn(
                          "h-5 w-5 shrink-0 mt-0.5",
                          integrations.smtp.configured ? "text-emerald-600" : "text-amber-600"
                        )}
                      />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-900">
                          Gmail SMTP Mailer
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {integrations.smtp.configured
                            ? `Active (${integrations.smtp.user})`
                            : "Leads saved to DB. Add Gmail App Password for email alerts."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Smart Editing Architecture Guide */}
                <div className="rounded-2xl border border-border bg-slate-900 text-white p-6 space-y-4">
                  <h3 className="font-heading text-xl font-bold uppercase">
                    How Smart Inline Visual Editing Works
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Create or delete catalog items right here in the dashboard, then click any item&apos;s page link (or browse the site while signed in) to edit headings, paragraphs, specs, and images directly on the live page using the hover pencil icons.
                  </p>
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {[
                      { label: "Home Page", href: "/" },
                      { label: "Products Page", href: "/products" },
                      { label: "Categories Page", href: "/categories" },
                      { label: "Subcategories Page", href: "/subcategories" },
                      { label: "Brands Page", href: "/brands" },
                      { label: "About Legacy", href: "/about" },
                      { label: "Contact Page", href: "/contact" },
                    ].map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-primary px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors"
                      >
                        <span>{l.label}</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ==================== DATABASE (.DB) IMPORT TAB ==================== */}
            {activeTab === "database" && (
              <CatalogDbImporter
                currentCounts={{
                  categories: categoriesList.length,
                  subcategories: subcategoriesList.length,
                  products: productsList.length,
                }}
                onImported={refreshCollections}
              />
            )}

            {/* ==================== 2. PRODUCTS TAB ==================== */}
            {activeTab === "products" && (
              <div className="rounded-2xl border border-border bg-white p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
                  <div>
                    <h2 className="font-heading text-2xl font-bold uppercase text-foreground">
                      Industrial Products ({productsList.length})
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Add new products here or open any product&apos;s individual page to edit inline.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openNewProduct}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-red-700 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Add New Product
                  </button>
                </div>

                <div className="relative">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search products by name, SKU, model, brand, or category..."
                    value={productQuery}
                    onChange={(e) => setProductQuery(e.target.value)}
                    className="w-full rounded-lg border border-border bg-secondary/40 pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        <th className="py-3 pr-4">Product</th>
                        <th className="py-3 px-3">Department / Sub</th>
                        <th className="py-3 px-3">Brand</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 pl-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-secondary/30">
                          <td className="py-3.5 pr-4">
                            <div className="flex items-center gap-3">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={p.imageUrl || "/images/carousel/store-interior.png"}
                                alt={p.name}
                                className="h-11 w-11 rounded-lg object-cover border border-border shrink-0 bg-secondary"
                              />
                              <div>
                                <p className="font-bold text-foreground line-clamp-1">{p.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {p.modelNumber || p.sku || `ID #${p.id}`}
                                  {p.featured && (
                                    <span className="ml-2 text-[10px] font-bold uppercase text-primary">
                                      ★ Featured
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-xs text-slate-600">
                            <div>{p.category?.name || "—"}</div>
                            {p.subcategory && (
                              <div className="text-[11px] text-muted-foreground">
                                ↳ {p.subcategory.name}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-xs font-semibold">
                            {p.brand?.name || "—"}
                          </td>
                          <td className="py-3.5 px-3">
                            <span
                              className={cn(
                                "inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase",
                                p.inStock
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              )}
                            >
                              {p.inStock ? "In Stock" : "On Order"}
                            </span>
                          </td>
                          <td className="py-3.5 pl-3 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <Link
                                href={`/products/${p.slug}`}
                                title="Open live product page for inline editing"
                                className="p-2 rounded-lg border border-border hover:border-primary text-slate-600 hover:text-primary transition-colors"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Link>
                              <button
                                type="button"
                                onClick={() => openEditProduct(p)}
                                title="Edit product"
                                className="p-2 rounded-lg border border-border hover:border-primary text-slate-600 hover:text-primary transition-colors cursor-pointer"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteProduct(p.id, p.name)}
                                title="Delete product"
                                className="p-2 rounded-lg border border-border hover:border-red-500 text-slate-600 hover:text-red-600 transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ==================== 3. CATEGORIES TAB ==================== */}
            {activeTab === "categories" && (
              <div className="rounded-2xl border border-border bg-white p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
                  <div>
                    <h2 className="font-heading text-2xl font-bold uppercase text-foreground">
                      Categories ({categoriesList.length})
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Top-level departments dynamically rendered in Footer, Filters & Catalog.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openNewCategory}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-red-700 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Add Category
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoriesList.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-xl border border-border p-4 flex items-center justify-between gap-4 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={c.imageUrl}
                          alt={c.name}
                          className="h-14 w-14 rounded-lg object-cover border border-border shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-heading text-lg font-bold uppercase text-foreground truncate">
                            {c.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {c.productCount} products • {c.subcategoryCount} subcategories
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link
                          href={`/categories/${c.slug}`}
                          title="Edit on live category page"
                          className="p-2 rounded-lg border border-border hover:border-primary text-slate-600 hover:text-primary"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEditCategory(c)}
                          className="p-2 rounded-lg border border-border hover:border-primary text-slate-600 hover:text-primary cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCategory(c.id, c.name)}
                          className="p-2 rounded-lg border border-border hover:border-red-500 text-slate-600 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ==================== 4. SUBCATEGORIES TAB ==================== */}
            {activeTab === "subcategories" && (
              <div className="rounded-2xl border border-border bg-white p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
                  <div>
                    <h2 className="font-heading text-2xl font-bold uppercase text-foreground">
                      Subcategories ({subcategoriesList.length})
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Specialized tool segments linked under parent categories.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openNewSubcategory}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-red-700 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Add Subcategory
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subcategoriesList.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-xl border border-border p-4 flex items-center justify-between gap-4 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={s.imageUrl}
                          alt={s.name}
                          className="h-12 w-12 rounded-lg object-cover border border-border shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                            {s.category?.name || "Unassigned"}
                          </span>
                          <p className="font-heading text-base font-bold uppercase text-foreground truncate">
                            {s.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {s.productCount} products
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link
                          href={`/subcategories/${s.slug}`}
                          title="Edit on live subcategory page"
                          className="p-2 rounded-lg border border-border hover:border-primary text-slate-600 hover:text-primary"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEditSubcategory(s)}
                          className="p-2 rounded-lg border border-border hover:border-primary text-slate-600 hover:text-primary cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSubcategory(s.id, s.name)}
                          className="p-2 rounded-lg border border-border hover:border-red-500 text-slate-600 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ==================== 5. BRANDS TAB ==================== */}
            {activeTab === "brands" && (
              <div className="rounded-2xl border border-border bg-white p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
                  <div>
                    <h2 className="font-heading text-2xl font-bold uppercase text-foreground">
                      Authorized Brands ({brandsList.length})
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Global partner manufacturers showcased on Home & `/brands`.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openNewBrand}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-red-700 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Add Brand
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {brandsList.map((b) => (
                    <div
                      key={b.id}
                      className="rounded-xl border border-border p-4 flex items-center justify-between gap-4 hover:border-primary/40 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="font-heading text-xl font-bold uppercase text-foreground">
                          {b.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{b.tagline}</p>
                        <p className="text-[11px] font-semibold text-primary mt-1">
                          {b.productCount} products • Since {b.authorizedSince}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link
                          href={`/brands/${b.slug}`}
                          title="Open live brand page"
                          className="p-2 rounded-lg border border-border hover:border-primary text-slate-600 hover:text-primary"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEditBrand(b)}
                          className="p-2 rounded-lg border border-border hover:border-primary text-slate-600 hover:text-primary cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteBrand(b.id, b.name)}
                          className="p-2 rounded-lg border border-border hover:border-red-500 text-slate-600 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ==================== 6. HERO SLIDES TAB ==================== */}
            {activeTab === "slides" && (
              <div className="rounded-2xl border border-border bg-white p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
                  <div>
                    <h2 className="font-heading text-2xl font-bold uppercase text-foreground">
                      Homepage Hero Carousel ({slidesList.length})
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Manage fullscreen hero banners, highlighted titles, and CTA links.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openNewSlide}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-red-700 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Add Slide
                  </button>
                </div>

                <div className="space-y-4">
                  {slidesList.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-xl border border-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={s.imageUrl}
                          alt={s.titleHighlight}
                          className="h-16 w-28 rounded-lg object-cover border border-border shrink-0"
                        />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            Order #{s.sortOrder} • {s.badge}
                          </span>
                          <h3 className="font-heading text-lg font-bold uppercase text-foreground">
                            {s.titlePart1}{" "}
                            <span className="text-primary">{s.titleHighlight}</span>{" "}
                            {s.titlePart2}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {s.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleSlideActive(s)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider cursor-pointer",
                            s.isActive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-200 text-slate-600"
                          )}
                        >
                          {s.isActive ? "Active" : "Hidden"}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditSlide(s)}
                          className="p-2 rounded-lg border border-border hover:border-primary text-slate-600 hover:text-primary cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSlide(s.id)}
                          className="p-2 rounded-lg border border-border hover:border-red-500 text-slate-600 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ==================== 7. INQUIRIES TAB ==================== */}
            {activeTab === "inquiries" && (
              <div className="rounded-2xl border border-border bg-white p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
                  <div>
                    <h2 className="font-heading text-2xl font-bold uppercase text-foreground">
                      Leads & Quote Requests ({inquiriesList.length})
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      All contact form messages and product quote inquiries saved in SQLite.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {["all", "new", "read", "replied", "archived"].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setInquiryFilter(st)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider cursor-pointer",
                          inquiryFilter === st
                            ? "bg-slate-900 text-white"
                            : "bg-secondary text-slate-600 hover:text-foreground"
                        )}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredInquiries.length === 0 ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    No inquiries in this view yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredInquiries.map((inq) => (
                      <div
                        key={inq.id}
                        className={cn(
                          "rounded-xl border p-5 space-y-3",
                          inq.status === "new"
                            ? "border-primary/40 bg-primary/[0.02]"
                            : "border-border bg-white"
                        )}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-heading text-lg font-bold uppercase text-foreground">
                                {inq.name}
                              </span>
                              {inq.company && (
                                <span className="text-xs font-medium text-muted-foreground">
                                  ({inq.company})
                                </span>
                              )}
                              <span
                                className={cn(
                                  "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase",
                                  inq.status === "new"
                                    ? "bg-primary text-white"
                                    : inq.status === "replied"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-secondary text-slate-700"
                                )}
                              >
                                {inq.status}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              #{inq.id} • {new Date(inq.createdAt).toLocaleString()} •{" "}
                              <a href={`mailto:${inq.email}`} className="text-primary hover:underline">
                                {inq.email}
                              </a>{" "}
                              •{" "}
                              <a href={`tel:${inq.phone}`} className="font-semibold text-foreground">
                                {inq.phone}
                              </a>
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {["read", "replied", "archived"].map((st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => updateInquiryStatus(inq.id, st)}
                                className="rounded-md border border-border hover:border-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:text-primary cursor-pointer"
                              >
                                Mark {st}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => deleteInquiry(inq.id)}
                              className="p-1.5 rounded-md border border-border hover:border-red-500 text-slate-500 hover:text-red-600 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {(inq.subject || inq.productName) && (
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
                            {inq.productName ? `Product: ${inq.productName}` : inq.subject}
                          </p>
                        )}

                        <p className="text-sm text-slate-700 whitespace-pre-line bg-secondary/50 rounded-lg p-3.5 border border-border/60">
                          {inq.message}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          <a
                            href={`mailto:${inq.email}?subject=${encodeURIComponent(
                              `Re: ${inq.subject || "Your Inquiry at Mek Engineering Corporation"}`
                            )}`}
                            className="text-xs font-bold uppercase tracking-wider text-primary hover:underline"
                          >
                            Reply via Email →
                          </a>
                          <a
                            href={`https://wa.me/${inq.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold uppercase tracking-wider text-emerald-700 hover:underline"
                          >
                            Reply on WhatsApp →
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ==================== 8. SEO & BRANDING TAB ==================== */}
            {activeTab === "seo" && (
              <div className="space-y-6">
                {/* Per-Page SEO Editor */}
                <form
                  onSubmit={saveSeoSettings}
                  className="rounded-2xl border border-border bg-white p-6 shadow-xs space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                    <div>
                      <h2 className="font-heading text-2xl font-bold uppercase text-foreground">
                        Route Metadata, OpenGraph & Robots
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Customize SEO titles, descriptions, keywords, canonical URLs, and OpenGraph share images for `mekengg.com`.
                      </p>
                    </div>

                    <select
                      value={selectedSeoRoute}
                      onChange={(e) => setSelectedSeoRoute(e.target.value)}
                      className="rounded-lg border border-border bg-secondary px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-foreground"
                    >
                      {["/", "/products", "/categories", "/subcategories", "/brands", "/about", "/contact"].map(
                        (r) => (
                          <option key={r} value={r}>
                            Route: {r}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        value={seoForm.title}
                        onChange={(e) => setSeoForm({ ...seoForm, title: e.target.value })}
                        className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Meta Description
                      </label>
                      <textarea
                        rows={3}
                        value={seoForm.description}
                        onChange={(e) =>
                          setSeoForm({ ...seoForm, description: e.target.value })
                        }
                        className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Comma-Separated Keywords
                      </label>
                      <input
                        type="text"
                        value={seoForm.keywords}
                        onChange={(e) => setSeoForm({ ...seoForm, keywords: e.target.value })}
                        className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Canonical URL Override (Optional)
                      </label>
                      <input
                        type="url"
                        placeholder="https://mekengg.com/..."
                        value={seoForm.canonicalUrl}
                        onChange={(e) =>
                          setSeoForm({ ...seoForm, canonicalUrl: e.target.value })
                        }
                        className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        OpenGraph Share Title
                      </label>
                      <input
                        type="text"
                        value={seoForm.ogTitle}
                        onChange={(e) => setSeoForm({ ...seoForm, ogTitle: e.target.value })}
                        className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        OpenGraph Share Description
                      </label>
                      <input
                        type="text"
                        value={seoForm.ogDescription}
                        onChange={(e) =>
                          setSeoForm({ ...seoForm, ogDescription: e.target.value })
                        }
                        className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <ImageUploaderField
                        label="OpenGraph Social Preview Image (Drag & Drop or Ctrl+V)"
                        folder="seo"
                        value={seoForm.ogImage}
                        onChange={(url) => setSeoForm({ ...seoForm, ogImage: url })}
                      />
                    </div>

                    <label className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={seoForm.noIndex}
                        onChange={(e) =>
                          setSeoForm({ ...seoForm, noIndex: e.target.checked })
                        }
                        className="h-4 w-4 accent-primary"
                      />
                      <span>Set noindex, nofollow on this route</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-red-700 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white cursor-pointer"
                  >
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save Route SEO Metadata
                  </button>
                </form>

                {/* Global Brand Identity & Theme Color */}
                <form
                  onSubmit={saveGlobalIdentity}
                  className="rounded-2xl border border-border bg-white p-6 shadow-xs space-y-5"
                >
                  <div className="border-b border-border pb-4 flex items-center gap-2.5">
                    <Palette className="h-5 w-5 text-primary" />
                    <div>
                      <h2 className="font-heading text-2xl font-bold uppercase text-foreground">
                        Global Brand Identity, Theme Color & Socials
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Customize primary brand color, optional header logo image, canonical domain (`https://mekengg.com`), and social URLs.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Primary Accent Color
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={contentMap["theme.primaryColor"] || "#eb2d4a"}
                          onChange={(e) =>
                            setContentMap({
                              ...contentMap,
                              "theme.primaryColor": e.target.value,
                            })
                          }
                          className="h-10 w-14 rounded border border-border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={contentMap["theme.primaryColor"] || "#eb2d4a"}
                          onChange={(e) =>
                            setContentMap({
                              ...contentMap,
                              "theme.primaryColor": e.target.value,
                            })
                          }
                          className="flex-1 rounded-lg border border-border px-3.5 py-2 text-sm font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Canonical Production Domain
                      </label>
                      <input
                        type="url"
                        value={contentMap["site.url"] || "https://mekengg.com"}
                        onChange={(e) =>
                          setContentMap({ ...contentMap, "site.url": e.target.value })
                        }
                        className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Company Full Legal Name
                      </label>
                      <input
                        type="text"
                        value={contentMap["site.name"] || ""}
                        onChange={(e) =>
                          setContentMap({ ...contentMap, "site.name": e.target.value })
                        }
                        className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        WhatsApp Number (Country Code + Digits)
                      </label>
                      <input
                        type="text"
                        value={contentMap["social.whatsapp"] || ""}
                        onChange={(e) =>
                          setContentMap({
                            ...contentMap,
                            "social.whatsapp": e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <ImageUploaderField
                        label="Optional Brand Logo Image (Leave empty to use industrial bold wordmark)"
                        folder="branding"
                        value={contentMap["site.logoUrl"] || ""}
                        onChange={(url) =>
                          setContentMap({ ...contentMap, "site.logoUrl": url })
                        }
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Google Maps Embed URL
                      </label>
                      <input
                        type="url"
                        value={contentMap["contact.mapEmbedUrl"] || ""}
                        onChange={(e) =>
                          setContentMap({
                            ...contentMap,
                            "contact.mapEmbedUrl": e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 hover:bg-primary px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors cursor-pointer"
                  >
                    Save Global Branding
                  </button>
                </form>
              </div>
            )}

            {/* ==================== 9. CREDENTIALS (R2 & SMTP) TAB ==================== */}
            {activeTab === "credentials" && (
              <div className="space-y-6">
                {/* Dual One-Click Cloudflare R2 Connections */}
                <R2DualConnectionsManager
                  integrations={integrations}
                  onUpdated={(next) => setIntegrations(next)}
                />

                <form
                  onSubmit={saveIntegrations}
                  className="rounded-2xl border border-border bg-white p-6 shadow-xs space-y-6"
                >
                  {/* Nodemailer + Gmail SMTP Section */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                      <div className="flex items-center gap-2.5">
                        <Mail className="h-5 w-5 text-primary" />
                        <div>
                          <h2 className="font-heading text-2xl font-bold uppercase text-foreground">
                            Nodemailer + Gmail SMTP Credentials
                          </h2>
                          <p className="text-xs text-muted-foreground">
                            Sends instant inquiry alerts to admin and branded confirmation emails to customers.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="email"
                          placeholder="Test recipient email"
                          value={testRecipient}
                          onChange={(e) => setTestRecipient(e.target.value)}
                          className="rounded-lg border border-border px-3 py-2 text-xs w-44"
                        />
                        <button
                          type="button"
                          disabled={testingSmtp}
                          onClick={handleTestSmtp}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border hover:border-primary px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-foreground hover:text-primary cursor-pointer"
                        >
                          {testingSmtp ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="h-3.5 w-3.5 text-primary" />
                          )}
                          Send Test
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                          SMTP Host
                        </label>
                        <input
                          type="text"
                          value={smtpForm.host}
                          onChange={(e) =>
                            setSmtpForm({ ...smtpForm, host: e.target.value })
                          }
                          className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                          SMTP Port
                        </label>
                        <input
                          type="number"
                          value={smtpForm.port}
                          onChange={(e) =>
                            setSmtpForm({ ...smtpForm, port: e.target.value })
                          }
                          className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
                        />
                      </div>

                      <div className="flex items-end pb-2.5">
                        <label className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={smtpForm.secure}
                            onChange={(e) =>
                              setSmtpForm({ ...smtpForm, secure: e.target.checked })
                            }
                            className="h-4 w-4 accent-primary"
                          />
                          <span>Use SSL/TLS (Port 465)</span>
                        </label>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                          Gmail Address (SMTP User)
                        </label>
                        <input
                          type="email"
                          placeholder="youraccount@gmail.com"
                          value={smtpForm.user}
                          onChange={(e) =>
                            setSmtpForm({ ...smtpForm, user: e.target.value })
                          }
                          className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                          Gmail 16-Character App Password{" "}
                          {integrations.smtp.hasPass && (
                            <span className="text-emerald-600">(Saved)</span>
                          )}
                        </label>
                        <input
                          type="password"
                          placeholder={
                            integrations.smtp.hasPass
                              ? MASK
                              : "xxxx xxxx xxxx xxxx"
                          }
                          value={smtpForm.pass}
                          onFocus={() => {
                            if (smtpForm.pass === MASK) {
                              setSmtpForm({ ...smtpForm, pass: "" });
                            }
                          }}
                          onChange={(e) =>
                            setSmtpForm({ ...smtpForm, pass: e.target.value })
                          }
                          className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                          Sender Display Name
                        </label>
                        <input
                          type="text"
                          value={smtpForm.fromName}
                          onChange={(e) =>
                            setSmtpForm({ ...smtpForm, fromName: e.target.value })
                          }
                          className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                          From Email Address
                        </label>
                        <input
                          type="email"
                          value={smtpForm.fromEmail}
                          onChange={(e) =>
                            setSmtpForm({ ...smtpForm, fromEmail: e.target.value })
                          }
                          className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                          Admin Alert Notification Email
                        </label>
                        <input
                          type="email"
                          value={smtpForm.adminEmail}
                          onChange={(e) =>
                            setSmtpForm({ ...smtpForm, adminEmail: e.target.value })
                          }
                          className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-red-700 px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md cursor-pointer"
                  >
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save Gmail SMTP Credentials to Database
                  </button>
                </form>

                {/* Admin Password Update */}
                <form
                  onSubmit={handleChangePassword}
                  className="rounded-2xl border border-border bg-white p-6 shadow-xs space-y-4"
                >
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    <h3 className="font-heading text-xl font-bold uppercase text-foreground">
                      Change Administrator Password
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="password"
                      required
                      placeholder="Current Password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      }
                      className="rounded-lg border border-border px-3.5 py-2.5 text-sm"
                    />
                    <input
                      type="password"
                      required
                      minLength={8}
                      placeholder="New Password (min 8 chars)"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                      className="rounded-lg border border-border px-3.5 py-2.5 text-sm"
                    />
                    <input
                      type="password"
                      required
                      minLength={8}
                      placeholder="Confirm New Password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                      }
                      className="rounded-lg border border-border px-3.5 py-2.5 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-slate-900 hover:bg-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors cursor-pointer"
                  >
                    Update Admin Password
                  </button>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ==================== MODALS FOR CRUD ==================== */}

      {/* PRODUCT MODAL */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-border shadow-2xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="font-heading text-2xl font-bold uppercase text-foreground">
                {editingProductId ? "Edit Product" : "Add New Industrial Product"}
              </h3>
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="p-2 rounded-lg hover:bg-secondary cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={saveProduct} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Model Number
                  </label>
                  <input
                    type="text"
                    value={productForm.modelNumber}
                    onChange={(e) =>
                      setProductForm({ ...productForm, modelNumber: e.target.value })
                    }
                    className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Category
                  </label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        categoryId: e.target.value,
                        subcategoryId: "",
                      })
                    }
                    className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
                  >
                    <option value="">— Select Category —</option>
                    {categoriesList.map((c) => (
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
                    value={productForm.subcategoryId}
                    onChange={(e) =>
                      setProductForm({ ...productForm, subcategoryId: e.target.value })
                    }
                    className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
                  >
                    <option value="">— Select Subcategory —</option>
                    {subcategoriesList
                      .filter(
                        (s) =>
                          !productForm.categoryId ||
                          String(s.categoryId) === String(productForm.categoryId)
                      )
                      .map((s) => (
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
                    value={productForm.brandId}
                    onChange={(e) =>
                      setProductForm({ ...productForm, brandId: e.target.value })
                    }
                    className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
                  >
                    <option value="">— Select Brand —</option>
                    {brandsList.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Pricing / Quote Label
                  </label>
                  <input
                    type="text"
                    value={productForm.priceText}
                    onChange={(e) =>
                      setProductForm({ ...productForm, priceText: e.target.value })
                    }
                    className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Ribbon Badge (e.g. Best Seller)
                  </label>
                  <input
                    type="text"
                    value={productForm.badge}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                    className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
                  />
                </div>

                <div className="flex items-center gap-6 pt-5">
                  <label className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.inStock}
                      onChange={(e) =>
                        setProductForm({ ...productForm, inStock: e.target.checked })
                      }
                      className="h-4 w-4 accent-primary"
                    />
                    <span>In Stock</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.featured}
                      onChange={(e) =>
                        setProductForm({ ...productForm, featured: e.target.checked })
                      }
                      className="h-4 w-4 accent-primary"
                    />
                    <span>Featured on Home</span>
                  </label>
                </div>
              </div>

              <ImageUploaderField
                label="Primary Product Image (Drag & Drop or Ctrl+V)"
                folder="products"
                value={productForm.imageUrl}
                onChange={(url) => setProductForm({ ...productForm, imageUrl: url })}
              />

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Short Summary
                </label>
                <textarea
                  rows={2}
                  value={productForm.shortDescription}
                  onChange={(e) =>
                    setProductForm({ ...productForm, shortDescription: e.target.value })
                  }
                  className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Full Detailed Overview
                </label>
                <textarea
                  rows={4}
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({ ...productForm, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
                />
              </div>

              {/* Technical Specs Builder */}
              <div className="space-y-2 rounded-xl border border-border p-4 bg-secondary/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Technical Specifications
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setProductForm({
                        ...productForm,
                        specs: [...productForm.specs, { label: "", value: "" }],
                      })
                    }
                    className="text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    + Add Spec Row
                  </button>
                </div>
                {productForm.specs.map((sp, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Label (e.g. Rated Input Power)"
                      value={sp.label}
                      onChange={(e) => {
                        const next = [...productForm.specs];
                        next[idx] = { ...next[idx], label: e.target.value };
                        setProductForm({ ...productForm, specs: next });
                      }}
                      className="w-1/2 rounded-lg border border-border bg-white px-3 py-2 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. 800 W)"
                      value={sp.value}
                      onChange={(e) => {
                        const next = [...productForm.specs];
                        next[idx] = { ...next[idx], value: e.target.value };
                        setProductForm({ ...productForm, specs: next });
                      }}
                      className="w-1/2 rounded-lg border border-border bg-white px-3 py-2 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setProductForm({
                          ...productForm,
                          specs: productForm.specs.filter((_, i) => i !== idx),
                        })
                      }
                      className="px-2 text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Key Features Builder */}
              <div className="space-y-2 rounded-xl border border-border p-4 bg-secondary/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Key Highlights / Bullet Points
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setProductForm({
                        ...productForm,
                        features: [...productForm.features, ""],
                      })
                    }
                    className="text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    + Add Highlight
                  </button>
                </div>
                {productForm.features.map((ft, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Industrial highlight..."
                      value={ft}
                      onChange={(e) => {
                        const next = [...productForm.features];
                        next[idx] = e.target.value;
                        setProductForm({ ...productForm, features: next });
                      }}
                      className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setProductForm({
                          ...productForm,
                          features: productForm.features.filter((_, i) => i !== idx),
                        })
                      }
                      className="px-2 text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="rounded-lg border border-border px-5 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-red-700 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white cursor-pointer"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingProductId ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-border shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-heading text-2xl font-bold uppercase">
                {editingCategoryId ? "Edit Category" : "New Category"}
              </h3>
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-secondary cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={saveCategory} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryForm.name}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, name: e.target.value })
                    }
                    className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    value={categoryForm.badge}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, badge: e.target.value })
                    }
                    className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              <ImageUploaderField
                label="Category Cover Image (Drag & Drop or Ctrl+V)"
                folder="categories"
                value={categoryForm.imageUrl}
                onChange={(url) => setCategoryForm({ ...categoryForm, imageUrl: url })}
              />

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={categoryForm.shortDescription}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      shortDescription: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-border px-3.5 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Full Description
                </label>
                <textarea
                  rows={3}
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-border px-3.5 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 text-xs font-bold uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-primary hover:bg-red-700 px-6 py-2 text-xs font-bold uppercase text-white cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBCATEGORY MODAL */}
      {subcategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-border shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-heading text-2xl font-bold uppercase">
                {editingSubcategoryId ? "Edit Subcategory" : "New Subcategory"}
              </h3>
              <button
                type="button"
                onClick={() => setSubcategoryModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-secondary cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={saveSubcategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Parent Category *
                </label>
                <select
                  required
                  value={subcategoryForm.categoryId}
                  onChange={(e) =>
                    setSubcategoryForm({ ...subcategoryForm, categoryId: e.target.value })
                  }
                  className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
                >
                  <option value="">— Select Parent Category —</option>
                  {categoriesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Subcategory Name *
                </label>
                <input
                  type="text"
                  required
                  value={subcategoryForm.name}
                  onChange={(e) =>
                    setSubcategoryForm({ ...subcategoryForm, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
                />
              </div>

              <ImageUploaderField
                label="Subcategory Image (Drag & Drop or Ctrl+V)"
                folder="subcategories"
                value={subcategoryForm.imageUrl}
                onChange={(url) =>
                  setSubcategoryForm({ ...subcategoryForm, imageUrl: url })
                }
              />

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={subcategoryForm.shortDescription}
                  onChange={(e) =>
                    setSubcategoryForm({
                      ...subcategoryForm,
                      shortDescription: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-border px-3.5 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Full Description
                </label>
                <textarea
                  rows={3}
                  value={subcategoryForm.description}
                  onChange={(e) =>
                    setSubcategoryForm({
                      ...subcategoryForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-border px-3.5 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSubcategoryModalOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 text-xs font-bold uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-primary hover:bg-red-700 px-6 py-2 text-xs font-bold uppercase text-white cursor-pointer"
                >
                  Save Subcategory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BRAND MODAL */}
      {brandModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-border shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-heading text-2xl font-bold uppercase">
                {editingBrandId ? "Edit Brand" : "Add Authorized Brand"}
              </h3>
              <button
                type="button"
                onClick={() => setBrandModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-secondary cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={saveBrand} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={brandForm.name}
                    onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                    className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Authorized Since
                  </label>
                  <input
                    type="text"
                    value={brandForm.authorizedSince}
                    onChange={(e) =>
                      setBrandForm({ ...brandForm, authorizedSince: e.target.value })
                    }
                    className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={brandForm.tagline}
                  onChange={(e) => setBrandForm({ ...brandForm, tagline: e.target.value })}
                  className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm"
                />
              </div>

              <ImageUploaderField
                label="Brand Logo (Optional — Drag & Drop or Ctrl+V)"
                folder="brands"
                value={brandForm.logoUrl}
                onChange={(url) => setBrandForm({ ...brandForm, logoUrl: url })}
              />

              <ImageUploaderField
                label="Brand Hero Banner (Drag & Drop or Ctrl+V)"
                folder="brands"
                value={brandForm.bannerUrl}
                onChange={(url) => setBrandForm({ ...brandForm, bannerUrl: url })}
              />

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Brand Overview
                </label>
                <textarea
                  rows={3}
                  value={brandForm.description}
                  onChange={(e) =>
                    setBrandForm({ ...brandForm, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-border px-3.5 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBrandModalOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 text-xs font-bold uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-primary hover:bg-red-700 px-6 py-2 text-xs font-bold uppercase text-white cursor-pointer"
                >
                  Save Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HERO SLIDE MODAL */}
      {slideModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-border shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-heading text-2xl font-bold uppercase">
                {editingSlideId ? "Edit Hero Slide" : "New Hero Slide"}
              </h3>
              <button
                type="button"
                onClick={() => setSlideModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-secondary cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={saveSlide} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Eyebrow Badge
                </label>
                <input
                  type="text"
                  value={slideForm.badge}
                  onChange={(e) => setSlideForm({ ...slideForm, badge: e.target.value })}
                  className="w-full rounded-lg border border-border px-3.5 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Title Prefix
                  </label>
                  <input
                    type="text"
                    value={slideForm.titlePart1}
                    onChange={(e) =>
                      setSlideForm({ ...slideForm, titlePart1: e.target.value })
                    }
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-primary mb-1">
                    Crimson Highlight
                  </label>
                  <input
                    type="text"
                    value={slideForm.titleHighlight}
                    onChange={(e) =>
                      setSlideForm({ ...slideForm, titleHighlight: e.target.value })
                    }
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Title Suffix
                  </label>
                  <input
                    type="text"
                    value={slideForm.titlePart2}
                    onChange={(e) =>
                      setSlideForm({ ...slideForm, titlePart2: e.target.value })
                    }
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={slideForm.subtitle}
                  onChange={(e) =>
                    setSlideForm({ ...slideForm, subtitle: e.target.value })
                  }
                  className="w-full rounded-lg border border-border px-3.5 py-2 text-sm"
                />
              </div>

              <ImageUploaderField
                label="Hero Background Image (Drag & Drop or Ctrl+V)"
                folder="slides"
                value={slideForm.imageUrl}
                onChange={(url) => setSlideForm({ ...slideForm, imageUrl: url })}
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Primary Button Text"
                  value={slideForm.primaryCtaText}
                  onChange={(e) =>
                    setSlideForm({ ...slideForm, primaryCtaText: e.target.value })
                  }
                  className="rounded-lg border border-border px-3 py-2 text-xs"
                />
                <input
                  type="text"
                  placeholder="Primary Link (/products)"
                  value={slideForm.primaryCtaHref}
                  onChange={(e) =>
                    setSlideForm({ ...slideForm, primaryCtaHref: e.target.value })
                  }
                  className="rounded-lg border border-border px-3 py-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSlideModalOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 text-xs font-bold uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-primary hover:bg-red-700 px-6 py-2 text-xs font-bold uppercase text-white cursor-pointer"
                >
                  Save Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
