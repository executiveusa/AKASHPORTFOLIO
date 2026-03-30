"use client";

import { useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PaymentStatus = "pending" | "approved" | "paid" | "failed";
type PaymentMethod = "cash" | "mercadopago" | "bank";

interface Payment {
  id: string;
  job_id: string;
  job_title: string;
  worker_id: string;
  worker_name: string;
  amount_mxn: number;
  method: PaymentMethod;
  status: PaymentStatus;
  verification_id: string;
  scheduled_date: string;
  paid_at?: string;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Seed data (replace with Supabase queries)
// ---------------------------------------------------------------------------

const SEED_PAYMENTS: Payment[] = [
  {
    id: "pay1",
    job_id: "j2",
    job_title: "Limpieza profunda — Oficina NW",
    worker_id: "w4",
    worker_name: "Lupita Torres",
    amount_mxn: 1800,
    method: "mercadopago",
    status: "approved",
    verification_id: "v3",
    scheduled_date: "2026-03-23",
  },
  {
    id: "pay2",
    job_id: "j1",
    job_title: "Pintura exterior — Casa Reyes",
    worker_id: "w1",
    worker_name: "Carlos Méndez",
    amount_mxn: 2400,
    method: "cash",
    status: "pending",
    verification_id: "v1",
    scheduled_date: "2026-03-24",
  },
  {
    id: "pay3",
    job_id: "j6",
    job_title: "Mantenimiento eléctrico",
    worker_id: "w3",
    worker_name: "Diego Vargas",
    amount_mxn: 3200,
    method: "bank",
    status: "paid",
    verification_id: "v5",
    scheduled_date: "2026-03-22",
    paid_at: "2026-03-22 16:30",
  },
  {
    id: "pay4",
    job_id: "j3",
    job_title: "Jardinería — Parque Comunitario",
    worker_id: "w2",
    worker_name: "Rosa Hernández",
    amount_mxn: 900,
    method: "mercadopago",
    status: "pending",
    verification_id: "v2",
    scheduled_date: "2026-03-24",
    notes: "Verificación de fotos necesita revisión manual antes de pagar.",
  },
];

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const STATUS_CFG: Record<PaymentStatus, { label: string; color: string; bg: string }> = {
  pending:  { label: "Pendiente",  color: "#f97316", bg: "rgba(249,115,22,0.1)" },
  approved: { label: "Aprobado",   color: "#818cf8", bg: "rgba(129,140,248,0.12)" },
  paid:     { label: "Pagado",     color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  failed:   { label: "Fallido",    color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

const METHOD_CFG: Record<PaymentMethod, { label: string; icon: string; color: string }> = {
  cash:        { label: "Efectivo",    icon: "💵", color: "#eab308" },
  mercadopago: { label: "MercadoPago", icon: "💳", color: "#009ee3" },
  bank:        { label: "Transferencia bancaria", icon: "🏦", color: "#818cf8" },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PayPage() {
  const [payments, setPayments] = useState<Payment[]>(SEED_PAYMENTS);
  const [filter, setFilter] = useState<PaymentStatus | "all">("all");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = filter === "all" ? payments : payments.filter(p => p.status === filter);
  const detail = selected ? payments.find(p => p.id === selected) : null;

  const totalPending = payments.filter(p => p.status === "pending").reduce((s, p) => s + p.amount_mxn, 0);
  const totalApproved = payments.filter(p => p.status === "approved").reduce((s, p) => s + p.amount_mxn, 0);
  const totalPaid = payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount_mxn, 0);

  function approvePayment(id: string) {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: "approved" as PaymentStatus } : p));
  }

  function markPaid(id: string) {
    const now = new Date().toLocaleString("es-MX", { timeZone: "America/Mexico_City", hour12: false, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: "paid" as PaymentStatus, paid_at: now } : p));
    setSelected(null);
  }

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1200 }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--color-cream-400)", margin: 0, letterSpacing: "-0.02em" }}>
          Ruteo de Pagos
        </h1>
        <p style={{ fontSize: 13, color: "var(--color-cream-600)", marginTop: 4 }}>
          Zero-touch payment routing · NW Kids Field Workers
        </p>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Pendiente de aprobar", value: `$${totalPending.toLocaleString("es-MX")}`, sub: `${payments.filter(p => p.status === "pending").length} pagos`, color: "#f97316" },
          { label: "Aprobado · listo pagar", value: `$${totalApproved.toLocaleString("es-MX")}`, sub: `${payments.filter(p => p.status === "approved").length} pagos`, color: "#818cf8" },
          { label: "Pagado esta semana", value: `$${totalPaid.toLocaleString("es-MX")}`, sub: `${payments.filter(p => p.status === "paid").length} completados`, color: "#22c55e" },
        ].map(k => (
          <div key={k.label} className="metric-card" style={{ padding: "20px 24px" }}>
            <div style={{ fontSize: 11, color: "var(--color-cream-400)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: k.color, lineHeight: 1, fontFamily: "var(--font-mono)" }}>{k.value}</div>
            <div style={{ fontSize: 12, color: "var(--color-cream-600)", marginTop: 6 }}>{k.sub} MXN</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["all", "pending", "approved", "paid", "failed"] as const).map(f => {
          const count = f === "all" ? payments.length : payments.filter(p => p.status === f).length;
          const cfg = STATUS_CFG[f as PaymentStatus];
          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "6px 14px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              border: "1px solid",
              cursor: "pointer",
              borderColor: filter === f ? (f === "all" ? "var(--color-gold-400)" : cfg.color) : "var(--color-charcoal-600)",
              color: filter === f ? (f === "all" ? "var(--color-gold-400)" : cfg.color) : "var(--color-cream-600)",
              background: filter === f ? (f === "all" ? "rgba(212,175,55,0.08)" : cfg.bg) : "transparent",
            }}>
              {f === "all" ? `Todos (${count})` : `${STATUS_CFG[f as PaymentStatus].label} (${count})`}
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: detail ? "1fr 360px" : "1fr", gap: 20 }}>

        {/* Payments table */}
        <div className="metric-card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-charcoal-600)" }}>
                {["Trabajador", "Trabajo", "Método", "Monto MXN", "Estado", "Fecha"].map(h => (
                  <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, color: "var(--color-cream-600)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((pay, i) => {
                const s = STATUS_CFG[pay.status];
                const m = METHOD_CFG[pay.method];
                const isActive = selected === pay.id;
                return (
                  <tr
                    key={pay.id}
                    onClick={() => setSelected(isActive ? null : pay.id)}
                    style={{
                      borderBottom: i < filtered.length - 1 ? "1px solid var(--color-charcoal-600)" : "none",
                      cursor: "pointer",
                      background: isActive ? "rgba(212,175,55,0.04)" : "transparent",
                    }}
                  >
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ fontSize: 13, color: "var(--color-cream-400)", fontWeight: 500 }}>{pay.worker_name}</div>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ fontSize: 13, color: "var(--color-cream-600)" }}>{pay.job_title}</div>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 14 }}>{m.icon}</span>
                        <span style={{ fontSize: 12, color: m.color }}>{m.label}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "var(--color-gold-400)", fontFamily: "var(--font-mono)" }}>
                        ${pay.amount_mxn.toLocaleString("es-MX")}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ fontSize: 11, fontWeight: 500, color: s.color, background: s.bg, padding: "3px 8px", borderRadius: 4 }}>
                        {s.label}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 12, color: "var(--color-cream-600)" }}>
                      {pay.paid_at ?? pay.scheduled_date}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Detail / action panel */}
        {detail && (
          <div className="metric-card" style={{ padding: 0, overflow: "hidden", alignSelf: "start" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-charcoal-600)", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-cream-400)" }}>Detalle del pago</span>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "var(--color-cream-600)", cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>
            <div style={{ padding: "20px" }}>

              {/* Worker + amount */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--color-gold-400)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>
                  ${detail.amount_mxn.toLocaleString("es-MX")} MXN
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-cream-400)" }}>{detail.worker_name}</div>
                <div style={{ fontSize: 12, color: "var(--color-cream-600)", marginTop: 2 }}>{detail.job_title}</div>
              </div>

              {/* Method detail */}
              <div style={{ padding: "12px 16px", background: "var(--color-charcoal-600)", borderRadius: 8, marginBottom: 16 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-cream-600)", marginBottom: 8 }}>
                  Método de pago
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{METHOD_CFG[detail.method].icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: METHOD_CFG[detail.method].color }}>
                    {METHOD_CFG[detail.method].label}
                  </span>
                </div>
                {detail.method === "cash" && (
                  <div style={{ fontSize: 12, color: "var(--color-cream-600)", marginTop: 8 }}>
                    Pago en efectivo — coordinado directamente con el supervisor NW Kids en campo.
                  </div>
                )}
                {detail.method === "mercadopago" && (
                  <div style={{ fontSize: 12, color: "var(--color-cream-600)", marginTop: 8 }}>
                    Enviar a cuenta MercadoPago registrada del trabajador.
                  </div>
                )}
                {detail.method === "bank" && (
                  <div style={{ fontSize: 12, color: "var(--color-cream-600)", marginTop: 8 }}>
                    Transferencia SPEI a cuenta bancaria verificada.
                  </div>
                )}
              </div>

              {detail.notes && (
                <div style={{ padding: "10px 14px", background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 6, marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: "#f97316" }}>{detail.notes}</div>
                </div>
              )}

              {/* CTA */}
              {detail.status === "pending" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button
                    onClick={() => approvePayment(detail.id)}
                    style={{ padding: "11px 16px", background: "rgba(129,140,248,0.12)", border: "1px solid #818cf844", borderRadius: 6, color: "#818cf8", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                  >
                    Aprobar para pago
                  </button>
                </div>
              )}
              {detail.status === "approved" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button
                    onClick={() => markPaid(detail.id)}
                    style={{ padding: "11px 16px", background: "rgba(34,197,94,0.12)", border: "1px solid #22c55e44", borderRadius: 6, color: "#22c55e", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                  >
                    Confirmar pago enviado
                  </button>
                </div>
              )}
              {detail.status === "paid" && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", background: "rgba(34,197,94,0.06)", border: "1px solid #22c55e22", borderRadius: 6 }}>
                  <span style={{ color: "#22c55e", fontSize: 16 }}>✓</span>
                  <div>
                    <div style={{ fontSize: 13, color: "#22c55e", fontWeight: 600 }}>Pago confirmado</div>
                    {detail.paid_at && <div style={{ fontSize: 11, color: "var(--color-cream-600)", marginTop: 2 }}>{detail.paid_at}</div>}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
