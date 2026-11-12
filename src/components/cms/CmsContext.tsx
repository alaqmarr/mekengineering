"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Save, RotateCcw, Loader2, Pencil } from "lucide-react";
import { notify } from "@/lib/toast";
import { ImageUploaderField } from "./ImageUploaderField";

export type EditableFieldType = "text" | "textarea" | "image" | "url" | "color";

export type EditTarget =
  | {
      kind: "site_content";
      key: string;
      label: string;
      type: EditableFieldType;
      currentValue: string;
      defaultValue: string;
      section?: string;
    }
  | {
      kind: "entity_field";
      endpoint: "products" | "categories" | "subcategories" | "brands" | "slides";
      id: number;
      field: string;
      label: string;
      type: EditableFieldType;
      currentValue: string;
      onSaved?: (newValue: string) => void;
    };

interface CmsContextValue {
  isAdmin: boolean;
  adminEmail?: string | null;
  editMode: boolean;
  setEditMode: (v: boolean) => void;
  content: Record<string, string>;
  getText: (key: string, fallback: string) => string;
  openEditor: (target: EditTarget) => void;
}

const CmsContext = createContext<CmsContextValue>({
  isAdmin: false,
  adminEmail: null,
  editMode: true,
  setEditMode: () => {},
  content: {},
  getText: (_k, fallback) => fallback,
  openEditor: () => {},
});

export function useCms() {
  return useContext(CmsContext);
}

export function CmsProvider({
  isAdmin,
  adminEmail,
  initialContent,
  children,
}: {
  isAdmin: boolean;
  adminEmail?: string | null;
  initialContent: Record<string, string>;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [content, setContent] = useState<Record<string, string>>(initialContent);
  const [editMode, setEditMode] = useState(true);
  const [activeTarget, setActiveTarget] = useState<EditTarget | null>(null);
  const [draftValue, setDraftValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const getText = useCallback(
    (key: string, fallback: string) => {
      return key in content ? content[key] : fallback;
    },
    [content]
  );

  const openEditor = useCallback((target: EditTarget) => {
    setActiveTarget(target);
    setDraftValue(target.currentValue);
  }, []);

  const closeEditor = useCallback(() => {
    if (!saving) {
      setActiveTarget(null);
    }
  }, [saving]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!activeTarget) return;
    setSaving(true);

    try {
      if (activeTarget.kind === "site_content") {
        const res = await fetch("/api/cms/content", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: activeTarget.key,
            value: draftValue,
            type: activeTarget.type,
            label: activeTarget.label,
            section: activeTarget.section || "global",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to save content");

        setContent((prev) => ({ ...prev, [activeTarget.key]: draftValue }));
        notify.success("Content Updated", `"${activeTarget.label}" saved to database.`);
      } else {
        const res = await fetch(`/api/admin/${activeTarget.endpoint}/${activeTarget.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            [activeTarget.field]: draftValue,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update record");

        activeTarget.onSaved?.(draftValue);
        notify.success("Updated Immediately", `"${activeTarget.label}" saved to database.`);
      }

      setActiveTarget(null);
      router.refresh();
    } catch (err) {
      notify.error(
        "Update Failed",
        err instanceof Error ? err.message : "Could not save changes"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <CmsContext.Provider
      value={{
        isAdmin,
        adminEmail,
        editMode,
        setEditMode,
        content,
        getText,
        openEditor,
      }}
    >
      {children}

      {/* Inline Visual Editor Modal Dialog */}
      {isAdmin && activeTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={closeEditor}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dialog Header */}
            <div className="flex items-center justify-between bg-[#111318] px-6 py-4 border-b-2 border-primary">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                  <Pencil className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-heading text-base font-bold uppercase tracking-wider text-white">
                    {activeTarget.label}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">
                    {activeTarget.kind === "site_content"
                      ? activeTarget.key
                      : `${activeTarget.endpoint}#${activeTarget.id}.${activeTarget.field}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Dialog Form */}
            <form onSubmit={handleSave} className="p-6 space-y-5">
              {activeTarget.type === "textarea" ? (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Paragraph / Rich Text Content
                  </label>
                  <textarea
                    rows={6}
                    value={draftValue}
                    onChange={(e) => setDraftValue(e.target.value)}
                    autoFocus
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-sm leading-relaxed text-slate-900 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="mt-1.5 flex justify-between text-[11px] text-slate-400">
                    <span>Saves directly to SQLite database</span>
                    <span>{draftValue.length} chars</span>
                  </div>
                </div>
              ) : activeTarget.type === "image" ? (
                <ImageUploaderField
                  value={draftValue}
                  onChange={setDraftValue}
                  folder="cms"
                  label="Upload New Image to Cloudflare R2 or Enter URL"
                />
              ) : activeTarget.type === "color" ? (
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Select Brand Accent Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={draftValue || "#eb2d4a"}
                      onChange={(e) => setDraftValue(e.target.value)}
                      className="h-11 w-16 cursor-pointer rounded border border-slate-300 p-1"
                    />
                    <input
                      type="text"
                      value={draftValue}
                      onChange={(e) => setDraftValue(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-mono text-slate-900 focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    {activeTarget.type === "url" ? "Destination URL" : "Display Text"}
                  </label>
                  <input
                    type="text"
                    value={draftValue}
                    onChange={(e) => setDraftValue(e.target.value)}
                    autoFocus
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                {activeTarget.kind === "site_content" ? (
                  <button
                    type="button"
                    onClick={() => setDraftValue(activeTarget.defaultValue)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset Default
                  </button>
                ) : (
                  <span className="text-xs text-slate-400">Live Entity Field</span>
                )}

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={closeEditor}
                    disabled={saving}
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-red-700 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </CmsContext.Provider>
  );
}
