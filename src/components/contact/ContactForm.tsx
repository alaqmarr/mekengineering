"use client";

import React, { useState } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { notify } from "@/lib/toast";
import { EditableText } from "@/components/cms/Editable";

interface ContactFormProps {
  productId?: number;
  productName?: string;
  onSubmitted?: () => void;
  compact?: boolean;
}

export function ContactForm({
  productId,
  productName,
  onSubmitted,
  compact = false,
}: ContactFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    subject: productName ? `Wholesale Quote: ${productName}` : "",
    message: productName
      ? `Hello Mek Engineering Team, please share wholesale availability and pricing for ${productName}.`
      : "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          productId,
          productName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send inquiry");
      }

      setSubmittedId(data.id);
      notify.success(
        "Inquiry Received!",
        `Reference #${data.id} logged. Our sales engineers will contact you shortly.`
      );
      setForm({
        name: "",
        phone: "",
        email: "",
        company: "",
        subject: "",
        message: "",
      });
      onSubmitted?.();
    } catch (err) {
      notify.error(
        "Submission Error",
        err instanceof Error ? err.message : "Could not send message"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submittedId && !compact) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-8 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h3 className="font-heading text-2xl font-bold uppercase text-slate-900">
          Thank You — Inquiry #{submittedId} Submitted
        </h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Our sales desk at Victoria Ranigunj, Secunderabad has received your message and will get back to you promptly.
        </p>
        <button
          type="button"
          onClick={() => setSubmittedId(null)}
          className="rounded-lg bg-slate-900 hover:bg-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors cursor-pointer"
        >
          Send Another Inquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Full Name *
          </label>
          <input
            type="text"
            required
            placeholder="Your Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Phone / WhatsApp *
          </label>
          <input
            type="tel"
            required
            placeholder="+91 98765 43210"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Email Address *
          </label>
          <input
            type="email"
            required
            placeholder="you@company.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Company / Organization
          </label>
          <input
            type="text"
            placeholder="Optional GST / Firm Name"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="w-full rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {!compact && (
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Subject / Requirement
          </label>
          <input
            type="text"
            placeholder="e.g., Bulk Quotation for Bosch Rotary Hammers"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
          Message & Quantity Details *
        </label>
        <textarea
          rows={compact ? 4 : 5}
          required
          placeholder="Tell us the models, quantities, or industrial specifications you need..."
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-red-700 px-8 py-4 font-bold uppercase tracking-wider text-sm text-white shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-60 cursor-pointer"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending Inquiry...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            {compact ? (
              "Submit Quote Request"
            ) : (
              <EditableText
                contentKey="contact.form.submitText"
                fallback="Send Inquiry"
                label="Contact Form Submit Button"
                section="contact"
              />
            )}
          </>
        )}
      </button>
    </form>
  );
}
