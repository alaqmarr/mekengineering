"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MapPin,
  Phone,
  Mail,
  ArrowRight,
} from "lucide-react";
import { EditableText } from "@/components/cms/Editable";
import { useCms } from "@/components/cms/CmsContext";

interface FooterCategory {
  id: number;
  name: string;
  slug: string;
}

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/products", label: "All Products" },
  { href: "/categories", label: "Categories" },
  { href: "/subcategories", label: "Subcategories" },
  { href: "/brands", label: "Brands" },
  { href: "/contact", label: "Contact" },
];

const PLACEHOLDER_SOCIAL_URLS = new Set([
  "https://facebook.com",
  "https://www.facebook.com",
  "https://x.com",
  "https://www.x.com",
  "https://twitter.com",
  "https://www.twitter.com",
  "https://instagram.com",
  "https://www.instagram.com",
  "https://linkedin.com",
  "https://www.linkedin.com",
]);

function validSocialUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (!trimmed || PLACEHOLDER_SOCIAL_URLS.has(trimmed.toLowerCase())) {
    return "";
  }
  return raw.trim();
}

export function Footer({ topCategories }: { topCategories: FooterCategory[] }) {
  const pathname = usePathname();
  const { getText } = useCms();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const fb = validSocialUrl(getText("social.facebook", ""));
  const tw = validSocialUrl(getText("social.twitter", ""));
  const ig = validSocialUrl(getText("social.instagram", ""));
  const li = validSocialUrl(getText("social.linkedin", ""));
  const phone = getText("contact.phone", "+91 93910 79492");
  const email = getText("contact.email", "info@mekengg.com");

  return (
    <footer className="bg-black border-t border-white/10 pt-20 pb-10 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Column 1: Brand Summary */}
          <div className="space-y-6">
            <div>
              <EditableText
                contentKey="site.shortName"
                fallback="MEK ENGINEERING"
                label="Brand Title"
                as="h2"
                className="text-2xl font-heading font-bold text-white mb-2 uppercase"
              />
              <div className="h-1 w-12 bg-primary" />
            </div>

            <EditableText
              contentKey="footer.description"
              fallback="Empowering industries since 1968. We provide top-tier power tools, machinery, and genuine spare parts. Authorized dealers for Bosch, DeWalt, Taparia, and more."
              label="Footer Brand Description"
              type="textarea"
              as="p"
              className="text-slate-400 text-sm leading-relaxed"
            />

            <div className="flex gap-3">
              {fb && (
                <a
                  href={fb}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="h-10 w-10 bg-white/5 rounded flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              )}
              {tw && (
                <a
                  href={tw}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter)"
                  className="h-10 w-10 bg-white/5 rounded flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}
              {ig && (
                <a
                  href={ig}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="h-10 w-10 bg-white/5 rounded flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
              )}
              {li && (
                <a
                  href={li}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="h-10 w-10 bg-white/5 rounded flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Dynamic Quick Links */}
          <div>
            <EditableText
              contentKey="footer.quickLinksHeading"
              fallback="Quick Links"
              label="Footer Quick Links Heading"
              as="h3"
              className="text-lg font-heading font-bold text-white uppercase tracking-wide mb-6"
            />
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-primary transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="h-1.5 w-1.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Dynamic Top Categories from SQLite */}
          <div>
            <EditableText
              contentKey="footer.categoriesHeading"
              fallback="Top Categories"
              label="Footer Categories Heading"
              as="h3"
              className="text-lg font-heading font-bold text-white uppercase tracking-wide mb-6"
            />
            <ul className="space-y-3">
              {topCategories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="text-slate-400 hover:text-primary transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="h-1.5 w-1.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <Link
                  href="/categories"
                  className="text-primary hover:text-white transition-colors text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1"
                >
                  View All Categories
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Editable Contact Info */}
          <div>
            <EditableText
              contentKey="footer.contactHeading"
              fallback="Contact Us"
              label="Footer Contact Heading"
              as="h3"
              className="text-lg font-heading font-bold text-white uppercase tracking-wide mb-6"
            />
            <ul className="space-y-5">
              <li className="flex items-start gap-3.5">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-slate-400 text-sm leading-relaxed">
                  <EditableText
                    contentKey="contact.addressLine1"
                    fallback="5-1-458, Victoria Ranigunj, Bolaram Nagar,"
                    label="Address Line 1"
                    section="contact"
                    as="div"
                  />
                  <EditableText
                    contentKey="contact.addressLine2"
                    fallback="Rani Gunj, Secunderabad, Telangana - 500003"
                    label="Address Line 2"
                    section="contact"
                    as="div"
                  />
                </div>
              </li>
              <li className="flex items-center gap-3.5">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  <EditableText
                    contentKey="contact.phone"
                    fallback="+91 93910 79492"
                    label="Primary Phone Number"
                    section="contact"
                  />
                </a>
              </li>
              <li className="flex items-center gap-3.5">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <a
                  href={`mailto:${email}`}
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  <EditableText
                    contentKey="contact.email"
                    fallback="info@mekengg.com"
                    label="Official Email Address"
                    section="contact"
                  />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <EditableText
            contentKey="footer.copyright"
            fallback="© 2026 Mek Engineering Corporation. All rights reserved."
            label="Footer Copyright Text"
            as="p"
          />
          <div className="flex items-center gap-1.5">
            <EditableText
              contentKey="footer.creditPrefix"
              fallback="Precision Wholesale Industrial Supply •"
              label="Footer Tagline Prefix"
            />
            <EditableText
              contentKey="footer.creditHighlight"
              fallback="Secunderabad, India"
              label="Footer Tagline Highlight"
              className="font-bold text-white"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
