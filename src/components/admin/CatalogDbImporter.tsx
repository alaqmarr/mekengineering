"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Database,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Package,
  FolderTree,
  Layers,
  ShieldCheck,
  X,
} from "lucide-react";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface ImportResultSummary {
  mode: "merge" | "replace";
  fileName: string;
  categories: number;
  subcategories: number;
  products: number;
}

interface CatalogDbImporterProps {
  currentCounts: {
    categories: number;
    subcategories: number;
    products: number;
  };
  onImported: () => Promise<void>;
}

export function CatalogDbImporter({
  currentCounts,
  onImported,
}: CatalogDbImporterProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"merge" | "replace">("merge");
  const [uploading, setUploading] = useState(false);
  const [lastResult, setLastResult] = useState<ImportResultSummary | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setSelectedFile(file);
    setLastResult(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/vnd.sqlite3": [".db", ".sqlite", ".sqlite3"],
      "application/x-sqlite3": [".db", ".sqlite", ".sqlite3"],
      "application/octet-stream": [".db", ".sqlite", ".sqlite3"],
    },
  });

  async function handleImport() {
    if (!selectedFile) {
      notify.error("No Database Selected", "Choose a SQLite .db file first.");
      return;
    }

    if (
      mode === "replace" &&
      !window.confirm(
        "Replace Mode will remove all existing Categories, Subcategories, and Products before copying from the uploaded .db file. Continue?"
      )
    ) {
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("mode", mode);

      const res = await fetch("/api/admin/import-db", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Database catalog import failed");
      }

      const summary: ImportResultSummary = {
        mode: data.mode,
        fileName: data.fileName || selectedFile.name,
        categories: data.imported?.categories ?? 0,
        subcategories: data.imported?.subcategories ?? 0,
        products: data.imported?.products ?? 0,
      };

      setLastResult(summary);
      setSelectedFile(null);
      await onImported();

      notify.success(
        "Catalog Imported from .db",
        `Copied ${summary.categories} categories, ${summary.subcategories} subcategories & ${summary.products} products.`
      );
    } catch (err) {
      notify.error(
        "Import Failed",
        err instanceof Error ? err.message : "Could not copy catalog from .db file"
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary mb-1">
              <Database className="h-4 w-4" />
              <span>SQLite Catalog Sync</span>
            </div>
            <h2 className="font-heading text-2xl font-bold uppercase text-foreground">
              Upload `.db` File to Copy Catalog
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Upload any Mek Engineering SQLite database (`.db`, `.sqlite`, `.sqlite3` — e.g.{" "}
              <code className="rounded bg-secondary px-1.5 py-0.5 text-xs font-mono text-foreground">
                data/mekengineering.db
              </code>
              ) to copy its <strong>Categories</strong>, <strong>Subcategories</strong>, and{" "}
              <strong>Products</strong> directly into this server. Admin accounts, inquiries, and
              R2/SMTP keys on this server are never overwritten.
            </p>
          </div>

          <a
            href="/api/admin/import-db"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/70 hover:bg-secondary px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-foreground transition-colors shrink-0"
          >
            <Database className="h-4 w-4 text-primary" />
            Export Current Catalog `.db`
          </a>
        </div>

        {/* Live Active Counts Strip */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-border">
          <div className="rounded-xl bg-secondary/40 px-4 py-3 flex items-center gap-3">
            <FolderTree className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Live Categories
              </p>
              <p className="font-heading text-xl font-bold text-foreground">
                {currentCounts.categories}
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-secondary/40 px-4 py-3 flex items-center gap-3">
            <Layers className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Live Subcategories
              </p>
              <p className="font-heading text-xl font-bold text-foreground">
                {currentCounts.subcategories}
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-secondary/40 px-4 py-3 flex items-center gap-3">
            <Package className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Live Products
              </p>
              <p className="font-heading text-xl font-bold text-foreground">
                {currentCounts.products}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload & Import Controls */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-xs space-y-6">
        {/* Sync Mode Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2.5">
            1. Choose Copy Mode
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode("merge")}
              className={cn(
                "text-left rounded-xl border p-4 transition-all cursor-pointer",
                mode === "merge"
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border hover:bg-secondary/40"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Merge & Upsert by Slug (Recommended)
                </span>
                <span
                  className={cn(
                    "h-4 w-4 rounded-full border flex items-center justify-center",
                    mode === "merge" ? "border-primary bg-primary" : "border-slate-300"
                  )}
                >
                  {mode === "merge" && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Copies all categories, subcategories, and products from the `.db` file, updating
                matching slugs while preserving any existing uploaded images when the source image
                is blank.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMode("replace")}
              className={cn(
                "text-left rounded-xl border p-4 transition-all cursor-pointer",
                mode === "replace"
                  ? "border-amber-500 bg-amber-50/70 ring-1 ring-amber-500/30"
                  : "border-border hover:bg-secondary/40"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Replace Existing Catalog
                </span>
                <span
                  className={cn(
                    "h-4 w-4 rounded-full border flex items-center justify-center",
                    mode === "replace" ? "border-amber-600 bg-amber-600" : "border-slate-300"
                  )}
                >
                  {mode === "replace" && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Clears current categories, subcategories, and products first, then copies the exact
                catalog from the uploaded `.db` file.
              </p>
            </button>
          </div>
        </div>

        {/* Dropzone */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2.5">
            2. Select SQLite Database File (`.db`)
          </label>
          <div
            {...getRootProps()}
            className={cn(
              "rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer",
              isDragActive
                ? "border-primary bg-primary/5"
                : selectedFile
                ? "border-emerald-400 bg-emerald-50/40"
                : "border-slate-300 hover:border-primary/60 hover:bg-secondary/30"
            )}
          >
            <input {...getInputProps()} />
            <UploadCloud
              className={cn(
                "h-10 w-10 mx-auto mb-3",
                selectedFile ? "text-emerald-600" : "text-primary"
              )}
            />
            {selectedFile ? (
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Ready to copy categories,
                  subcategories & products
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">
                  Drag & drop your `.db` file here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports SQLite 3 `.db`, `.sqlite`, and `.sqlite3` files up to 64 MB
                </p>
              </div>
            )}
          </div>

          {selectedFile && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-secondary/30 px-4 py-3">
              <div className="flex items-center gap-2.5 text-xs text-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  Foreign keys (`category_id`, `subcategory_id`, `brand_id`) are automatically
                  remapped by slug during import.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => setSelectedFile(null)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-foreground cursor-pointer disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </button>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={handleImport}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-primary/90 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-colors cursor-pointer disabled:opacity-60"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Copying Catalog...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4" />
                      Copy Categories, Subcategories & Products
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Result Banner */}
        {lastResult && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950 space-y-1">
              <p className="font-bold uppercase tracking-wider">
                Import Completed ({lastResult.mode === "replace" ? "Replaced" : "Merged"} from{" "}
                {lastResult.fileName})
              </p>
              <p className="text-emerald-800">
                Successfully copied <strong>{lastResult.categories}</strong> categories,{" "}
                <strong>{lastResult.subcategories}</strong> subcategories, and{" "}
                <strong>{lastResult.products}</strong> products into the live database.
              </p>
            </div>
          </div>
        )}

        {mode === "replace" && !lastResult && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> Replace mode deletes existing categories, subcategories, and
              products before importing from the `.db` file. Admin users, inquiries, hero slides,
              and R2/SMTP credentials remain untouched.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
