"use client";

import React, { useCallback, useEffect, useId, useState } from "react";
import { useDropzone, type Accept } from "react-dropzone";
import {
  UploadCloud,
  Loader2,
  CheckCircle2,
  ClipboardPaste,
  FileText,
  X,
} from "lucide-react";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";

// Tracks the active/hovered dropzone so Ctrl+V in multi-image forms always targets
// the intended uploader instead of firing on multiple fields simultaneously.
let hoveredDropzoneId: string | null = null;
const mountedDropzoneOrder: string[] = [];

interface ImageUploaderFieldProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  acceptPdf?: boolean;
  accept?: string;
  placeholder?: string;
}

export function ImageUploaderField({
  value,
  onChange,
  folder = "catalog",
  label = "Image / Media Asset",
  acceptPdf = false,
  accept,
  placeholder = "Or paste a direct image URL here...",
}: ImageUploaderFieldProps) {
  const instanceId = useId();
  const [uploading, setUploading] = useState(false);
  const [isFocusedOrHovered, setIsFocusedOrHovered] = useState(false);

  const allowPdf = acceptPdf || Boolean(accept && accept.includes("pdf"));

  const uploadSingleFile = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Upload failed");
        }

        onChange(data.url);
        notify.success(
          data.provider === "cloudflare-r2"
            ? `Uploaded to Cloudflare R2${data.slot ? ` (Conn #${data.slot})` : ""}`
            : "Uploaded Successfully",
          data.provider === "cloudflare-r2"
            ? `Stored in active bucket "${data.bucketName || "R2"}".`
            : "Saved locally (connect a pre-setup R2 bucket in Admin Credentials for R2 CDN)."
        );
      } catch (err) {
        notify.error(
          "Upload Failed",
          err instanceof Error ? err.message : "Could not upload file"
        );
      } finally {
        setUploading(false);
      }
    },
    [folder, onChange]
  );

  // Register mount order & global Ctrl+V clipboard image paste listener
  useEffect(() => {
    mountedDropzoneOrder.push(instanceId);
    return () => {
      const idx = mountedDropzoneOrder.indexOf(instanceId);
      if (idx !== -1) mountedDropzoneOrder.splice(idx, 1);
      if (hoveredDropzoneId === instanceId) hoveredDropzoneId = null;
    };
  }, [instanceId]);

  useEffect(() => {
    function handleWindowPaste(e: ClipboardEvent) {
      if (uploading) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      let imageFile: File | null = null;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const blob = item.getAsFile();
          if (blob) {
            const ext = item.type.split("/")[1]?.replace("jpeg", "jpg") || "png";
            imageFile = new File([blob], `clipboard-${Date.now()}.${ext}`, {
              type: item.type,
            });
            break;
          }
        }
      }

      if (!imageFile) return;

      // Target hovered/focused dropzone first, otherwise the primary (first mounted) dropzone
      const targetId = hoveredDropzoneId ?? mountedDropzoneOrder[0];
      if (targetId !== instanceId) return;

      e.preventDefault();
      void uploadSingleFile(imageFile);
    }

    window.addEventListener("paste", handleWindowPaste);
    return () => window.removeEventListener("paste", handleWindowPaste);
  }, [instanceId, uploadSingleFile, uploading]);

  const dropzoneAccept: Accept = allowPdf
    ? {
        "image/*": [".jpg", ".jpeg", ".png", ".webp", ".avif", ".svg", ".gif"],
        "application/pdf": [".pdf"],
      }
    : {
        "image/*": [".jpg", ".jpeg", ".png", ".webp", ".avif", ".svg", ".gif"],
      };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: dropzoneAccept,
    maxFiles: 1,
    maxSize: 15 * 1024 * 1024,
    disabled: uploading,
    onDropAccepted: (files) => {
      if (files[0]) {
        void uploadSingleFile(files[0]);
      }
    },
    onDropRejected: (rejections) => {
      const msg = rejections[0]?.errors[0]?.message || "Unsupported file or file > 15MB";
      notify.error("Invalid File", msg);
    },
  });

  const isPdf = value.toLowerCase().endsWith(".pdf");

  return (
    <div
      className="space-y-2.5"
      onMouseEnter={() => {
        hoveredDropzoneId = instanceId;
        setIsFocusedOrHovered(true);
      }}
      onMouseLeave={() => {
        if (hoveredDropzoneId === instanceId) hoveredDropzoneId = null;
        setIsFocusedOrHovered(false);
      }}
      onFocus={() => {
        hoveredDropzoneId = instanceId;
        setIsFocusedOrHovered(true);
      }}
      onBlur={() => {
        if (hoveredDropzoneId === instanceId) hoveredDropzoneId = null;
        setIsFocusedOrHovered(false);
      }}
    >
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
          {label}
        </label>
      )}

      {/* React Dropzone Area with Ctrl+V Clipboard Support */}
      <div
        {...getRootProps()}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-5 text-center transition-all cursor-pointer",
          isDragActive
            ? "border-primary bg-primary/5 scale-[1.01]"
            : isFocusedOrHovered
            ? "border-primary/60 bg-slate-50"
            : "border-slate-300 bg-slate-50/60 hover:border-primary/50 hover:bg-slate-50",
          uploading && "opacity-70 pointer-events-none"
        )}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Uploading to Cloudflare R2...
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-2 text-primary">
              <UploadCloud className="h-6 w-6" />
              <ClipboardPaste className="h-5 w-5 opacity-80" />
            </div>
            <p className="text-xs font-semibold text-slate-800">
              {isDragActive
                ? "Drop file here to upload immediately..."
                : "Drag & drop image here, click to browse, or press Ctrl+V to paste"}
            </p>
            <p className="text-[11px] text-slate-500">
              JPG, PNG, WebP, AVIF, SVG{allowPdf ? ", PDF" : ""} up to 15MB • Direct Cloudflare R2 Storage
            </p>
          </div>
        )}
      </div>

      {/* Optional Direct URL Input + Clear */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            title="Clear asset"
            className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Live Thumbnail Preview */}
      {value && !isPdf && (
        <div className="relative h-36 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Uploaded preview" className="h-full w-full object-cover" />
          <div className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-black/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            Asset Ready
          </div>
        </div>
      )}

      {value && isPdf && (
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
          <FileText className="h-4 w-4 text-primary shrink-0" />
          <span className="truncate font-medium">{value}</span>
        </div>
      )}
    </div>
  );
}
