"use client";

import { useState, useEffect } from "react";

interface Webhook {
  id: string;
  name: string;
  url: string;
  source: "stripe" | "creem" | "supabase" | "github" | "custom";
  events: string[];
  status: "active" | "paused" | "error";
  lastFired?: string;
  successRate: number;
  totalFired: number;
}

interface WebhookEvent {
  id: string;
  webhookId: string;
  event: string;
  timestamp: string;
  status: "success" | "failed" | "retrying";
  responseCode: number;
  payload: string;
}

const demoWebhooks: Webhook[] = [
  { id: "wh_001", name: "Stripe Payment Events", url: "/api/creem", source: "stripe", events: ["payment_intent.succeeded", "invoice.paid", "customer.subscription.created"], status: "active", lastFired: "2025-06-15T14:22:00Z", successRate: 99.2, totalFired: 347 },
  { id: "wh_002", name: "Creem.io Checkout", url: "/api/creem", source: "creem", events: ["checkout.completed", "checkout.expired", "refund.created"], status: "active", lastFired: "2025-06-15T11:08:00Z", successRate: 100, totalFired: 89 },
  { id: "wh_003", name: "Supabase Auth Events", url: "/api/auth/webhook", source: "supabase", events: ["user.signed_up", "user.deleted"], status: "active", lastFired: "2025-06-15T08:00:00Z", successRate: 97.5, totalFired: 156 },
  { id: "wh_004", name: "GitHub Deploy Hooks", url: "/api/deploy/webhook", source: "github", events: ["push", "deployment_status"], status: "active", lastFired: "2025-06-14T22:00:00Z", successRate: 100, totalFired: 43 },
  { id: "wh_005", name: "Revenue Agent Scanner", url: "/api/revenue", source: "custom", events: ["scan.completed", "opportunity.found"], status: "active", lastFired: "2025-06-15T09:00:00Z", successRate: 95.0, totalFired: 180 },
  { id: "wh_006", name: "Old Postiz Integration", url: "https://old.api.postiz.io/hook", source: "custom", events: ["social.posted"], status: "error", lastFired: "2025-06-10T00:00:00Z", successRate: 12.5, totalFired: 8 },
];

const demoEvents: WebhookEvent[] = [
  { id: "evt_001", webhookId: "wh_001", event: "payment_intent.succeeded", timestamp: "2025-06-15T14:22:00Z", status: "success", responseCode: 200, payload: '{"amount":29900,"currency":"usd"}' },
  { id: "evt_002", webhookId: "wh_002", event: "checkout.completed", timestamp: "2025-06-15T11:08:00Z", status: "success", responseCode: 200, payload: '{"product":"AI Template Pack","amount":49}' },
  { id: "evt_003", webhookId: "wh_003", event: "user.signed_up", timestamp: "2025-06-15T08:00:00Z", status: "success", responseCode: 200, payload: '{"email":"new@user.com"}' },
  { id: "evt_004", webhookId: "wh_005", event: "scan.completed", timestamp: "2025-06-15T09:00:00Z", status: "success", responseCode: 200, payload: '{"markets_scanned":6,"opportunities":3}' },
  { id: "evt_005", webhookId: "wh_006", event: "social.posted", timestamp: "2025-06-10T00:00:00Z", status: "failed", responseCode: 502, payload: '{"error":"Connection refused"}' },
  { id: "evt_006", webhookId: "wh_001", event: "invoice.paid", timestamp: "2025-06-14T19:45:00Z", status: "success", responseCode: 200, payload: '{"invoice_id":"inv_abc","amount":199900}' },
];

function SourceBadge({ source }: { source: string }) {
  const colors: Record<string, string> = {
    stripe: "#635bff",
    creem: "var(--color-gold-400)",
    supabase: "#3ecf8e",
    github: "#f0f6fc",
    custom: "var(--color-cream-400)",
  };
  return (
    <span style={{
      padding: "2px 10px",
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 600,
      color: colors[source],
      border: `1px solid ${colors[source]}30`,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    }}>
      {source}
    </span>
  );
}

export default function WebhooksPage() {
  const [webhooks] = useState<Webhook[]>(demoWebhooks);
  const [events] = useState<WebhookEvent[]>(demoEvents);
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [now, setNow] = useState("");

  useEffect(() => { setNow(new Date().toLocaleDateString("es-MX")); }, []);

  const filteredEvents = selectedWebhook
    ? events.filter(e => e.webhookId === selectedWebhook)
    : events;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--color-cream-100)", margin: 0 }}>
            Webhooks
          </h1>
          <p style={{ fontSize: 13, color: "var(--color-cream-400)", marginTop: 4 }}>
            Gestión de integraciones — {webhooks.filter(w => w.status === "active").length} activos — {now}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
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
          + Nuevo Webhook
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="panel" style={{ padding: 16, borderLeft: "3px solid var(--color-gold-400)" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-cream-100)", marginBottom: 12 }}>Nuevo Webhook</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--color-cream-400)", display: "block", marginBottom: 4 }}>Nombre</label>
              <input type="text" placeholder="Mi Webhook" style={{
                width: "100%", padding: "8px 12px", backgroundColor: "var(--color-charcoal-800)",
                border: "1px solid var(--color-gold-600-20)", borderRadius: 8, color: "var(--color-cream-100)", fontSize: 13,
              }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--color-cream-400)", display: "block", marginBottom: 4 }}>URL</label>
              <input type="text" placeholder="https://..." style={{
                width: "100%", padding: "8px 12px", backgroundColor: "var(--color-charcoal-800)",
                border: "1px solid var(--color-gold-600-20)", borderRadius: 8, color: "var(--color-cream-100)", fontSize: 13,
              }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--color-cream-400)", display: "block", marginBottom: 4 }}>Fuente</label>
              <select style={{
                width: "100%", padding: "8px 12px", backgroundColor: "var(--color-charcoal-800)",
                border: "1px solid var(--color-gold-600-20)", borderRadius: 8, color: "var(--color-cream-100)", fontSize: 13,
              }}>
                <option value="stripe">Stripe</option>
                <option value="creem">Creem.io</option>
                <option value="supabase">Supabase</option>
                <option value="github">GitHub</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button style={{
              padding: "8px 16px", backgroundColor: "var(--color-gold-600)", color: "var(--color-charcoal-900)",
              border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>Crear</button>
            <button onClick={() => setShowCreate(false)} style={{
              padding: "8px 16px", backgroundColor: "transparent", color: "var(--color-cream-400)",
              border: "1px solid var(--color-gold-600-20)", borderRadius: 8, fontSize: 13, cursor: "pointer",
            }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Webhook List */}
      <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-gold-600-20)" }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-cream-100)", margin: 0 }}>Endpoints Registrados</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {webhooks.map((wh) => (
            <button
              key={wh.id}
              onClick={() => setSelectedWebhook(selectedWebhook === wh.id ? null : wh.id)}
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--color-gold-600-10)",
                display: "grid",
                gridTemplateColumns: "1fr auto auto auto",
                gap: 16,
                alignItems: "center",
                backgroundColor: selectedWebhook === wh.id ? "var(--color-charcoal-700)" : "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                color: "inherit",
                width: "100%",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%",
                    backgroundColor: wh.status === "active" ? "var(--color-status-ok)" : wh.status === "error" ? "var(--color-status-error)" : "var(--color-status-warn)",
                  }} />
                  <span style={{ fontWeight: 600, fontSize: 14, color: "var(--color-cream-100)" }}>{wh.name}</span>
                  <SourceBadge source={wh.source} />
                </div>
                <div style={{ fontSize: 12, color: "var(--color-cream-400)", marginLeft: 18 }}>
                  {wh.url} — {wh.events.length} eventos
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: wh.successRate >= 95 ? "var(--color-status-ok)" : wh.successRate >= 80 ? "var(--color-status-warn)" : "var(--color-status-error)" }}>
                  {wh.successRate}%
                </div>
                <div style={{ fontSize: 11, color: "var(--color-cream-400)" }}>tasa éxito</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-cream-100)" }}>{wh.totalFired}</div>
                <div style={{ fontSize: 11, color: "var(--color-cream-400)" }}>disparados</div>
              </div>
              <div style={{ textAlign: "right", minWidth: 80 }}>
                {wh.lastFired && (
                  <div style={{ fontSize: 12, color: "var(--color-cream-400)" }}>
                    {new Date(wh.lastFired).toLocaleDateString("es-MX", { month: "short", day: "numeric" })}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Events */}
      <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-gold-600-20)" }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-cream-100)", margin: 0 }}>
            Eventos Recientes{selectedWebhook ? ` — ${webhooks.find(w => w.id === selectedWebhook)?.name}` : ""}
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {filteredEvents.map((evt) => (
            <div key={evt.id} style={{
              padding: "10px 16px",
              borderBottom: "1px solid var(--color-gold-600-10)",
              display: "grid",
              gridTemplateColumns: "auto 1fr auto auto",
              gap: 12,
              alignItems: "center",
              fontSize: 13,
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                backgroundColor: evt.status === "success" ? "var(--color-status-ok)" : evt.status === "failed" ? "var(--color-status-error)" : "var(--color-status-warn)",
              }} />
              <div>
                <span style={{ fontWeight: 500, color: "var(--color-cream-100)" }}>{evt.event}</span>
                <span style={{ marginLeft: 8, fontSize: 12, color: "var(--color-cream-400)" }}>
                  {new Date(evt.timestamp).toLocaleString("es-MX", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <span style={{
                padding: "2px 8px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                color: evt.responseCode < 300 ? "var(--color-status-ok)" : "var(--color-status-error)",
                backgroundColor: evt.responseCode < 300 ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)",
              }}>
                {evt.responseCode}
              </span>
              <span style={{ fontSize: 12, color: "var(--color-cream-400)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {evt.payload}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
