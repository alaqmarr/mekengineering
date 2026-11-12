"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "warning" | "info" | "loading";

export interface ToastOptions {
  id?: string;
  duration?: number;
}

interface ToastRecord {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration: number;
  createdAt: number;
}

type ToastListener = (toasts: ToastRecord[]) => void;

let toastsState: ToastRecord[] = [];
const listeners = new Set<ToastListener>();
let toastSeq = 0;

function emit() {
  const snapshot = [...toastsState];
  listeners.forEach((listener) => listener(snapshot));
}

function upsertToast(record: ToastRecord): string {
  const existingIdx = toastsState.findIndex((t) => t.id === record.id);
  if (existingIdx >= 0) {
    toastsState = toastsState.map((t, idx) => (idx === existingIdx ? record : t));
  } else {
    // Keep up to 4 most recent centered toasts so screen stays clean
    toastsState = [record, ...toastsState].slice(0, 4);
  }
  emit();
  return record.id;
}

function dismissToast(id: string) {
  const next = toastsState.filter((t) => t.id !== id);
  if (next.length !== toastsState.length) {
    toastsState = next;
    emit();
  }
}

function pushVariant(
  variant: ToastVariant,
  title: string,
  description?: string,
  extra?: ToastOptions
): string {
  const id = extra?.id || `mek-toast-${++toastSeq}-${Date.now()}`;
  const defaultDuration =
    variant === "loading" ? 0 : variant === "error" ? 5500 : 4000;
  return upsertToast({
    id,
    variant,
    title,
    description,
    duration: extra?.duration ?? defaultDuration,
    createdAt: Date.now(),
  });
}

const VARIANT_CONFIG: Record<
  ToastVariant,
  {
    bgVar: string;
    borderClass: string;
    barClass: string;
    badgeClass: string;
    pillClass: string;
    pillLabel: string;
    descClass: string;
    Icon: React.ComponentType<{ className?: string }>;
  }
> = {
  success: {
    bgVar: "var(--toast-bg-red-base)",
    borderClass: "border-emerald-400/45 shadow-[0_18px_45px_-12px_rgba(235,45,74,0.35)]",
    barClass: "bg-emerald-400",
    badgeClass: "bg-emerald-500/20 border border-emerald-400/45 text-emerald-300",
    pillClass: "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30",
    pillLabel: "Success",
    descClass: "text-rose-50/90",
    Icon: CheckCircle2,
  },
  error: {
    bgVar: "var(--toast-bg-red-error)",
    borderClass: "border-[#eb2d4a]/80 shadow-[0_20px_50px_-10px_rgba(235,45,74,0.55)]",
    barClass: "bg-[#eb2d4a]",
    badgeClass: "bg-[#eb2d4a] border border-rose-300/40 text-white",
    pillClass: "bg-[#eb2d4a]/35 text-rose-100 border border-rose-300/30",
    pillLabel: "Error",
    descClass: "text-rose-100/95",
    Icon: AlertCircle,
  },
  warning: {
    bgVar: "var(--toast-bg-red-warning)",
    borderClass: "border-amber-400/55 shadow-[0_18px_45px_-12px_rgba(235,45,74,0.35)]",
    barClass: "bg-amber-400",
    badgeClass: "bg-amber-500/20 border border-amber-400/45 text-amber-300",
    pillClass: "bg-amber-500/20 text-amber-200 border border-amber-400/30",
    pillLabel: "Warning",
    descClass: "text-amber-50/90",
    Icon: AlertTriangle,
  },
  info: {
    bgVar: "var(--toast-bg-red-info)",
    borderClass: "border-[#eb2d4a]/50 shadow-[0_18px_45px_-12px_rgba(235,45,74,0.4)]",
    barClass: "bg-[#eb2d4a]",
    badgeClass: "bg-[#eb2d4a]/25 border border-[#eb2d4a]/50 text-rose-200",
    pillClass: "bg-[#eb2d4a]/25 text-rose-200 border border-[#eb2d4a]/35",
    pillLabel: "Notice",
    descClass: "text-rose-50/90",
    Icon: Info,
  },
  loading: {
    bgVar: "var(--toast-bg-red-info)",
    borderClass: "border-[#eb2d4a]/50 shadow-[0_18px_45px_-12px_rgba(235,45,74,0.4)]",
    barClass: "bg-[#eb2d4a]",
    badgeClass: "bg-[#eb2d4a]/25 border border-[#eb2d4a]/50 text-rose-200",
    pillClass: "bg-[#eb2d4a]/25 text-rose-200 border border-[#eb2d4a]/35",
    pillLabel: "Processing",
    descClass: "text-rose-50/90",
    Icon: Loader2,
  },
};

function ToastItemCard({ item }: { item: ToastRecord }) {
  const [paused, setPaused] = useState(false);
  const remainingRef = useRef<number>(item.duration);
  const startRef = useRef<number>(Date.now());

  useEffect(() => {
    remainingRef.current = item.duration;
    startRef.current = Date.now();
  }, [item.id, item.variant, item.duration, item.createdAt]);

  useEffect(() => {
    if (item.duration <= 0) return;
    if (paused) return;

    startRef.current = Date.now();
    const timer = setTimeout(() => {
      dismissToast(item.id);
    }, remainingRef.current);

    return () => {
      clearTimeout(timer);
      const elapsed = Date.now() - startRef.current;
      remainingRef.current = Math.max(300, remainingRef.current - elapsed);
    };
  }, [paused, item.id, item.duration, item.createdAt]);

  const cfg = VARIANT_CONFIG[item.variant];
  const Icon = cfg.Icon;

  return (
    <div
      role={item.variant === "error" ? "alert" : "status"}
      aria-live={item.variant === "error" ? "assertive" : "polite"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ background: cfg.bgVar }}
      className={cn(
        "animate-mek-toast pointer-events-auto relative w-full overflow-hidden rounded-2xl border backdrop-blur-xl text-white transition-all",
        cfg.borderClass
      )}
    >
      {/* Left Semantic Accent Strip */}
      <span
        aria-hidden="true"
        className={cn("absolute left-0 top-0 bottom-0 w-1.5", cfg.barClass)}
      />

      <div className="flex items-start gap-3.5 pl-5 pr-4 py-4">
        {/* Semantic Icon Badge */}
        <div
          className={cn(
            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            cfg.badgeClass
          )}
        >
          <Icon
            className={cn(
              "h-4 w-4",
              item.variant === "loading" && "animate-spin"
            )}
          />
        </div>

        {/* Title & Description */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest",
                cfg.pillClass
              )}
            >
              {cfg.pillLabel}
            </span>
            <p className="font-heading text-sm font-bold uppercase tracking-wide text-white leading-snug">
              {item.title}
            </p>
          </div>

          {item.description && (
            <p className={cn("mt-1 text-xs leading-relaxed", cfg.descClass)}>
              {item.description}
            </p>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => dismissToast(item.id)}
          aria-label="Dismiss notification"
          className="rounded-lg p-1 text-rose-200/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Bottom Countdown Progress Indicator */}
      {item.duration > 0 && (
        <div className="h-1 w-full bg-white/10 overflow-hidden">
          <div
            key={`${item.id}-${item.createdAt}`}
            style={{
              animationName: "mek-toast-progress",
              animationDuration: `${item.duration}ms`,
              animationTimingFunction: "linear",
              animationFillMode: "forwards",
              animationPlayState: paused ? "paused" : "running",
            }}
            className={cn("h-full w-full origin-left", cfg.barClass)}
          />
        </div>
      )}
    </div>
  );
}

export function SiteToaster() {
  const [items, setItems] = useState<ToastRecord[]>([]);

  useEffect(() => {
    listeners.add(setItems);
    return () => {
      listeners.delete(setItems);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] flex w-[calc(100vw-2rem)] max-w-[460px] flex-col items-center gap-3 pointer-events-none"
    >
      {items.map((item) => (
        <ToastItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}

export const notify = {
  success: (title: string, description?: string, extra?: ToastOptions) =>
    pushVariant("success", title, description, extra),

  error: (title: string, description?: string, extra?: ToastOptions) =>
    pushVariant("error", title, description, extra),

  warning: (title: string, description?: string, extra?: ToastOptions) =>
    pushVariant("warning", title, description, extra),

  info: (title: string, description?: string, extra?: ToastOptions) =>
    pushVariant("info", title, description, extra),

  dismiss: (id: string) => dismissToast(id),

  promise: async <T,>(
    promiseOrFn: Promise<T> | (() => Promise<T>),
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: unknown) => string);
    }
  ): Promise<T> => {
    const id = pushVariant("loading", messages.loading);
    try {
      const p =
        typeof promiseOrFn === "function" ? promiseOrFn() : promiseOrFn;
      const result = await p;
      const successTitle =
        typeof messages.success === "function"
          ? messages.success(result)
          : messages.success;
      pushVariant("success", successTitle, undefined, { id });
      return result;
    } catch (err) {
      const errorTitle =
        typeof messages.error === "function"
          ? messages.error(err)
          : messages.error;
      const errorDesc = err instanceof Error ? err.message : undefined;
      pushVariant("error", errorTitle, errorDesc, { id });
      throw err;
    }
  },
};
