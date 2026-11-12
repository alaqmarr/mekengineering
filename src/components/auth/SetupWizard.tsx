"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  ShieldCheck,
  UserPlus,
  Loader2,
  ChevronDown,
  ChevronUp,
  Cloud,
  Mail,
  Eye,
  EyeOff,
} from "lucide-react";
import { notify } from "@/lib/toast";

export function SetupWizard() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);

  const [form, setForm] = useState({
    name: "Mek Engineering Admin",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [integrations, setIntegrations] = useState({
    "r2.accountId": "",
    "r2.accessKeyId": "",
    "r2.secretAccessKey": "",
    "r2.bucketName": "mekengineering",
    "r2.publicUrl": "",
    "smtp.host": "smtp.gmail.com",
    "smtp.port": "465",
    "smtp.secure": "true",
    "smtp.user": "",
    "smtp.pass": "",
    "smtp.fromName": "Mek Engineering Corporation",
    "smtp.fromEmail": "",
    "smtp.adminEmail": "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.password.length < 8) {
      notify.error("Weak Password", "Admin password must be at least 8 characters long.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      notify.error("Password Mismatch", "Password and Confirm Password do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          integrations: showIntegrations ? integrations : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize admin account");
      }

      notify.success(
        "Admin Account Created!",
        "Signing you in and enabling live visual CMS mode..."
      );

      const signInRes = await signIn("credentials", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        redirect: false,
      });

      if (signInRes?.error) {
        router.push("/login");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      notify.error(
        "Setup Failed",
        err instanceof Error ? err.message : "Could not complete initial setup"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Administrator Display Name *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Zoeb Bootwala"
            className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Admin Login Email *
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="admin@mekengg.com"
            className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Master Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 8 characters"
                className="w-full rounded-lg border border-white/15 bg-white/5 pl-4 pr-10 py-3 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Confirm Password *
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="Re-enter password"
              className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      </div>

      {/* Optional R2 + Nodemailer DB Configuration */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
        <button
          type="button"
          onClick={() => setShowIntegrations(!showIntegrations)}
          className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-white/5 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Cloud className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">
                Optional: Pre-configure Cloudflare R2 & Gmail SMTP Now
              </p>
              <p className="text-[11px] text-slate-400">
                You can also configure or test these anytime inside Admin Dashboard → Credentials
              </p>
            </div>
          </div>
          {showIntegrations ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </button>

        {showIntegrations && (
          <div className="p-4 pt-2 border-t border-white/10 space-y-5">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <Cloud className="h-3.5 w-3.5" />
                <span>Cloudflare R2 Storage</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="R2 Account ID"
                  value={integrations["r2.accountId"]}
                  onChange={(e) =>
                    setIntegrations({ ...integrations, "r2.accountId": e.target.value })
                  }
                  className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-xs text-white placeholder:text-slate-500"
                />
                <input
                  type="text"
                  placeholder="R2 Bucket Name (e.g. mekengineering)"
                  value={integrations["r2.bucketName"]}
                  onChange={(e) =>
                    setIntegrations({ ...integrations, "r2.bucketName": e.target.value })
                  }
                  className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-xs text-white placeholder:text-slate-500"
                />
                <input
                  type="text"
                  placeholder="R2 Access Key ID"
                  value={integrations["r2.accessKeyId"]}
                  onChange={(e) =>
                    setIntegrations({ ...integrations, "r2.accessKeyId": e.target.value })
                  }
                  className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-xs text-white placeholder:text-slate-500"
                />
                <input
                  type="password"
                  placeholder="R2 Secret Access Key"
                  value={integrations["r2.secretAccessKey"]}
                  onChange={(e) =>
                    setIntegrations({ ...integrations, "r2.secretAccessKey": e.target.value })
                  }
                  className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-xs text-white placeholder:text-slate-500"
                />
              </div>
              <input
                type="url"
                placeholder="R2 Public Custom Domain / r2.dev URL (https://assets.mekengg.com)"
                value={integrations["r2.publicUrl"]}
                onChange={(e) =>
                  setIntegrations({ ...integrations, "r2.publicUrl": e.target.value })
                }
                className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-xs text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <Mail className="h-3.5 w-3.5" />
                <span>Gmail SMTP (Nodemailer)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="email"
                  placeholder="Gmail Address (SMTP User)"
                  value={integrations["smtp.user"]}
                  onChange={(e) =>
                    setIntegrations({ ...integrations, "smtp.user": e.target.value })
                  }
                  className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-xs text-white placeholder:text-slate-500"
                />
                <input
                  type="password"
                  placeholder="16-char Gmail App Password"
                  value={integrations["smtp.pass"]}
                  onChange={(e) =>
                    setIntegrations({ ...integrations, "smtp.pass": e.target.value })
                  }
                  className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-xs text-white placeholder:text-slate-500"
                />
                <input
                  type="email"
                  placeholder="Admin Alert Recipient Email"
                  value={integrations["smtp.adminEmail"]}
                  onChange={(e) =>
                    setIntegrations({ ...integrations, "smtp.adminEmail": e.target.value })
                  }
                  className="sm:col-span-2 rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-xs text-white placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/25 px-4 py-3 flex items-start gap-3 text-xs text-emerald-200">
        <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
        <span>
          Once created, this <code className="font-mono text-white">/setup</code> route automatically locks itself permanently so no second admin can be registered publicly.
        </span>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-red-700 px-8 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-lg hover:shadow-primary/40 transition-all disabled:opacity-60 cursor-pointer"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Initializing Administrator...
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4" />
            Create First Admin & Launch CMS
          </>
        )}
      </button>
    </form>
  );
}
