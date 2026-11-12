import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock, MessageSquare, ShieldCheck } from "lucide-react";
import { buildRouteMetadata, getSiteBaseUrl, getSiteContentMap } from "@/db/queries";
import { EditableText } from "@/components/cms/Editable";
import { ContactForm } from "@/components/contact/ContactForm";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata("/contact");
}

export default async function ContactPage() {
  const content = await getSiteContentMap();
  const siteUrl = await getSiteBaseUrl(content);

  const phone = content["contact.phone"] || "+91 93910 79492";
  const email = content["contact.email"] || "info@mekengineering.com";
  const whatsappNumber = (content["social.whatsapp"] || "919391079492").replace(/\D/g, "");
  const mapEmbedUrl =
    content["contact.mapEmbedUrl"] ||
    "https://www.google.com/maps?q=Ranigunj,Secunderabad,Telangana+500003&output=embed";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Contact ${content["site.name"] || "Mek Engineering Corporation"}`,
    url: `${siteUrl}/contact`,
    mainEntity: {
      "@type": "HardwareStore",
      name: content["site.name"] || "Mek Engineering Corporation",
      telephone: phone,
      email,
      foundingDate: "1968",
      address: {
        "@type": "PostalAddress",
        streetAddress:
          content["contact.addressLine1"] ||
          "5-1-458, Victoria Ranigunj, Bolaram Nagar",
        addressLocality: "Secunderabad",
        addressRegion: "Telangana",
        postalCode: "500003",
        addressCountry: "IN",
      },
    },
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-slate-950 py-20 border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(235,45,74,0.2),transparent_60%)]" />
        <div className="container mx-auto px-4 relative z-10 max-w-4xl text-center">
          <div className="inline-block border border-primary/60 bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-primary mb-4">
            <EditableText
              contentKey="contact.hero.badge"
              fallback="Support & Wholesale Sales"
              label="Contact Page Badge"
              section="contact"
            />
          </div>
          <EditableText
            contentKey="contact.hero.heading"
            fallback="Get in Touch"
            label="Contact Page Heading"
            section="contact"
            as="h1"
            className="text-4xl md:text-6xl font-heading font-bold uppercase tracking-tight text-white mb-4"
          />
          <EditableText
            contentKey="contact.hero.paragraph"
            fallback="Have a question about our industrial catalog, need a bulk GST quotation, or looking for specific OEM spare parts? Our team is ready to assist."
            label="Contact Page Subtitle"
            section="contact"
            type="textarea"
            as="p"
            className="text-base md:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto"
          />
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column — Contact Details & Map */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <EditableText
                contentKey="contact.details.heading"
                fallback="Contact Details"
                label="Contact Details Heading"
                section="contact"
                as="h2"
                className="text-2xl md:text-3xl font-heading font-bold uppercase text-foreground mb-6"
              />

              <div className="space-y-4">
                {/* Showroom Card */}
                <div className="rounded-xl border border-border bg-white p-6 shadow-xs hover:border-primary/40 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <EditableText
                        contentKey="contact.location.label"
                        fallback="Our Showroom & Warehouse"
                        label="Location Card Heading"
                        section="contact"
                        as="h3"
                        className="font-heading text-lg font-bold uppercase text-foreground"
                      />
                      <EditableText
                        contentKey="contact.addressLine1"
                        fallback="5-1-458, Victoria Ranigunj, Bolaram Nagar,"
                        label="Address Line 1"
                        section="contact"
                        as="p"
                        className="text-sm text-muted-foreground leading-relaxed"
                      />
                      <EditableText
                        contentKey="contact.addressLine2"
                        fallback="Rani Gunj, Secunderabad, Telangana - 500003"
                        label="Address Line 2"
                        section="contact"
                        as="p"
                        className="text-sm text-muted-foreground leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

                {/* Phone Card */}
                <div className="rounded-xl border border-border bg-white p-6 shadow-xs hover:border-primary/40 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <EditableText
                        contentKey="contact.phone.label"
                        fallback="Direct Sales Line"
                        label="Phone Card Heading"
                        section="contact"
                        as="h3"
                        className="font-heading text-lg font-bold uppercase text-foreground"
                      />
                      <a
                        href={`tel:${phone.replace(/\s+/g, "")}`}
                        className="block text-base font-bold text-foreground hover:text-primary transition-colors"
                      >
                        <EditableText
                          contentKey="contact.phone"
                          fallback="+91 93910 79492"
                          label="Primary Phone Number"
                          section="contact"
                        />
                      </a>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        <EditableText
                          contentKey="contact.phoneAvailability"
                          fallback="Mon – Sat • 10:00 AM to 8:00 PM IST"
                          label="Phone Availability Subtext"
                          section="contact"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email Card */}
                <div className="rounded-xl border border-border bg-white p-6 shadow-xs hover:border-primary/40 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <EditableText
                        contentKey="contact.email.label"
                        fallback="Email Desk"
                        label="Email Card Heading"
                        section="contact"
                        as="h3"
                        className="font-heading text-lg font-bold uppercase text-foreground"
                      />
                      <a
                        href={`mailto:${email}`}
                        className="block text-sm font-semibold text-foreground hover:text-primary transition-colors break-all"
                      >
                        <EditableText
                          contentKey="contact.email"
                          fallback="info@mekengineering.com"
                          label="Official Email Address"
                          section="contact"
                        />
                      </a>
                      <EditableText
                        contentKey="contact.emailResponse"
                        fallback="Response time: < 24 hrs"
                        label="Email Response Time Subtext"
                        section="contact"
                        as="p"
                        className="text-xs text-muted-foreground"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick WhatsApp Card */}
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                    "Hello Mek Engineering Corporation, I would like to inquire about wholesale industrial tools."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl bg-emerald-600 hover:bg-emerald-700 p-5 text-white shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-heading text-base font-bold uppercase tracking-wide">
                        Instant WhatsApp Desk
                      </p>
                      <p className="text-xs text-emerald-100">
                        Chat directly with our Secunderabad counter for live stock & pricing
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1.5 rounded-md group-hover:bg-white/30 transition-colors">
                    Open Chat
                  </span>
                </a>
              </div>
            </div>

            {/* Embedded Google Map */}
            <div className="overflow-hidden rounded-2xl border border-border bg-secondary shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
                <span>Victoria Ranigunj, Secunderabad</span>
                <EditableText
                  contentKey="contact.mapEmbedUrl"
                  fallback={mapEmbedUrl}
                  label="Google Maps Embed URL"
                  section="contact"
                  type="url"
                  className="text-[11px] text-slate-400 truncate max-w-[180px]"
                />
              </div>
              <iframe
                title="Mek Engineering Corporation Showroom Map"
                src={mapEmbedUrl}
                className="h-72 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Right Column — Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-border bg-white p-8 md:p-10 shadow-lg">
              <div className="mb-8 border-b border-border pb-6">
                <EditableText
                  contentKey="contact.form.heading"
                  fallback="Send Us a Message"
                  label="Contact Form Heading"
                  section="contact"
                  as="h2"
                  className="text-3xl font-heading font-bold uppercase text-foreground mb-2"
                />
                <EditableText
                  contentKey="contact.form.paragraph"
                  fallback="Fill out the inquiry form below and our sales engineers will respond promptly via email or phone."
                  label="Contact Form Description"
                  section="contact"
                  type="textarea"
                  as="p"
                  className="text-sm text-muted-foreground leading-relaxed"
                />
              </div>

              <ContactForm />

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-secondary/60 px-5 py-4 border border-border/70 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                  <span>GST Wholesale Invoicing & Official Manufacturer Warranty</span>
                </div>
                <Link
                  href="/products"
                  className="font-bold uppercase tracking-wider text-primary hover:underline"
                >
                  Browse Full Catalog →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
