"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSlide } from "@/db/schema";
import { EditableEntityText, EditableImageTrigger } from "@/components/cms/Editable";

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [slides.length, paused]);

  if (slides.length === 0) return null;

  const current = slides[activeIdx] || slides[0];

  return (
    <section
      className="relative h-[92vh] min-h-[620px] overflow-hidden bg-black"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background Slides */}
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === activeIdx ? "opacity-100 z-0" : "opacity-0 -z-10"
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[9000ms] ease-out scale-105"
            style={{
              backgroundImage: `url(${slide.imageUrl || "/images/carousel/store-interior.png"})`,
              transform: idx === activeIdx ? "scale(1.08)" : "scale(1.02)",
            }}
          />
          <div className="absolute inset-0 bg-black/65" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/40" />
        </div>
      ))}

      {/* Admin Background Image Edit Button */}
      <div className="absolute top-24 right-6 z-30">
        <EditableImageTrigger
          label={`Slide #${activeIdx + 1} Background`}
          entity={{
            endpoint: "slides",
            id: current.id,
            field: "imageUrl",
            currentValue: current.imageUrl,
          }}
        />
      </div>

      {/* Foreground Hero Content */}
      <div className="container mx-auto h-full px-4 relative z-20 flex flex-col items-center justify-center text-center pt-16">
        <div className="inline-block border border-primary/60 bg-black/40 text-primary px-4 py-1.5 text-xs md:text-sm font-mono tracking-[0.28em] uppercase mb-6 backdrop-blur-sm">
          <EditableEntityText
            endpoint="slides"
            id={current.id}
            field="badge"
            value={current.badge}
            label="Slide Eyebrow Badge"
          />
        </div>

        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-heading font-bold mb-6 text-white leading-[0.95] tracking-tighter uppercase max-w-5xl drop-shadow-2xl">
          {current.titlePart1 && (
            <>
              <EditableEntityText
                endpoint="slides"
                id={current.id}
                field="titlePart1"
                value={current.titlePart1}
                label="Slide Title Prefix"
              />{" "}
            </>
          )}
          {current.titleHighlight && (
            <>
              <EditableEntityText
                endpoint="slides"
                id={current.id}
                field="titleHighlight"
                value={current.titleHighlight}
                label="Slide Highlighted Word"
                className="text-primary"
              />{" "}
            </>
          )}
          {current.titlePart2 && (
            <EditableEntityText
              endpoint="slides"
              id={current.id}
              field="titlePart2"
              value={current.titlePart2}
              label="Slide Title Suffix"
            />
          )}
        </h1>

        <EditableEntityText
          endpoint="slides"
          id={current.id}
          field="subtitle"
          value={current.subtitle}
          label="Slide Subtitle"
          type="textarea"
          as="p"
          className="text-lg md:text-2xl text-slate-200 mb-10 max-w-2xl font-light tracking-wide"
        />

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={current.primaryCtaHref || "/products"}
            className="bg-primary hover:bg-red-700 text-white px-10 py-4 rounded-sm font-bold text-base md:text-lg uppercase tracking-wider transition-all flex items-center justify-center gap-2 group shadow-lg shadow-primary/25"
          >
            <span>{current.primaryCtaText || "View Catalog"}</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href={current.secondaryCtaHref || "/contact"}
            className="border border-white/25 hover:bg-white hover:text-black text-white px-10 py-4 rounded-sm font-bold text-base md:text-lg uppercase tracking-wider transition-all backdrop-blur-sm"
          >
            {current.secondaryCtaText || "Contact Us"}
          </Link>
        </div>
      </div>

      {/* Carousel Controls */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() =>
              setActiveIdx((prev) => (prev - 1 + slides.length) % slides.length)
            }
            className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white hover:bg-primary hover:border-primary transition-all cursor-pointer"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => setActiveIdx((prev) => (prev + 1) % slides.length)}
            className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white hover:bg-primary hover:border-primary transition-all cursor-pointer"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Go to slide ${idx + 1}`}
                onClick={() => setActiveIdx(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === activeIdx
                    ? "w-10 bg-primary"
                    : "w-2.5 bg-white/40 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
