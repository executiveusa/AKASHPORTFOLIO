"use client";

import { useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SecretEntry {
  id: string;
  name: string;
  category: "api" | "database" | "deployment" | "oauth" | "payment" | "voice" | "social" | "misc";
  last_rotated: string | null;
  expires_at: string | null;
  status: "valid" | "expiring" | "expired" | "unknown";
  notes: string | null;
}

// ---------------------------------------------------------------------------
// Static vault manifest (metadata only — no actual secret values)
// Sourced from pauli-secrets-vault categories
// ---------------------------------------------------------------------------

const VAULT_MANIFEST: SecretEntry[] = [
  // API
  { id: "1",  name: "ANTHROPIC_API_KEY",         category: "api",        status: "valid",    last_rotated: "2026-03-01", expires_at: null,         notes: "Claude 3.5 — primary LLM" },
  { id: "2",  name: "OPEN_ROUTER_API",            category: "api",        status: "valid",    last_rotated: "2026-03-01", expires_at: null,         notes: "OpenRouter gateway" },
  { id: "3",  name: "ELEVENLABS_API_KEY",         category: "voice",      status: "valid",    last_rotated: "2026-02-15", expires_at: null,         notes: "Voice fallback" },
  { id: "4",  name: "MERCURY_API_KEY",            category: "voice",      status: "valid",    last_rotated: "2026-03-01", expires_at: null,         notes: "Mercury 2 primary voice" },
  // Database
  { id: "5",  name: "NEXT_PUBLIC_SUPABASE_URL",   category: "database",   status: "valid",    last_rotated: "2026-01-10", expires_at: null,         notes: "Supabase project URL" },
  { id: "6",  name: "SUPABASE_SERVICE_ROLE_KEY",  category: "database",   status: "valid",    last_rotated: "2026-01-10", expires_at: null,         notes: "Service role — server only" },
  // Deployment
  { id: "7",  name: "VERCEL_TOKEN",               category: "deployment", status: "valid",    last_rotated: "2026-03-01", expires_at: "2027-03-01", notes: "Vercel API token" },
  { id: "8",  name: "CRON_SECRET",                category: "deployment", status: "valid",    last_rotated: "2026-01-01", expires_at: null,         notes: "Cron endpoint auth" },
  { id: "9",  name: "GH_PAT",                     category: "deployment", status: "valid",    last_rotated: "2026-03-01", expires_at: "2027-03-01", notes: "GitHub PAT — HTTPS auth" },
  // OAuth
  { id: "10", name: "GOOGLE_CLIENT_ID",           category: "oauth",      status: "unknown",  last_rotated: null,         expires_at: null,         notes: "Google OAuth — not yet configured" },
  { id: "11", name: "GOOGLE_CLIENT_SECRET",       category: "oauth",      status: "unknown",  last_rotated: null,         expires_at: null,         notes: "Google OAuth — not yet configured" },
  { id: "12", name: "NEXTAUTH_SECRET",            category: "oauth",      status: "valid",    last_rotated: "2026-03-01", expires_at: null,         notes: "NextAuth session signing" },
  // Payment
  { id: "13", name: "STRIPE_SECRET_KEY",          category: "payment",    status: "valid",    last_rotated: "2026-02-01", expires_at: null,         notes: "Stripe live key" },
  { id: "14", name: "STRIPE_WEBHOOK_SECRET",      category: "payment",    status: "valid",    last_rotated: "2026-02-01", expires_at: null,         notes: "Stripe webhook signature" },
  // Social
  { id: "15", name: "CLOUDFLARE_API_TOKEN",       category: "api",        status: "valid",    last_rotated: "2026-01-15", expires_at: null,         notes: "CF zone management" },
  { id: "16", name: "PERSONA_PLEX_API_KEY",       category: "api",        status: "valid",    last_rotated: "2026-03-01", expires_at: null,         notes: "PersonaPlex identity" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_CONFIG = {
  valid:    { color: "#22c55e", label: "Valid",          bg: "rgba(34,197,94,0.1)" },
  expiring: { color: "#f97316", label: "Expiring Soon",  bg: "rgba(249,115,22,0.1)" },
  expired:  { color: "#ef4444", label: "Expired",        bg: "rgba(239,68,68,0.1)" },
  unknown:  { color: "#94a3b8", label: "Not Configured", bg: "rgba(148,163,184,0.1)" },
};

const CATEGORY_LABELS: Record<SecretEntry["category"], string> = {
  api:        "API Keys",
  database:   "Database",
  deployment: "Deployment",
  oauth:      "OAuth",
  payment:    "Payments",
  voice:      "Voice AI",
  social:     "Social / CDN",
  misc:       "Misc",
};

const CATEGORY_ORDER: SecretEntry["category"][] = [
  "deployment", "database", "api", "voice", "payment", "oauth", "social", "misc"
];

function groupByCategory(entries: SecretEntry[]) {
  const grouped: Record<string, SecretEntry[]> = {};
  for (const entry of entries) {
    if (!grouped[entry.category]) grouped[entry.category] = [];
    grouped[entry.category].push(entry);
  }
  return grouped;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function VaultPage() {
  const grouped = groupByCategory(VAULT_MANIFEST);
  const totalValid    = VAULT_MANIFEST.filter(s => s.status === "valid").length;
  const totalExpiring = VAULT_MANIFEST.filter(s => s.status === "expiring").length;
  const totalExpired  = VAULT_MANIFEST.filter(s => s.status === "expired").length;
  const totalUnknown  = VAULT_MANIFEST.filter(s => s.status === "unknown").length;

  return (
    <div className="page-content" style={{ padding: "32px 40px", maxWidth: 960 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-gold-500)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          La Vigilante™ · Credentials Monitor
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--color-cream-100)", letterSpacing: "-0.03em", marginBottom: 4 }}>
          Bóveda de Secretos™
        </h1>
        <p style={{ fontSize: 13, color: "var(--color-cream-400)" }}>
          Metadata only — no secret values are stored or displayed here. Rotation reminders only.
        </p>
      </div>

      {/* KPI Row */}
      <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
        {[
          { label: "Valid",           value: totalValid,    color: "#22c55e" },
          { label: "Expiring",        value: totalExpiring, color: "#f97316" },
          { label: "Expired",         value: totalExpired,  color: "#ef4444" },
          { label: "Not Configured",  value: totalUnknown,  color: "#94a3b8" },
        ].map(kpi => (
          <div key={kpi.label} className="panel" style={{ padding: "12px 20px", flex: 1, minWidth: 120 }}>
            <div style={{ fontSize: 11, color: "var(--color-cream-400)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{kpi.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: kpi.color, fontFamily: "var(--font-mono)" }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Credential Groups */}
      {CATEGORY_ORDER.filter(cat => grouped[cat]?.length).map(category => (
        <div key={category} style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-cream-400)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            {CATEGORY_LABELS[category]}
          </div>
          <div className="panel" style={{ overflow: "hidden" }}>
            {grouped[category].map((entry, idx) => {
              const sc = STATUS_CONFIG[entry.status];
              return (
                <div
                  key={entry.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 120px 130px 1fr",
                    alignItems: "center",
                    gap: 16,
                    padding: "11px 16px",
                    borderBottom: idx < grouped[category].length - 1 ? "1px solid var(--color-charcoal-700)" : "none",
                    fontSize: 13,
                  }}
                >
                  {/* Name */}
                  <div style={{ fontFamily: "var(--font-mono)", color: "var(--color-cream-100)", fontSize: 12 }}>
                    {entry.name}
                  </div>

                  {/* Status badge */}
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "3px 10px", borderRadius: 6,
                    background: sc.bg, color: sc.color,
                    fontSize: 11, fontWeight: 600,
                    width: "fit-content",
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.color, flexShrink: 0 }} />
                    {sc.label}
                  </div>

                  {/* Last rotated */}
                  <div style={{ color: "var(--color-cream-400)", fontSize: 12 }}>
                    {entry.last_rotated
                      ? `Rotated ${new Date(entry.last_rotated).toLocaleDateString("es-MX", { month: "short", day: "numeric", year: "numeric" })}`
                      : "—"}
                  </div>

                  {/* Notes */}
                  <div style={{ color: "var(--color-cream-500)", fontSize: 12 }}>
                    {entry.notes ?? "—"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Footer note */}
      <p style={{ fontSize: 11, color: "var(--color-cream-600)", marginTop: 24 }}>
        To rotate a credential, visit the provider dashboard directly. La Vigilante™ will alert within 30 days of expiry via /api/watcher.
      </p>
    </div>
  );
}
