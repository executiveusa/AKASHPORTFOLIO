"use client";

import { useState, useEffect } from "react";

interface Payment {
  id: string;
  date: string;
  customer: string;
  amount: number;
  currency: string;
  source: "stripe" | "creem" | "crypto";
  status: "succeeded" | "pending" | "failed" | "refunded";
  description: string;
}

interface CheckoutLink {
  id: string;
  name: string;
  price: number;
  currency: string;
  url: string;
  source: "stripe" | "creem";
  clicks: number;
  conversions: number;
}

const demoPayments: Payment[] = [
  { id: "pay_001", date: "2025-06-15T14:22:00Z", customer: "Marco R. — CDMX", amount: 299, currency: "USD", source: "stripe", status: "succeeded", description: "Synthia Starter Plan (Anual)" },
  { id: "pay_002", date: "2025-06-15T11:08:00Z", customer: "ana.garcia@empresa.es", amount: 49, currency: "EUR", source: "creem", status: "succeeded", description: "AI Template Pack" },
  { id: "pay_003", date: "2025-06-14T19:45:00Z", customer: "TechPR LLC", amount: 1999, currency: "USD", source: "stripe", status: "succeeded", description: "Enterprise Plan (Anual)" },
  { id: "pay_004", date: "2025-06-14T16:30:00Z", customer: "Carlos M. — Bogotá", amount: 79, currency: "USD", source: "creem", status: "pending", description: "Automation Toolkit" },
  { id: "pay_005", date: "2025-06-14T09:15:00Z", customer: "DIS Wallet 0x3f...a2", amount: 150, currency: "MXN", source: "crypto", status: "succeeded", description: "DIS Token — Consulting Credit" },
  { id: "pay_006", date: "2025-06-13T22:00:00Z", customer: "Restaurante La Buena — CDMX", amount: 2400, currency: "MXN", source: "stripe", status: "succeeded", description: "PyME Automation Monthly" },
  { id: "pay_007", date: "2025-06-13T15:12:00Z", customer: "unknown@test.com", amount: 49, currency: "USD", source: "creem", status: "refunded", description: "AI Template Pack — Refund" },
];

const demoLinks: CheckoutLink[] = [
  { id: "link_001", name: "Synthia Starter Plan", price: 299, currency: "USD", url: "https://pay.creem.io/synthia-starter", source: "creem", clicks: 234, conversions: 12 },
  { id: "link_002", name: "AI Template Pack", price: 49, currency: "USD", url: "https://pay.creem.io/ai-templates", source: "creem", clicks: 891, conversions: 47 },
  { id: "link_003", name: "Enterprise Plan", price: 1999, currency: "USD", url: "https://buy.stripe.com/enterprise", source: "stripe", clicks: 45, conversions: 3 },
  { id: "link_004", name: "Automation Toolkit", price: 79, currency: "USD", url: "https://pay.creem.io/automation-kit", source: "creem", clicks: 156, conversions: 8 },
  { id: "link_005", name: "Consulting Hour", price: 150, currency: "USD", url: "https://buy.stripe.com/consulting", source: "stripe", clicks: 67, conversions: 5 },
];

function SourceIcon({ source }: { source: string }) {
  const colors: Record<string, string> = {
    stripe: "#635bff",
    creem: "var(--color-gold-400)",
    crypto: "#f7931a",
  };
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 22,
      height: 22,
      borderRadius: 6,
      backgroundColor: colors[source] || "var(--color-charcoal-600)",
      fontSize: 10,
      fontWeight: 700,
      color: "#fff",
      textTransform: "uppercase",
    }}>
      {source[0]}
    </span>
  );
}

function PaymentStatus({ status }: { status: string }) {
  const config: Record<string, { color: string; bg: string }> = {
    succeeded: { color: "var(--color-status-ok)", bg: "rgba(52,211,153,0.1)" },
    pending: { color: "var(--color-status-warn)", bg: "rgba(251,191,36,0.1)" },
    failed: { color: "var(--color-status-error)", bg: "rgba(239,68,68,0.1)" },
    refunded: { color: "var(--color-cream-400)", bg: "rgba(184,164,133,0.1)" },
  };
  const c = config[status] || config.pending;
  return (
    <span style={{
      padding: "2px 10px",
      borderRadius: 6,
      fontSize: 12,
      fontWeight: 500,
      color: c.color,
      backgroundColor: c.bg,
    }}>
      {status}
    </span>
  );
}

export default function PaymentsPage() {
  const [tab, setTab] = useState<"transactions" | "links">("transactions");
  const [payments] = useState<Payment[]>(demoPayments);
  const [links] = useState<CheckoutLink[]>(demoLinks);
  const [creating, setCreating] = useState(false);

  const [now, setNow] = useState("");
  useEffect(() => {
    setNow(new Date().toLocaleDateString("es-MX"));
  }, []);

  const totalRevenue = payments
    .filter((p) => p.status === "succeeded")
    .reduce((s, p) => s + p.amount, 0);

  const stripeTotal = payments
    .filter((p) => p.source === "stripe" && p.status === "succeeded")
    .reduce((s, p) => s + p.amount, 0);

  const creemTotal = payments
    .filter((p) => p.source === "creem" && p.status === "succeeded")
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--color-cream-100)", margin: 0 }}>
          Pagos
        </h1>
        <p style={{ fontSize: 13, color: "var(--color-cream-400)", marginTop: 4 }}>
          Stripe + Creem.io + Crypto — {now}
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <div className="panel" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: "var(--color-cream-400)" }}>Revenue Total</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-cream-100)", fontVariantNumeric: "tabular-nums" }}>
            ${totalRevenue.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: "var(--color-status-ok)" }}>Últimos 7 días</div>
        </div>
        <div className="panel" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: "var(--color-cream-400)" }}>Stripe</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#635bff", fontVariantNumeric: "tabular-nums" }}>
            ${stripeTotal.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: "var(--color-cream-400)" }}>{payments.filter(p => p.source === "stripe").length} transacciones</div>
        </div>
        <div className="panel" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: "var(--color-cream-400)" }}>Creem.io</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-gold-400)", fontVariantNumeric: "tabular-nums" }}>
            ${creemTotal.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: "var(--color-cream-400)" }}>{payments.filter(p => p.source === "creem").length} transacciones</div>
        </div>
        <div className="panel" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: "var(--color-cream-400)" }}>Checkout Links</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-cream-100)" }}>{links.length}</div>
          <div style={{ fontSize: 11, color: "var(--color-cream-400)" }}>{links.reduce((s, l) => s + l.conversions, 0)} conversiones</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--color-gold-600-20)" }}>
        {(["transactions", "links"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "10px 20px",
              fontSize: 13,
              fontWeight: tab === t ? 600 : 400,
              color: tab === t ? "var(--color-gold-400)" : "var(--color-cream-400)",
              backgroundColor: "transparent",
              border: "none",
              borderBottom: tab === t ? "2px solid var(--color-gold-400)" : "2px solid transparent",
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {t === "transactions" ? "Transacciones" : "Checkout Links"}
          </button>
        ))}
      </div>

      {/* Transactions Tab */}
      {tab === "transactions" && (
        <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table" style={{ width: "100%", minWidth: 700 }}>
              <thead>
                <tr>
                  <th style={{ padding: "10px 16px", textAlign: "left" }}>Fecha</th>
                  <th style={{ padding: "10px 16px", textAlign: "left" }}>Cliente</th>
                  <th style={{ padding: "10px 16px", textAlign: "left" }}>Descripción</th>
                  <th style={{ padding: "10px 16px", textAlign: "center" }}>Fuente</th>
                  <th style={{ padding: "10px 16px", textAlign: "right" }}>Monto</th>
                  <th style={{ padding: "10px 16px", textAlign: "center" }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td style={{ padding: "10px 16px", fontSize: 13, color: "var(--color-cream-400)", whiteSpace: "nowrap" }}>
                      {new Date(p.date).toLocaleDateString("es-MX", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td style={{ padding: "10px 16px", fontWeight: 500, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.customer}
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: 13, color: "var(--color-cream-200)" }}>{p.description}</td>
                    <td style={{ padding: "10px 16px", textAlign: "center" }}><SourceIcon source={p.source} /></td>
                    <td style={{ padding: "10px 16px", textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                      {p.currency === "USD" ? "$" : p.currency === "EUR" ? "€" : "$"}{p.amount.toLocaleString()}
                      <span style={{ fontSize: 11, color: "var(--color-cream-400)", marginLeft: 4 }}>{p.currency}</span>
                    </td>
                    <td style={{ padding: "10px 16px", textAlign: "center" }}><PaymentStatus status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Checkout Links Tab */}
      {tab === "links" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={() => setCreating(!creating)}
              style={{
                padding: "8px 20px",
                backgroundColor: "var(--color-gold-600)",
                color: "var(--color-charcoal-900)",
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              + Nuevo Link
            </button>
          </div>

          {creating && (
            <div className="panel" style={{ padding: 16, borderLeft: "3px solid var(--color-gold-400)" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-cream-100)", marginBottom: 12 }}>
                Crear Checkout Link
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-cream-400)", display: "block", marginBottom: 4 }}>Producto</label>
                  <input
                    type="text"
                    placeholder="Nombre del producto"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      backgroundColor: "var(--color-charcoal-800)",
                      border: "1px solid var(--color-gold-600-20)",
                      borderRadius: 8,
                      color: "var(--color-cream-100)",
                      fontSize: 13,
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-cream-400)", display: "block", marginBottom: 4 }}>Precio (USD)</label>
                  <input
                    type="number"
                    placeholder="49"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      backgroundColor: "var(--color-charcoal-800)",
                      border: "1px solid var(--color-gold-600-20)",
                      borderRadius: 8,
                      color: "var(--color-cream-100)",
                      fontSize: 13,
                    }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button style={{
                  padding: "8px 16px",
                  backgroundColor: "var(--color-gold-600)",
                  color: "var(--color-charcoal-900)",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}>
                  Crear via Creem.io
                </button>
                <button
                  onClick={() => setCreating(false)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "transparent",
                    color: "var(--color-cream-400)",
                    border: "1px solid var(--color-gold-600-20)",
                    borderRadius: 8,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
            <table className="data-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ padding: "10px 16px", textAlign: "left" }}>Producto</th>
                  <th style={{ padding: "10px 16px", textAlign: "center" }}>Fuente</th>
                  <th style={{ padding: "10px 16px", textAlign: "right" }}>Precio</th>
                  <th style={{ padding: "10px 16px", textAlign: "right" }}>Clicks</th>
                  <th style={{ padding: "10px 16px", textAlign: "right" }}>Conversiones</th>
                  <th style={{ padding: "10px 16px", textAlign: "right" }}>Tasa</th>
                </tr>
              </thead>
              <tbody>
                {links.map((l) => (
                  <tr key={l.id}>
                    <td style={{ padding: "10px 16px", fontWeight: 500 }}>{l.name}</td>
                    <td style={{ padding: "10px 16px", textAlign: "center" }}><SourceIcon source={l.source} /></td>
                    <td style={{ padding: "10px 16px", textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                      ${l.price}
                    </td>
                    <td style={{ padding: "10px 16px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{l.clicks}</td>
                    <td style={{ padding: "10px 16px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{l.conversions}</td>
                    <td style={{ padding: "10px 16px", textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--color-status-ok)" }}>
                      {l.clicks > 0 ? ((l.conversions / l.clicks) * 100).toFixed(1) : "0.0"}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
