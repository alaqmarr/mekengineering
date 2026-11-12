"use client";

import React, { useState } from "react";
import { MessageSquare, PhoneCall, FileDown, X, Crosshair } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";
import { EditableImageTrigger, EditableText } from "@/components/cms/Editable";
import { useCms } from "@/components/cms/CmsContext";

export function ProductGallery({
  productId,
  productName,
  primaryImage,
  gallery,
}: {
  productId: number;
  productName: string;
  primaryImage: string;
  gallery: string[];
}) {
  const validImages = [primaryImage, ...gallery]
    .map((u) => (u || "").trim())
    .filter(Boolean);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const currentImg = validImages[selectedIdx] || validImages[0] || "";

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        {currentImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentImg}
            alt={productName}
            className="h-full w-full object-contain p-6"
          />
        ) : (
          <div className="relative flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#003b6a] via-[#072642] to-[#0b1320] p-8 text-center">
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.45) 1px, transparent 0)",
                backgroundSize: "20px 20px",
              }}
            />
            <Crosshair className="h-12 w-12 text-sky-400/75 mb-3" />
            <span className="font-heading text-2xl font-bold uppercase tracking-wide text-white px-4">
              {productName}
            </span>
            <span className="mt-2 text-xs uppercase tracking-widest text-sky-200/70">
              Product Image Coming Soon
            </span>
          </div>
        )}
        <div className="absolute top-4 right-4 z-10">
          <EditableImageTrigger
            label="Primary Product Photo"
            entity={{
              endpoint: "products",
              id: productId,
              field: "imageUrl",
              currentValue: primaryImage,
            }}
          />
        </div>
      </div>

      {validImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {validImages.map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                idx === selectedIdx
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`${productName} thumbnail ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProductQuoteActions({
  productId,
  productName,
  datasheetUrl,
}: {
  productId: number;
  productName: string;
  datasheetUrl?: string;
}) {
  const { getText } = useCms();
  const [modalOpen, setModalOpen] = useState(false);

  const whatsappNum = getText("social.whatsapp", "919391079492").replace(/\D/g, "");
  const phone = getText("contact.phone", "+91 93910 79492");
  const waText = encodeURIComponent(
    `Hello Mek Engineering Corporation, I would like a wholesale quote for: ${productName}`
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-red-700 px-7 py-4 font-bold uppercase tracking-wider text-sm text-white shadow-lg shadow-primary/25 transition-all cursor-pointer"
        >
          <MessageSquare className="h-4 w-4" />
          <EditableText
            contentKey="productDetail.quoteCta"
            fallback="Request Wholesale Quote"
            label="Product Quote Button Text"
            section="products"
          />
        </button>

        {whatsappNum && (
          <a
            href={`https://wa.me/${whatsappNum}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-emerald-600 bg-emerald-600/10 hover:bg-emerald-600 px-6 py-4 font-bold uppercase tracking-wider text-sm text-emerald-700 hover:text-white transition-all"
          >
            <EditableText
              contentKey="productDetail.whatsappCta"
              fallback="Inquire on WhatsApp"
              label="WhatsApp CTA Label"
              section="products"
            />
          </a>
        )}

        <a
          href={`tel:${phone.replace(/\s+/g, "")}`}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary hover:bg-slate-900 hover:text-white px-5 py-4 font-bold uppercase tracking-wider text-sm text-foreground transition-all"
        >
          <PhoneCall className="h-4 w-4" />
          Call Desk
        </a>

        {datasheetUrl && (
          <a
            href={datasheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-white hover:border-primary px-5 py-4 font-bold uppercase tracking-wider text-sm text-foreground hover:text-primary transition-all"
          >
            <FileDown className="h-4 w-4" />
            Datasheet
          </a>
        )}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-[#111318] px-6 py-4 border-b-2 border-primary">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary block">
                  Instant Wholesale Inquiry
                </span>
                <h3 className="font-heading text-lg font-bold uppercase text-white line-clamp-1">
                  {productName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <ContactForm
                productId={productId}
                productName={productName}
                compact
                onSubmitted={() => setModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
