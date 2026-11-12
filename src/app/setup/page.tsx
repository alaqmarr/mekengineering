import type { Metadata } from "next";
import Link from "next/link";
import { Lock, ArrowRight, ShieldAlert } from "lucide-react";
import { hasAdminAccount } from "@/db/queries";
import { SetupWizard } from "@/components/auth/SetupWizard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Initial System Setup | Mek Engineering Corporation",
  robots: { index: false, follow: false },
};

export default async function SetupPage() {
  const alreadyInitialized = await hasAdminAccount();

  return (
    <div className="min-h-screen bg-slate-950 pt-28 pb-20 px-4 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(235,45,74,0.18),transparent_60%)] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        {alreadyInitialized ? (
          <div className="rounded-2xl border border-white/15 bg-slate-900/90 backdrop-blur-md p-8 md:p-10 text-center space-y-6 shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 border border-primary/40 text-primary">
              <Lock className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-primary">
                Security Lock Active
              </span>
              <h1 className="font-heading text-3xl md:text-4xl font-bold uppercase text-white">
                Setup Already Completed
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                The primary administrator account for Mek Engineering Corporation has already been provisioned. Public setup is permanently locked.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-red-700 px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all"
              >
                Go to Admin Login
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-white/15 hover:bg-white/5 px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-300 transition-all"
              >
                Back to Storefront
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/15 bg-slate-900/95 backdrop-blur-md p-8 md:p-10 shadow-2xl space-y-6">
            <div className="border-b border-white/10 pb-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary mb-3">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>One-Time First-Run Wizard</span>
              </div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold uppercase text-white">
                Initialize Admin Account
              </h1>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Create the master administrator account for <strong className="text-white">mekengg.com</strong> to unlock inline hover pencil editing, product & taxonomy management, and R2 / SMTP credentials control.
              </p>
            </div>

            <SetupWizard />
          </div>
        )}
      </div>
    </div>
  );
}
