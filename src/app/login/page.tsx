import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Shield, Sparkles, ArrowRight } from "lucide-react";
import { isAdminAuthenticated } from "@/auth";
import { hasAdminAccount } from "@/db/queries";
import { LoginForm } from "@/components/auth/LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Login | Mek Engineering Corporation",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  const adminExists = await hasAdminAccount();

  return (
    <div className="min-h-screen bg-slate-950 pt-28 pb-20 px-4 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(235,45,74,0.16),transparent_60%)] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-5">
        {!adminExists && (
          <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-4 text-amber-100 flex items-center justify-between gap-4">
            <div className="flex items-start gap-2.5 text-xs">
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold uppercase tracking-wider text-amber-300">
                  No Admin Configured Yet
                </p>
                <p className="text-amber-100/80 mt-0.5">
                  Run the first-time setup wizard to create your admin account.
                </p>
              </div>
            </div>
            <Link
              href="/setup"
              className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-amber-400 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-950 hover:bg-amber-300 transition-colors"
            >
              Setup
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        <div className="rounded-2xl border border-white/15 bg-slate-900/95 backdrop-blur-md p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2 border-b border-white/10 pb-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 border border-primary/40 text-primary">
              <Shield className="h-6 w-6" />
            </div>
            <h1 className="font-heading text-3xl font-bold uppercase text-white">
              Administrator Portal
            </h1>
            <p className="text-xs text-slate-400">
              Sign in to manage products, categories, SEO, credentials & live inline edits.
            </p>
          </div>

          <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-white/5" />}>
            <LoginForm />
          </Suspense>

          <div className="pt-2 text-center">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              ← Return to Public Storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
