"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Phone,
  Search,
  X,
  LayoutDashboard,
  ChevronDown,
  ArrowRight,
  Layers,
} from "lucide-react";
import { useCms } from "@/components/cms/CmsContext";
import { cn } from "@/lib/utils";

export interface NavbarCategoryItem {
  id: number;
  name: string;
  slug: string;
  shortDescription?: string;
  productCount?: number;
  subcategoryCount?: number;
}

interface NavbarProps {
  categories?: NavbarCategoryItem[];
}

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products", hasCategoriesDropdown: true },
  { href: "/brands", label: "Brands" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar({ categories = [] }: NavbarProps) {
  const pathname = usePathname();
  const { isAdmin, getText } = useCms();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [productsMenuOpen, setProductsMenuOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isTransparentHeroPage = pathname === "/";
  const useSolidNavbar =
    !isTransparentHeroPage || scrolled || mobileOpen || productsMenuOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProductsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Hide public navbar inside /admin so Admin Dashboard has full-width workspace
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const brandShort = getText("site.shortName", "MEK ENGINEERING");
  const established = getText("site.established", "Since 1968");
  const logoUrl = getText("site.logoUrl", "");
  const ctaLabel = getText("nav.ctaButton", "Get Quote");

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/products") {
      return (
        pathname === "/products" ||
        pathname.startsWith("/products/") ||
        pathname === "/categories" ||
        pathname.startsWith("/categories/") ||
        pathname === "/subcategories" ||
        pathname.startsWith("/subcategories/")
      );
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const openProductsDropdown = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setProductsMenuOpen(true);
  };

  const scheduleCloseProductsDropdown = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setProductsMenuOpen(false);
    }, 140);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        useSolidNavbar
          ? "bg-white/95 backdrop-blur-md shadow-sm border-border py-3.5"
          : "bg-transparent border-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between gap-4">
        {/* Brand Wordmark / Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={brandShort}
              className="h-10 w-auto object-contain"
            />
          ) : (
            <div className="flex flex-col">
              <span
                className={cn(
                  "text-2xl md:text-3xl font-heading font-bold tracking-tighter transition-colors leading-none",
                  useSolidNavbar ? "text-primary" : "text-white"
                )}
              >
                {brandShort}
              </span>
              <span
                className={cn(
                  "text-[0.65rem] tracking-[0.3em] font-sans uppercase font-bold transition-colors mt-1",
                  useSolidNavbar ? "text-foreground" : "text-white/90"
                )}
              >
                {established}
              </span>
            </div>
          )}
        </Link>

        {/* Dynamic Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);

            if (item.hasCategoriesDropdown) {
              return (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={openProductsDropdown}
                  onMouseLeave={scheduleCloseProductsDropdown}
                >
                  <Link
                    href={item.href}
                    onFocus={openProductsDropdown}
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs xl:text-sm font-bold uppercase tracking-widest transition-colors decoration-primary decoration-2 underline-offset-8 py-1",
                      active
                        ? "text-primary underline"
                        : useSolidNavbar
                        ? "text-foreground/80 hover:text-primary"
                        : "text-white/90 hover:text-white"
                    )}
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform duration-200",
                        productsMenuOpen && "rotate-180 text-primary"
                      )}
                    />
                  </Link>

                  {/* Hover Dropdown Panel showing all Categories */}
                  {productsMenuOpen && (
                    <div
                      className={cn(
                        "absolute left-1/2 -translate-x-1/2 top-full pt-4 max-w-[92vw] z-50",
                        categories.length > 8 ? "w-[780px]" : "w-[580px]"
                      )}
                    >
                      <div className="rounded-2xl border border-border bg-white shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-5 py-3">
                          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                            <Layers className="h-3.5 w-3.5 text-primary" />
                            Browse Product Categories ({categories.length})
                          </span>
                          <Link
                            href="/products"
                            onClick={() => setProductsMenuOpen(false)}
                            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary hover:underline"
                          >
                            All Products
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>

                        {categories.length === 0 ? (
                          <div className="px-5 py-6 text-center text-sm text-muted-foreground">
                            No categories added yet.
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "grid gap-1.5 p-3 max-h-[68vh] overflow-y-auto",
                              categories.length > 8
                                ? "grid-cols-2 xl:grid-cols-3"
                                : "grid-cols-2"
                            )}
                          >
                            {categories.map((cat) => {
                              const catHref = `/categories/${cat.slug}`;
                              const catActive = pathname === catHref;
                              return (
                                <Link
                                  key={cat.id}
                                  href={catHref}
                                  onClick={() => setProductsMenuOpen(false)}
                                  className={cn(
                                    "group/cat flex flex-col justify-between rounded-xl px-3.5 py-3 transition-colors border",
                                    catActive
                                      ? "border-primary/30 bg-primary/5"
                                      : "border-transparent hover:border-border hover:bg-secondary/60"
                                  )}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span
                                      className={cn(
                                        "font-heading text-sm font-bold uppercase tracking-wide transition-colors",
                                        catActive
                                          ? "text-primary"
                                          : "text-foreground group-hover/cat:text-primary"
                                      )}
                                    >
                                      {cat.name}
                                    </span>
                                    {typeof cat.productCount === "number" && (
                                      <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground group-hover/cat:bg-primary/10 group-hover/cat:text-primary transition-colors">
                                        {cat.productCount}
                                      </span>
                                    )}
                                  </div>
                                  {cat.shortDescription && (
                                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                                      {cat.shortDescription}
                                    </p>
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        )}

                        <div className="flex items-center justify-between border-t border-border bg-secondary/25 px-5 py-2.5 text-xs">
                          <Link
                            href="/categories"
                            onClick={() => setProductsMenuOpen(false)}
                            className="font-semibold text-muted-foreground hover:text-primary transition-colors"
                          >
                            View Category Directory
                          </Link>
                          <Link
                            href="/contact"
                            onClick={() => setProductsMenuOpen(false)}
                            className="font-bold text-foreground hover:text-primary transition-colors"
                          >
                            Need Bulk Quote? Contact Desk →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-xs xl:text-sm font-bold uppercase tracking-widest transition-colors decoration-primary decoration-2 underline-offset-8",
                  active
                    ? "text-primary underline"
                    : useSolidNavbar
                    ? "text-foreground/80 hover:text-primary"
                    : "text-white/90 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/products"
            aria-label="Search Products"
            className={cn(
              "p-2 rounded-lg transition-colors",
              useSolidNavbar
                ? "text-foreground hover:text-primary hover:bg-secondary"
                : "text-white/85 hover:text-white hover:bg-white/10"
            )}
          >
            <Search className="h-5 w-5" />
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary hover:text-white transition-colors"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Admin
            </Link>
          )}

          <Link
            href="/contact"
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded hover:bg-red-700 transition-all font-bold uppercase tracking-wider text-xs xl:text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <Phone className="h-4 w-4" />
            <span>{ctaLabel}</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          aria-label="Toggle Menu"
          onClick={() => setMobileOpen(!mobileOpen)}
          className={cn(
            "lg:hidden p-2 rounded-lg transition-colors cursor-pointer",
            useSolidNavbar ? "text-foreground" : "text-white"
          )}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-white px-4 py-6 shadow-xl animate-in slide-in-from-top-2 duration-200 max-h-[85vh] overflow-y-auto">
          <nav className="flex flex-col space-y-2">
            {NAV_ITEMS.map((item) => {
              if (item.hasCategoriesDropdown) {
                return (
                  <div key={item.href} className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <Link
                        href={item.href}
                        className={cn(
                          "flex-1 rounded-lg px-3 py-2.5 text-sm font-bold uppercase tracking-widest transition-colors",
                          isActive(item.href)
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-secondary"
                        )}
                      >
                        {item.label}
                      </Link>
                      {categories.length > 0 && (
                        <button
                          type="button"
                          aria-label="Toggle Product Categories"
                          onClick={() =>
                            setMobileProductsOpen((prev) => !prev)
                          }
                          className="rounded-lg border border-border p-2.5 text-foreground hover:bg-secondary cursor-pointer"
                        >
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform",
                              mobileProductsOpen && "rotate-180 text-primary"
                            )}
                          />
                        </button>
                      )}
                    </div>

                    {mobileProductsOpen && categories.length > 0 && (
                      <div className="ml-3 border-l-2 border-primary/30 pl-3 py-1 space-y-1">
                        <Link
                          href="/products"
                          className="block rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/5"
                        >
                          All Products →
                        </Link>
                        {categories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/categories/${cat.slug}`}
                            className={cn(
                              "flex items-center justify-between rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors",
                              pathname === `/categories/${cat.slug}`
                                ? "bg-primary/10 text-primary font-bold"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            )}
                          >
                            <span>{cat.name}</span>
                            {typeof cat.productCount === "number" && (
                              <span className="text-[10px] opacity-75">
                                ({cat.productCount})
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm font-bold uppercase tracking-widest transition-colors",
                    isActive(item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-secondary"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                href="/admin"
                className="rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4 text-primary" />
                Admin Dashboard
              </Link>
            )}
          </nav>
          <div className="mt-5 pt-5 border-t border-border">
            <Link
              href="/contact"
              className="flex w-full items-center justify-center gap-2 rounded bg-primary py-3 font-bold uppercase tracking-wider text-sm text-white shadow-md"
            >
              <Phone className="h-4 w-4" />
              {ctaLabel}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
