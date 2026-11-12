"use client";

import React, { useState, useEffect } from "react";
import { Pencil, Image as ImageIcon } from "lucide-react";
import { useCms, type EditableFieldType } from "./CmsContext";
import { cn } from "@/lib/utils";

type TagName = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div" | "blockquote";

interface EditableTextProps {
  contentKey: string;
  fallback: string;
  label: string;
  section?: string;
  type?: EditableFieldType;
  as?: TagName;
  className?: string;
}

export function EditableText({
  contentKey,
  fallback,
  label,
  section = "global",
  type = "text",
  as: Component = "span",
  className,
}: EditableTextProps) {
  const { isAdmin, editMode, getText, openEditor } = useCms();
  const value = getText(contentKey, fallback);

  if (!isAdmin || !editMode) {
    return <Component className={className}>{value}</Component>;
  }

  const handleOpen = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openEditor({
      kind: "site_content",
      key: contentKey,
      label,
      type,
      currentValue: value,
      defaultValue: fallback,
      section,
    });
  };

  return (
    <Component
      className={cn(
        "group/edit relative transition-all duration-150 hover:outline-1 hover:outline-dashed hover:outline-primary/70 rounded-xs",
        className
      )}
    >
      {value}
      <span
        role="button"
        tabIndex={0}
        title={`Edit: ${label}`}
        onClick={handleOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleOpen(e);
        }}
        className=" -top-2.5 -right-2.5 z-30 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-lg ring-2 ring-white opacity-0 scale-90 group-hover/edit:opacity-100 group-hover/edit:scale-100 transition-all duration-150 cursor-pointer absolute"
      >
        <Pencil className="h-3 w-3" />
      </span>
    </Component>
  );
}

interface EditableEntityTextProps {
  endpoint: "products" | "categories" | "subcategories" | "brands" | "slides";
  id: number;
  field: string;
  value: string;
  label: string;
  type?: EditableFieldType;
  as?: TagName;
  className?: string;
  placeholder?: string;
}

export function EditableEntityText({
  endpoint,
  id,
  field,
  value: initialValue,
  label,
  type = "text",
  as: Component = "span",
  className,
  placeholder = "Click pencil to add content...",
}: EditableEntityTextProps) {
  const { isAdmin, editMode, openEditor } = useCms();
  const [localVal, setLocalVal] = useState(initialValue);

  useEffect(() => {
    setLocalVal(initialValue);
  }, [initialValue]);

  if (!isAdmin || !editMode) {
    if (!localVal) return null;
    return <Component className={className}>{localVal}</Component>;
  }

  const handleOpen = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openEditor({
      kind: "entity_field",
      endpoint,
      id,
      field,
      label,
      type,
      currentValue: localVal,
      onSaved: (next) => setLocalVal(next),
    });
  };

  return (
    <Component
      className={cn(
        "group/edit relative transition-all duration-150 hover:outline-1 hover:outline-dashed hover:outline-primary/70 rounded-xs",
        !localVal && "italic opacity-60",
        className
      )}
    >
      {localVal || placeholder}
      <span
        role="button"
        tabIndex={0}
        title={`Edit ${label}`}
        onClick={handleOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleOpen(e);
        }}
        className="absolute -top-2.5 -right-2.5 z-30 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-lg ring-2 ring-white opacity-0 scale-90 group-hover/edit:opacity-100 group-hover/edit:scale-100 transition-all duration-150 cursor-pointer"
      >
        <Pencil className="h-3 w-3" />
      </span>
    </Component>
  );
}

interface EditableImageBadgeProps {
  label: string;
  contentKey?: string;
  fallback?: string;
  section?: string;
  entity?: {
    endpoint: "products" | "categories" | "subcategories" | "brands" | "slides";
    id: number;
    field: string;
    currentValue: string;
    onSaved?: (v: string) => void;
  };
  className?: string;
}

export function EditableImageTrigger({
  label,
  contentKey,
  fallback = "",
  section = "global",
  entity,
  className,
}: EditableImageBadgeProps) {
  const { isAdmin, editMode, getText, openEditor } = useCms();
  if (!isAdmin || !editMode) return null;

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (contentKey) {
      openEditor({
        kind: "site_content",
        key: contentKey,
        label,
        type: "image",
        currentValue: getText(contentKey, fallback),
        defaultValue: fallback,
        section,
      });
    } else if (entity) {
      openEditor({
        kind: "entity_field",
        endpoint: entity.endpoint,
        id: entity.id,
        field: entity.field,
        label,
        type: "image",
        currentValue: entity.currentValue,
        onSaved: entity.onSaved,
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleOpen}
      title={`Change ${label}`}
      className={cn(
        "z-30 inline-flex items-center gap-1.5 rounded-full bg-black/80 hover:bg-primary px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg border border-white/20 backdrop-blur-sm transition-all cursor-pointer",
        className
      )}
    >
      <ImageIcon className="h-3.5 w-3.5" />
      <Pencil className="h-3 w-3" />
      <span>Edit Image</span>
    </button>
  );
}
