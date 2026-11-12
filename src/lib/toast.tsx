"use client";

import { Toaster, sileo, type SileoOptions } from "sileo";

const INDUSTRIAL_SURFACE = "#111318";

const BASE_STYLES = {
  title: "font-heading tracking-wide uppercase text-white font-bold text-[13px]",
  description: "font-sans text-slate-300 text-xs leading-relaxed",
  badge: "bg-[#eb2d4a] text-white shadow-sm",
  button:
    "bg-[#eb2d4a] hover:bg-[#d0223d] text-white font-bold uppercase tracking-wider text-[11px] px-3 py-1 rounded transition-colors",
};

export function SiteToaster() {
  return (
    <Toaster
      position="top-right"
      theme="dark"
      offset={{ top: 20, right: 20 }}
      options={{
        fill: INDUSTRIAL_SURFACE,
        roundness: 14,
        duration: 4000,
        styles: BASE_STYLES,
      }}
    />
  );
}

export const notify = {
  success: (title: string, description?: string, extra?: Partial<SileoOptions>) =>
    sileo.success({
      title,
      description,
      fill: INDUSTRIAL_SURFACE,
      roundness: 14,
      styles: {
        ...BASE_STYLES,
        badge: "bg-[#eb2d4a] text-white",
      },
      ...extra,
    }),

  error: (title: string, description?: string, extra?: Partial<SileoOptions>) =>
    sileo.error({
      title,
      description,
      fill: "#1a0d11",
      roundness: 14,
      styles: {
        ...BASE_STYLES,
        badge: "bg-red-600 text-white",
      },
      ...extra,
    }),

  warning: (title: string, description?: string, extra?: Partial<SileoOptions>) =>
    sileo.warning({
      title,
      description,
      fill: INDUSTRIAL_SURFACE,
      roundness: 14,
      styles: {
        ...BASE_STYLES,
        badge: "bg-amber-500 text-black",
      },
      ...extra,
    }),

  info: (title: string, description?: string, extra?: Partial<SileoOptions>) =>
    sileo.info({
      title,
      description,
      fill: INDUSTRIAL_SURFACE,
      roundness: 14,
      styles: {
        ...BASE_STYLES,
        badge: "bg-[#eb2d4a] text-white",
      },
      ...extra,
    }),

  promise: <T,>(
    promise: Promise<T> | (() => Promise<T>),
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: unknown) => string);
    }
  ) =>
    sileo.promise(promise, {
      loading: {
        title: messages.loading,
        fill: INDUSTRIAL_SURFACE,
        roundness: 14,
        styles: BASE_STYLES,
      },
      success: (data) => ({
        title: typeof messages.success === "function" ? messages.success(data) : messages.success,
        fill: INDUSTRIAL_SURFACE,
        roundness: 14,
        styles: BASE_STYLES,
      }),
      error: (err) => ({
        title:
          typeof messages.error === "function"
            ? messages.error(err)
            : messages.error,
        description: err instanceof Error ? err.message : undefined,
        fill: "#1a0d11",
        roundness: 14,
        styles: {
          ...BASE_STYLES,
          badge: "bg-red-600 text-white",
        },
      }),
    }),
};
