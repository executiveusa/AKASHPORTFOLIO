"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type IntegStatus = "connected" | "not_set" | "error";

interface Integration {
  id: string;
  name: string;
  env: string;
  note?: string;
  category: string;
  priority?: number;
  status?: IntegStatus;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const INTEGRATIONS: Integration[] = [
  // Pagos México
  { id: "mercadopago", name: "MercadoPago",         env: "MERCADOPAGO_ACCESS_TOKEN", category: "Pagos MX",     priority: 1 },
  { id: "oxxo",        name: "OXXO",                env: "MERCADOPAGO_ACCESS_TOKEN", category: "Pagos MX",     note: "vía MercadoPago" },
  { id: "spei",        name: "SPEI",                env: "MERCADOPAGO_ACCESS_TOKEN", category: "Pagos MX",     note: "vía MercadoPago" },
  { id: "mxnb",        name: "MXNB",                env: "BITSO_API_KEY",            category: "Pagos MX" },
  // Pagos Global
  { id: "stripe",      name: "Stripe",              env: "STRIPE_SECRET_KEY",        category: "Pagos Global", priority: 1 },
  { id: "paypal",      name: "PayPal",              env: "PAYPAL_CLIENT_ID",         category: "Pagos Global" },
  { id: "bitcoin",     name: "Bitcoin / Lightning", env: "BTCPAY_URL",               category: "Pagos Global" },
  { id: "creem",       name: "Creem.io",            env: "CREEM_API_KEY",            category: "Pagos Global" },
  // Comunicación
  { id: "whatsapp",    name: "WhatsApp Business",   env: "WHATSAPP_TOKEN",           category: "Comunicación", priority: 1 },
  { id: "telegram",    name: "Telegram",            env: "TELEGRAM_BOT_TOKEN",       category: "Comunicación" },
  { id: "twilio",      name: "Twilio Voz",          env: "TWILIO_ACCOUNT_SID",       category: "Comunicación" },
  // Data & PM
  { id: "github",      name: "GitHub",              env: "GITHUB_TOKEN",             category: "Data & PM",    priority: 1 },
  { id: "notion",      name: "Notion",              env: "NOTION_TOKEN",             category: "Data & PM" },
  { id: "gcal",        name: "Google Calendar",     env: "GOOGLE_CLIENT_ID",         category: "Data & PM" },
  { id: "zapier",      name: "Zapier",              env: "ZAPIER_WEBHOOK_URL",       category: "Data & PM" },
];

const CATEGORIES = ["Pagos MX", "Pagos Global", "Comunicación", "Data & PM"];

// ─── Components ───────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: IntegStatus }) {
  const color = { connected: "#22c55e", not_set: "#6b6b85", error: "#ef4444" }[status];
  return <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />;
}

function IntegCard({ integ }: { integ: Integration }) {
  const status = integ.status ?? "not_set";
  const statusLabel = { connected: "Conectado", not_set: "Sin configurar", error: "Error" }[status];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--color-border)" }}>
      <StatusDot status={status} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text)" }}>
          {integ.name}
          {integ.priority === 1 && <span style={{ marginLeft: 6, fontSize: 10, padding: "1px 5px", borderRadius: 3, background: "#d4af3720", color: "#d4af37", fontWeight: 600 }}>PRIO</span>}
        </div>
        {integ.note && <div style={{ fontSize: 11, color: "var(--color-muted)" }}>{integ.note}</div>}
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: status === "connected" ? "#22c55e" : "var(--color-muted)", marginBottom: 4 }}>{statusLabel}</div>
        {status !== "connected" && (
          <button
            style={{ fontSize: 11, padding: "4px 10px", background: "var(--color-accent)20", color: "var(--color-accent)", border: `1px solid var(--color-accent)40`, borderRadius: 5, cursor: "pointer" }}
            onClick={() => alert(`Agregar ${integ.env} en Vercel → Settings → Environment Variables`)}
          >
            Conectar
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IntegracionesPage() {
  const [statuses, setStatuses] = useState<Record<string, IntegStatus>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/integrations/status")
      .then((r) => r.json())
      .then((d) => { if (d?.statuses) setStatuses(d.statuses); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const integWithStatus = INTEGRATIONS.map((i) => ({ ...i, status: statuses[i.id] ?? "not_set" }));
  const connectedCount = Object.values(statuses).filter((s) => s === "connected").length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-sans)", paddingBottom: 80 }}>
      <header style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--color-border)" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, marginBottom: 2 }}>Integraciones</div>
        <div style={{ fontSize: 11, color: "var(--color-muted)" }}>
          {loading ? "Verificando..." : `${connectedCount} de ${INTEGRATIONS.length} conectadas`}
        </div>
      </header>

      <main style={{ padding: 16 }}>
        {/* Summary bar */}
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, padding: "10px 16px", marginBottom: 20, display: "flex", gap: 20 }}>
          {[{ label: "Conectadas", color: "#22c55e", count: Object.values(statuses).filter((s) => s === "connected").length },
            { label: "Sin config.", color: "#6b6b85", count: INTEGRATIONS.length - Object.values(statuses).filter((s) => s === "connected").length },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.count}</div>
              <div style={{ fontSize: 11, color: "var(--color-muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* By category */}
        {CATEGORIES.map((cat) => {
          const items = integWithStatus.filter((i) => i.category === cat);
          return (
            <section key={cat} style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{cat}</h2>
              {items.map((i) => <IntegCard key={i.id} integ={i} />)}
            </section>
          );
        })}

        <div style={{ fontSize: 12, color: "var(--color-muted)", textAlign: "center", padding: "8px 0" }}>
          Para conectar: agregar la variable de entorno en Vercel Dashboard
        </div>
      </main>
    </div>
  );
}
