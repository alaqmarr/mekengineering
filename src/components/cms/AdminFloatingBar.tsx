"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Eye, Pencil, LogOut, ShieldCheck } from "lucide-react";
import { useCms } from "./CmsContext";

export function AdminFloatingBar() {
  const { isAdmin, editMode, setEditMode } = useCms();

  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-wrap items-center gap-2 rounded-full border border-white/15 bg-[#111318]/95 px-4 py-2 text-xs text-white shadow-2xl backdrop-blur-md">
      <div className="flex items-center gap-1.5 pr-2 border-r border-white/15">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <span className="font-heading font-bold uppercase tracking-wider text-[11px]">
          Admin Mode
        </span>
      </div>

      <button
        type="button"
        onClick={() => setEditMode(!editMode)}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-bold uppercase tracking-wider text-[11px] transition-colors cursor-pointer ${
          editMode
            ? "bg-primary text-white"
            : "bg-white/10 text-slate-300 hover:bg-white/20"
        }`}
      >
        {editMode ? (
          <>
            <Pencil className="h-3 w-3" />
            Inline Edit: ON
          </>
        ) : (
          <>
            <Eye className="h-3 w-3" />
            Preview Only
          </>
        )}
      </button>

      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white hover:text-black px-3 py-1 font-bold uppercase tracking-wider text-[11px] transition-colors"
      >
        <LayoutDashboard className="h-3 w-3" />
        Dashboard
      </Link>

      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        title="Sign out of Admin"
        className="inline-flex items-center gap-1 rounded-full bg-white/5 hover:bg-red-600/80 px-2.5 py-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
      >
        <LogOut className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
