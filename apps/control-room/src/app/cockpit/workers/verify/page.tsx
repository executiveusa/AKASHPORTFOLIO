"use client";

import { useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type VerificationStatus = "pending" | "approved" | "rejected" | "needs-review";

interface PhotoVerification {
  id: string;
  job_id: string;
  job_title: string;
  worker_name: string;
  phase_name: string;
  before_url: string;
  after_url: string;
  submitted_at: string;
  status: VerificationStatus;
  ai_confidence?: number;
  ai_notes?: string;
  reviewer_notes?: string;
  amount_mxn: number;
}

// ---------------------------------------------------------------------------
// Seed data (replace with Supabase + Agent Zero Vision)
// ---------------------------------------------------------------------------

const SEED_VERIFICATIONS: PhotoVerification[] = [
  {
    id: "v1",
    job_id: "j1",
    job_title: "Pintura exterior — Casa Reyes",
    worker_name: "Carlos Méndez",
    phase_name: "Segunda mano + acabado",
    before_url: "https://placehold.co/400x280/1e293b/475569?text=ANTES",
    after_url:  "https://placehold.co/400x280/1e293b/22c55e?text=DESPUÉS",
    submitted_at: "hace 2h",
    status: "pending",
    ai_confidence: 91,
    ai_notes: "Superficie limpia detectada. Cobertura estimada: 98%. Sin defectos visibles.",
    amount_mxn: 2400,
  },
  {
    id: "v2",
    job_id: "j3",
    job_title: "Jardinería — Parque Comunitario",
    worker_name: "Rosa Hernández",
    phase_name: "Poda de arbustos",
    before_url: "https://placehold.co/400x280/1e293b/475569?text=ANTES",
    after_url:  "https://placehold.co/400x280/1e293b/22c55e?text=DESPUÉS",
    submitted_at: "hace 4h",
    status: "needs-review",
    ai_confidence: 63,
    ai_notes: "Diferencia detectada pero área parcialmente fuera de cuadro. Revisión manual recomendada.",
    amount_mxn: 900,
  },
  {
    id: "v3",
    job_id: "j5",
    job_title: "Limpieza — Centro Comunitario",
    worker_name: "Lupita Torres",
    phase_name: "Sanitización baños",
    before_url: "https://placehold.co/400x280/1e293b/475569?text=ANTES",
    after_url:  "https://placehold.co/400x280/1e293b/22c55e?text=DESPUÉS",
    submitted_at: "hace 6h",
    status: "approved",
    ai_confidence: 97,
    ai_notes: "Limpieza profunda verificada. Cambio evidente en superficies.",
    amount_mxn: 1500,
  },
];

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const STATUS_CFG: Record<VerificationStatus, { label: string; color: string; bg: string }> = {
  pending:      { label: "Pendiente",      color: "#f97316", bg: "rgba(249,115,22,0.1)" },
  approved:     { label: "Aprobado",       color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  rejected:     { label: "Rechazado",      color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  "needs-review": { label: "Revisar",      color: "#eab308", bg: "rgba(234,179,8,0.1)" },
};

function confidenceColor(score: number) {
  if (score >= 85) return "#22c55e";
  if (score >= 60) return "#eab308";
  return "#ef4444";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function VerifyPage() {
  const [items, setItems] = useState<PhotoVerification[]>(SEED_VERIFICATIONS);
  const [selected, setSelected] = useState<string | null>(SEED_VERIFICATIONS[0]?.id ?? null);
  const [filter, setFilter] = useState<VerificationStatus | "all">("all");
  const [note, setNote] = useState("");

  const filtered = filter === "all" ? items : items.filter(v => v.status === filter);
  const detail = selected ? items.find(v => v.id === selected) : null;

  const pending = items.filter(v => v.status === "pending" || v.status === "needs-review").length;

  function updateStatus(id: string, status: VerificationStatus) {
    setItems(prev => prev.map(v => v.id === id ? { ...v, status, reviewer_notes: note || v.reviewer_notes } : v));
    setNote("");
    // After update, move to next pending
    const next = items.find(v => v.id !== id && (v.status === "pending" || v.status === "needs-review"));
    if (next) setSelected(next.id);
  }

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1300 }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--color-cream-400)", margin: 0, letterSpacing: "-0.02em" }}>
          Verificación de Fotos
        </h1>
        <p style={{ fontSize: 13, color: "var(--color-cream-600)", marginTop: 4 }}>
          Agent Zero Vision · {pending} foto{pending !== 1 ? "s" : ""} pendiente{pending !== 1 ? "s" : ""} de revisión
        </p>
      </div>

      {/* Stats bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        {(["all", "pending", "needs-review", "approved", "rejected"] as const).map(f => {
          const count = f === "all" ? items.length : items.filter(v => v.status === f).length;
          const cfg = f === "all" ? { color: "var(--color-cream-400)", bg: "transparent" } : STATUS_CFG[f as VerificationStatus];
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
              {f === "all" ? `Todos (${count})` : `${STATUS_CFG[f as VerificationStatus].label} (${count})`}
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>

        {/* Queue list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(v => {
            const s = STATUS_CFG[v.status];
            const isActive = selected === v.id;
            return (
              <div
                key={v.id}
                onClick={() => setSelected(v.id)}
                style={{
                  padding: "12px 16px",
                  borderRadius: 8,
                  background: isActive ? "rgba(212,175,55,0.06)" : "var(--color-charcoal-800)",
                  border: `1px solid ${isActive ? "var(--color-gold-400)44" : "var(--color-charcoal-600)"}`,
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-cream-400)", lineHeight: 1.3 }}>{v.job_title}</div>
                  <span style={{ fontSize: 10, color: s.color, background: s.bg, padding: "2px 6px", borderRadius: 4, flexShrink: 0, marginLeft: 8, fontWeight: 600 }}>
                    {s.label}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "var(--color-cream-600)" }}>{v.worker_name} · {v.phase_name}</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ fontSize: 11, color: "var(--color-cream-600)" }}>{v.submitted_at}</span>
                  {v.ai_confidence !== undefined && (
                    <span style={{ fontSize: 11, color: confidenceColor(v.ai_confidence), fontWeight: 600 }}>
                      IA {v.ai_confidence}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--color-cream-600)", fontSize: 13 }}>
              Sin verificaciones en esta categoría
            </div>
          )}
        </div>

        {/* Detail panel */}
        {detail ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Photo comparison */}
            <div className="metric-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--color-charcoal-600)" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-cream-400)" }}>{detail.job_title}</div>
                <div style={{ fontSize: 12, color: "var(--color-cream-600)", marginTop: 2 }}>
                  {detail.worker_name} · {detail.phase_name} · ${detail.amount_mxn.toLocaleString("es-MX")} MXN
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                <div style={{ padding: "16px 20px", borderRight: "1px solid var(--color-charcoal-600)" }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-cream-600)", marginBottom: 10 }}>
                    Antes
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={detail.before_url}
                    alt="Antes"
                    style={{ width: "100%", borderRadius: 6, display: "block" }}
                  />
                </div>
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "#22c55e", marginBottom: 10 }}>
                    Después
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={detail.after_url}
                    alt="Después"
                    style={{ width: "100%", borderRadius: 6, display: "block" }}
                  />
                </div>
              </div>
            </div>

            {/* AI analysis */}
            {detail.ai_confidence !== undefined && (
              <div className="metric-card" style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-cream-400)" }}>
                    Análisis Agent Zero Vision
                  </span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: confidenceColor(detail.ai_confidence), fontFamily: "var(--font-mono)" }}>
                    {detail.ai_confidence}%
                  </span>
                </div>
                <div style={{ height: 4, background: "var(--color-charcoal-600)", borderRadius: 2, marginBottom: 12 }}>
                  <div style={{
                    width: `${detail.ai_confidence}%`,
                    height: "100%",
                    background: confidenceColor(detail.ai_confidence),
                    borderRadius: 2,
                  }} />
                </div>
                <p style={{ fontSize: 13, color: "var(--color-cream-600)", margin: 0, lineHeight: 1.5 }}>
                  {detail.ai_notes}
                </p>
              </div>
            )}

            {/* Action panel */}
            {(detail.status === "pending" || detail.status === "needs-review") && (
              <div className="metric-card" style={{ padding: "16px 20px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-cream-400)", marginBottom: 12 }}>
                  Decisión del revisor
                </div>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Notas opcionales para el trabajador..."
                  style={{
                    width: "100%",
                    height: 72,
                    padding: "10px 12px",
                    background: "var(--color-charcoal-600)",
                    border: "1px solid var(--color-charcoal-600)",
                    borderRadius: 6,
                    color: "var(--color-cream-400)",
                    fontSize: 13,
                    resize: "none",
                    outline: "none",
                    marginBottom: 12,
                    boxSizing: "border-box",
                  }}
                />
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => updateStatus(detail.id, "approved")}
                    style={{
                      flex: 1,
                      padding: "10px 16px",
                      background: "rgba(34,197,94,0.12)",
                      border: "1px solid #22c55e44",
                      borderRadius: 6,
                      color: "#22c55e",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Aprobar trabajo
                  </button>
                  <button
                    onClick={() => updateStatus(detail.id, "rejected")}
                    style={{
                      flex: 1,
                      padding: "10px 16px",
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid #ef444444",
                      borderRadius: 6,
                      color: "#ef4444",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            )}

            {/* Already decided */}
            {(detail.status === "approved" || detail.status === "rejected") && (
              <div className="metric-card" style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{detail.status === "approved" ? "✓" : "✕"}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: STATUS_CFG[detail.status].color }}>
                      {detail.status === "approved" ? "Trabajo aprobado" : "Trabajo rechazado"}
                    </div>
                    {detail.reviewer_notes && (
                      <div style={{ fontSize: 12, color: "var(--color-cream-600)", marginTop: 2 }}>
                        {detail.reviewer_notes}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => updateStatus(detail.id, "pending")}
                    style={{ marginLeft: "auto", padding: "6px 12px", borderRadius: 6, fontSize: 11, border: "1px solid var(--color-charcoal-600)", background: "transparent", color: "var(--color-cream-600)", cursor: "pointer" }}
                  >
                    Revertir
                  </button>
                </div>
              </div>
            )}

          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-cream-600)", fontSize: 13 }}>
            Selecciona una verificación de la lista
          </div>
        )}
      </div>
    </div>
  );
}
