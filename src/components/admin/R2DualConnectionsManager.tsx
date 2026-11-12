"use client";

import React, { useState } from "react";
import {
  Cloud,
  Zap,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Shuffle,
  Trash2,
  AlertTriangle,
  KeyRound,
  PauseCircle,
  PlayCircle,
} from "lucide-react";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";

export interface MaskedR2SlotData {
  slot: 1 | 2;
  enabled: boolean;
  verified: boolean;
  accountId: string;
  accountName: string;
  accessKeyId: string;
  hasSecretAccessKey: boolean;
  secretAccessKeyMask: string;
  hasApiToken: boolean;
  apiTokenMask: string;
  bucketName: string;
  publicUrl: string;
  configured: boolean;
}

export interface MaskedIntegrationsPayload {
  oneClickTokenUrl: string;
  activeR2PoolCount: number;
  r2Connections: [MaskedR2SlotData, MaskedR2SlotData];
  r2: MaskedR2SlotData;
  smtp: {
    host: string;
    port: string;
    secure: boolean;
    user: string;
    hasPass: boolean;
    passMask: string;
    fromName: string;
    fromEmail: string;
    adminEmail: string;
    configured: boolean;
  };
}

interface DiscoveredBucket {
  name: string;
  location?: string;
}

interface SlotCardProps {
  slotData: MaskedR2SlotData;
  oneClickTokenUrl: string;
  onUpdated: (next: MaskedIntegrationsPayload) => void;
}

const MASK = "••••••••••••••••";

function R2ConnectionSlotCard({
  slotData,
  oneClickTokenUrl,
  onUpdated,
}: SlotCardProps) {
  const slot = slotData.slot;
  const [mode, setMode] = useState<"one-click" | "manual">("one-click");
  const [busy, setBusy] = useState(false);

  // One-Click Connect state
  const [apiToken, setApiToken] = useState("");
  const [publicUrlOverride, setPublicUrlOverride] = useState(
    slotData.publicUrl || ""
  );
  const [discoveredAccounts, setDiscoveredAccounts] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [selectedAccountId, setSelectedAccountId] = useState(
    slotData.accountId || ""
  );
  const [discoveredBuckets, setDiscoveredBuckets] = useState<DiscoveredBucket[]>(
    []
  );

  // Manual S3 state
  const [manualForm, setManualForm] = useState({
    accountId: slotData.accountId || "",
    bucketName: slotData.bucketName || "",
    accessKeyId: slotData.accessKeyId || "",
    secretAccessKey: slotData.secretAccessKeyMask || "",
    publicUrl: slotData.publicUrl || "",
  });

  function openCloudflarePopup() {
    window.open(
      oneClickTokenUrl,
      `cloudflare_r2_slot_${slot}`,
      "width=980,height=760,noopener,noreferrer"
    );
    notify.info(
      "Cloudflare R2 Token Page Opened",
      "Click 'Continue to summary' → 'Create Token', then paste the token here to auto-connect your pre-setup bucket."
    );
  }

  async function runOneClickConnect(opts?: {
    accountId?: string;
    bucketName?: string;
  }) {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "one-click-r2",
          slot,
          apiToken: apiToken || (slotData.hasApiToken ? MASK : ""),
          accountId: opts?.accountId || selectedAccountId || undefined,
          bucketName: opts?.bucketName || undefined,
          publicUrl: publicUrlOverride || undefined,
        }),
      });

      const data = await res.json();

      if (data.needsAccountSelection && Array.isArray(data.accounts)) {
        setDiscoveredAccounts(data.accounts);
        notify.info("Select Cloudflare Account", data.message);
        return;
      }

      if (data.needsBucketSelection && Array.isArray(data.availableBuckets)) {
        if (data.accountId) setSelectedAccountId(data.accountId);
        setDiscoveredBuckets(data.availableBuckets);
        notify.info("Select Pre-Setup Active Bucket", data.message);
        return;
      }

      if (!res.ok || !data.ok) {
        throw new Error(
          data.message || data.error || "One-click Cloudflare connection failed"
        );
      }

      setDiscoveredBuckets([]);
      setDiscoveredAccounts([]);
      setApiToken("");
      if (data.data) onUpdated(data.data);
      if (data.publicUrl) setPublicUrlOverride(data.publicUrl);

      notify.success(
        `Connection #${slot} Active!`,
        data.message || `Connected to pre-setup bucket "${data.bucketName}".`
      );
    } catch (err) {
      notify.error(
        `Connection #${slot} Failed`,
        err instanceof Error
          ? err.message
          : "Ensure you have an active pre-setup R2 bucket in Cloudflare."
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveManual(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/admin/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save-manual-r2",
          slot,
          ...manualForm,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(
          data.message || "Could not verify active pre-setup R2 bucket"
        );
      }
      if (data.data) onUpdated(data.data);
      notify.success(`Connection #${slot} Verified`, data.message);
    } catch (err) {
      notify.error(
        `Bucket Verification Failed`,
        err instanceof Error ? err.message : "Pre-setup bucket must be active"
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleTestSlot() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test-r2", slot }),
      });
      const data = await res.json();
      if (data.data) onUpdated(data.data);
      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Bucket test failed");
      }
      notify.success(`Connection #${slot} Healthy`, data.message);
    } catch (err) {
      notify.error(
        `Connection #${slot} Error`,
        err instanceof Error ? err.message : "Failed to verify active bucket"
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleSlot() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle-r2-slot",
          slot,
          enabled: !slotData.enabled,
        }),
      });
      const data = await res.json();
      if (data.data) onUpdated(data.data);
      notify.info("Pool Updated", data.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDisconnect() {
    if (
      !window.confirm(
        `Disconnect Cloudflare R2 Connection #${slot} (${slotData.bucketName || "unconfigured"})?`
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disconnect-r2", slot }),
      });
      const data = await res.json();
      if (data.data) onUpdated(data.data);
      setManualForm({
        accountId: "",
        bucketName: "",
        accessKeyId: "",
        secretAccessKey: "",
        publicUrl: "",
      });
      setPublicUrlOverride("");
      notify.info("Disconnected", data.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 space-y-4 transition-all",
        slotData.configured && slotData.enabled
          ? "border-emerald-300 bg-emerald-50/30"
          : "border-border bg-secondary/20"
      )}
    >
      {/* Slot Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl font-heading font-bold text-sm",
              slotData.configured && slotData.enabled
                ? "bg-emerald-600 text-white"
                : "bg-slate-900 text-white"
            )}
          >
            #{slot}
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold uppercase text-foreground">
              Cloudflare R2 Connection #{slot}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {slotData.configured ? (
                <span className="text-emerald-700 font-semibold">
                  Active Bucket: {slotData.bucketName}
                  {slotData.accountName ? ` (${slotData.accountName})` : ""}
                </span>
              ) : (
                "Requires an active pre-setup R2 bucket"
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {slotData.configured && (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={handleToggleSlot}
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer",
                  slotData.enabled
                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                    : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                )}
              >
                {slotData.enabled ? (
                  <>
                    <PauseCircle className="h-3.5 w-3.5" />
                    In Random Pool
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-3.5 w-3.5" />
                    Paused
                  </>
                )}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleTestSlot}
                className="rounded-lg border border-border bg-white hover:border-primary px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground cursor-pointer"
              >
                Verify
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleDisconnect}
                title="Disconnect bucket"
                className="p-1.5 rounded-lg border border-border bg-white hover:border-red-500 text-slate-500 hover:text-red-600 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex gap-1.5 rounded-xl bg-secondary p-1">
        <button
          type="button"
          onClick={() => setMode("one-click")}
          className={cn(
            "flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer",
            mode === "one-click"
              ? "bg-white text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          One-Click Cloudflare Connect
        </button>
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={cn(
            "flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer",
            mode === "manual"
              ? "bg-white text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <KeyRound className="h-3.5 w-3.5" />
          Manual S3 Keys
        </button>
      </div>

      {mode === "one-click" ? (
        <div className="space-y-3.5">
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-3.5 py-2.5 flex items-start gap-2.5 text-[11px] text-amber-900">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Pre-setup Bucket Required:</strong> Make sure at least one active R2 bucket already exists in your Cloudflare account before connecting.
            </span>
          </div>

          <button
            type="button"
            onClick={openCloudflarePopup}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#F6821F] hover:bg-[#e07010] px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all cursor-pointer"
          >
            <Cloud className="h-4 w-4" />
            1. Launch Cloudflare R2 Quick-Auth Popup
            <ExternalLink className="h-3.5 w-3.5" />
          </button>

          <div className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                2. Paste Generated Cloudflare API Token
              </label>
              <input
                type="password"
                placeholder={
                  slotData.hasApiToken
                    ? "Token saved - paste new token to reconnect or switch bucket"
                    : "Paste Cloudflare R2 API Token..."
                }
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Custom Public CDN URL (Optional - auto-detects custom domain / r2.dev)
              </label>
              <input
                type="url"
                placeholder="https://cdn.mekengg.com or https://pub-xxx.r2.dev"
                value={publicUrlOverride}
                onChange={(e) => setPublicUrlOverride(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3.5 py-2 text-xs"
              />
            </div>
          </div>

          {/* Account Picker if multiple accounts with active buckets were found */}
          {discoveredAccounts.length > 0 && (
            <div className="rounded-xl border border-primary/30 bg-white p-3 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                Select Cloudflare Account:
              </p>
              <div className="flex flex-wrap gap-2">
                {discoveredAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setSelectedAccountId(acc.id);
                      runOneClickConnect({ accountId: acc.id });
                    }}
                    className="rounded-lg bg-slate-900 hover:bg-primary px-3 py-1.5 text-xs font-bold text-white cursor-pointer"
                  >
                    {acc.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pre-Setup Active Bucket Picker if 2+ buckets exist in the Cloudflare account */}
          {discoveredBuckets.length > 0 && (
            <div className="rounded-xl border border-primary/40 bg-white p-3.5 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                Click an Active Pre-Setup Bucket to Bind to Connection #{slot}:
              </p>
              <div className="flex flex-wrap gap-2">
                {discoveredBuckets.map((b) => (
                  <button
                    key={b.name}
                    type="button"
                    disabled={busy}
                    onClick={() => runOneClickConnect({ bucketName: b.name })}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary hover:bg-primary hover:text-white hover:border-primary px-3 py-2 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{b.name}</span>
                    {b.location && (
                      <span className="text-[10px] opacity-75">({b.location})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            disabled={busy || (!apiToken.trim() && !slotData.hasApiToken)}
            onClick={() => runOneClickConnect()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-primary px-4 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all disabled:opacity-50 cursor-pointer"
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying Active Bucket...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 text-amber-400" />
                {slotData.configured
                  ? `Reconnect / Switch Bucket (Conn #${slot})`
                  : `Auto-Connect Active Bucket (Conn #${slot})`}
              </>
            )}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSaveManual} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Cloudflare Account ID *"
              value={manualForm.accountId}
              onChange={(e) =>
                setManualForm({ ...manualForm, accountId: e.target.value })
              }
              className="rounded-lg border border-border bg-white px-3 py-2 text-xs font-mono"
            />
            <input
              type="text"
              required
              placeholder="Pre-setup Active Bucket Name *"
              value={manualForm.bucketName}
              onChange={(e) =>
                setManualForm({ ...manualForm, bucketName: e.target.value })
              }
              className="rounded-lg border border-border bg-white px-3 py-2 text-xs font-mono"
            />
            <input
              type="text"
              required
              placeholder="S3 Access Key ID *"
              value={manualForm.accessKeyId}
              onChange={(e) =>
                setManualForm({ ...manualForm, accessKeyId: e.target.value })
              }
              className="rounded-lg border border-border bg-white px-3 py-2 text-xs font-mono"
            />
            <input
              type="password"
              required={!slotData.hasSecretAccessKey}
              placeholder="S3 Secret Access Key *"
              value={manualForm.secretAccessKey}
              onFocus={() => {
                if (manualForm.secretAccessKey === MASK) {
                  setManualForm({ ...manualForm, secretAccessKey: "" });
                }
              }}
              onChange={(e) =>
                setManualForm({ ...manualForm, secretAccessKey: e.target.value })
              }
              className="rounded-lg border border-border bg-white px-3 py-2 text-xs font-mono"
            />
            <input
              type="url"
              placeholder="Public Bucket URL (https://cdn.mekengg.com)"
              value={manualForm.publicUrl}
              onChange={(e) =>
                setManualForm({ ...manualForm, publicUrl: e.target.value })
              }
              className="sm:col-span-2 rounded-lg border border-border bg-white px-3 py-2 text-xs"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors cursor-pointer"
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Verify Pre-Setup Bucket & Save Connection #{slot}
          </button>
        </form>
      )}
    </div>
  );
}

export function R2DualConnectionsManager({
  integrations,
  onUpdated,
}: {
  integrations: MaskedIntegrationsPayload;
  onUpdated: (next: MaskedIntegrationsPayload) => void;
}) {
  const activeCount = integrations.activeR2PoolCount;

  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-xs space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F6821F]/15 text-[#F6821F]">
            <Cloud className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold uppercase text-foreground">
              Dual Cloudflare R2 Storage & Random Load Balancer
            </h2>
            <p className="text-xs text-muted-foreground">
              Connect up to <strong>2 pre-setup active Cloudflare R2 buckets</strong>. When both are active, image uploads (`react-dropzone` & `Ctrl+V`) randomly distribute across both buckets!
            </p>
          </div>
        </div>

        <div
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider shrink-0",
            activeCount === 2
              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
              : activeCount === 1
              ? "bg-blue-100 text-blue-900 border border-blue-300"
              : "bg-amber-100 text-amber-900 border border-amber-300"
          )}
        >
          <Shuffle className="h-4 w-4" />
          <span>
            {activeCount === 2
              ? "Random 2-Bucket Pool Active (50/50)"
              : activeCount === 1
              ? "1 Active Bucket Connected"
              : "0 Buckets Connected (Local Disk Fallback)"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <R2ConnectionSlotCard
          slotData={integrations.r2Connections[0]}
          oneClickTokenUrl={integrations.oneClickTokenUrl}
          onUpdated={onUpdated}
        />
        <R2ConnectionSlotCard
          slotData={integrations.r2Connections[1]}
          oneClickTokenUrl={integrations.oneClickTokenUrl}
          onUpdated={onUpdated}
        />
      </div>
    </div>
  );
}
