"use client";

import { useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type JobStatus = "pending" | "in-progress" | "awaiting-verification" | "completed" | "disputed";

interface JobPhase {
  id: string;
  name: string;
  status: "pending" | "in-progress" | "done";
  before_photo_url?: string;
  after_photo_url?: string;
  completed_at?: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  address: string;
  worker_id: string;
  worker_name: string;
  status: JobStatus;
  amount_mxn: number;
  phases: JobPhase[];
  created_at: string;
  updated_at: string;
  scheduled_date: string;
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const SEED_JOBS: Job[] = [
  {
    id: "j1",
    title: "Pintura exterior — Casa Reyes",
    description: "Pintura de fachada exterior, dos manos de pintura blanca mate.",
    address: "Calle Reforma 45, Col. Centro, CDMX",
    worker_id: "w1",
    worker_name: "Carlos Méndez",
    status: "awaiting-verification",
    amount_mxn: 2400,
    scheduled_date: "2026-03-23",
    created_at: "2026-03-22",
    updated_at: "2026-03-23",
    phases: [
      { id: "p1", name: "Preparación de superficie", status: "done", completed_at: "08:30" },
      { id: "p2", name: "Primera mano de pintura",  status: "done", completed_at: "11:00" },
      { id: "p3", name: "Segunda mano + acabado",   status: "done", completed_at: "14:30" },
    ],
  },
  {
    id: "j2",
    title: "Limpieza profunda — Oficina NW",
    description: "Limpieza general de oficinas comunitarias NW Kids.",
    address: "Av. Insurgentes Sur 120, Roma Norte",
    worker_id: "w4",
    worker_name: "Lupita Torres",
    status: "completed",
    amount_mxn: 1800,
    scheduled_date: "2026-03-23",
    created_at: "2026-03-23",
    updated_at: "2026-03-23",
    phases: [
      { id: "p4", name: "Limpieza áreas comunes", status: "done", completed_at: "09:00" },
      { id: "p5", name: "Sanitización baños",     status: "done", completed_at: "10:30" },
    ],
  },
  {
    id: "j3",
    title: "Jardinería — Parque Comunitario",
    description: "Poda, riego y mantenimiento general del área verde.",
    address: "Parque Tepito, Col. Morelos",
    worker_id: "w2",
    worker_name: "Rosa Hernández",
    status: "in-progress",
    amount_mxn: 900,
    scheduled_date: "2026-03-23",
    created_at: "2026-03-23",
    updated_at: "2026-03-23",
    phases: [
      { id: "p6", name: "Poda de arbustos",  status: "done",       completed_at: "07:00" },
      { id: "p7", name: "Recolección basura", status: "in-progress" },
      { id: "p8", name: "Riego final",        status: "pending" },
    ],
  },
  {
    id: "j4",
    title: "Reparación plomería — Taller",
    description: "Cambio de tubería en cocina del taller comunitario.",
    address: "Col. Roma Norte, CDMX",
    worker_id: "w3",
    worker_name: "Diego Vargas",
    status: "pending",
    amount_mxn: 1200,
    scheduled_date: "2026-03-24",
    created_at: "2026-03-23",
    updated_at: "2026-03-23",
    phases: [
      { id: "p9",  name: "Diagnóstico inicial",     status: "pending" },
      { id: "p10", name: "Cambio de tubería",        status: "pending" },
      { id: "p11", name: "Prueba de presión + cierre", status: "pending" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const JOB_STATUS: Record<JobStatus, { label: string; color: string; bg: string }> = {
  "pending":               { label: "Pendiente",   color: "#94a3b8", bg: "rgba(148,163,184,0.1)" },
  "in-progress":           { label: "En curso",    color: "#818cf8", bg: "rgba(129,140,248,0.12)" },
  "awaiting-verification": { label: "Verificando", color: "#f97316", bg: "rgba(249,115,22,0.1)" },
  "completed":             { label: "Completado",  color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  "disputed":              { label: "En disputa",  color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

const PHASE_STATUS_CFG = {
  pending:     { color: "#64748b", label: "Pendiente" },
  "in-progress": { color: "#818cf8", label: "En curso" },
  done:        { color: "#22c55e", label: "Listo" },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function JobsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<JobStatus | "all">("all");

  const filtered = filter === "all" ? SEED_JOBS : SEED_JOBS.filter(j => j.status === filter);
  const detail = selected ? SEED_JOBS.find(j => j.id === selected) : null;

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1200 }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--color-cream-400)", margin: 0, letterSpacing: "-0.02em" }}>
          Gestión de Trabajos
        </h1>
        <p style={{ fontSize: 13, color: "var(--color-cream-600)", marginTop: 4 }}>
          {SEED_JOBS.length} trabajos totales · {SEED_JOBS.filter(j => j.status === "in-progress").length} en campo ahora
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["all", "pending", "in-progress", "awaiting-verification", "completed", "disputed"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "6px 14px",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 500,
            border: "1px solid",
            cursor: "pointer",
            borderColor: filter === f ? "var(--color-gold-400)" : "var(--color-charcoal-600)",
            color: filter === f ? "var(--color-gold-400)" : "var(--color-cream-600)",
            background: filter === f ? "rgba(212,175,55,0.08)" : "transparent",
          }}>
            {f === "all" ? "Todos" : JOB_STATUS[f as JobStatus].label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: detail ? "1fr 380px" : "1fr", gap: 20 }}>

        {/* Jobs table */}
        <div className="metric-card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-charcoal-600)" }}>
                {["Trabajo", "Trabajador", "Fecha", "Fases", "Estado", "Monto"].map(h => (
                  <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, color: "var(--color-cream-600)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((job, i) => {
                const s = JOB_STATUS[job.status];
                const done = job.phases.filter(p => p.status === "done").length;
                const isSelected = selected === job.id;
                return (
                  <tr
                    key={job.id}
                    onClick={() => setSelected(isSelected ? null : job.id)}
                    style={{
                      borderBottom: i < filtered.length - 1 ? "1px solid var(--color-charcoal-600)" : "none",
                      cursor: "pointer",
                      background: isSelected ? "rgba(212,175,55,0.05)" : "transparent",
                    }}
                  >
                    <td style={{ padding: "12px 20px" }}>
                      <div style={{ fontSize: 13, color: "var(--color-cream-400)", fontWeight: 500 }}>{job.title}</div>
                      <div style={{ fontSize: 11, color: "var(--color-cream-600)", marginTop: 2 }}>{job.address}</div>
                    </td>
                    <td style={{ padding: "12px 20px", fontSize: 13, color: "var(--color-cream-600)" }}>{job.worker_name}</td>
                    <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--color-cream-600)" }}>{job.scheduled_date}</td>
                    <td style={{ padding: "12px 20px" }}>
                      <div style={{ fontSize: 12, color: "var(--color-cream-600)" }}>{done}/{job.phases.length}</div>
                      <div style={{ marginTop: 4, height: 3, width: 60, background: "var(--color-charcoal-600)", borderRadius: 2 }}>
                        <div style={{ width: `${(done / job.phases.length) * 100}%`, height: "100%", background: "#818cf8", borderRadius: 2 }} />
                      </div>
                    </td>
                    <td style={{ padding: "12px 20px" }}>
                      <span style={{ fontSize: 11, fontWeight: 500, color: s.color, background: s.bg, padding: "3px 8px", borderRadius: 4 }}>
                        {s.label}
                      </span>
                    </td>
                    <td style={{ padding: "12px 20px", fontSize: 13, color: "var(--color-cream-400)", fontWeight: 600 }}>
                      ${job.amount_mxn.toLocaleString("es-MX")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        {detail && (
          <div className="metric-card" style={{ padding: 0, overflow: "hidden", alignSelf: "start" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-charcoal-600)", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-cream-400)" }}>Detalle del trabajo</span>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "var(--color-cream-600)", cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>
            <div style={{ padding: "20px" }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-cream-400)", marginBottom: 4 }}>{detail.title}</div>
              <div style={{ fontSize: 12, color: "var(--color-cream-600)", marginBottom: 16 }}>{detail.description}</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-cream-600)", marginBottom: 4 }}>Trabajador</div>
                  <div style={{ fontSize: 13, color: "var(--color-cream-400)", fontWeight: 500 }}>{detail.worker_name}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-cream-600)", marginBottom: 4 }}>Pago</div>
                  <div style={{ fontSize: 13, color: "var(--color-gold-400)", fontWeight: 700 }}>${detail.amount_mxn.toLocaleString("es-MX")} MXN</div>
                </div>
                <div style={{ gridColumn: "1/-1" }}>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-cream-600)", marginBottom: 4 }}>Dirección</div>
                  <div style={{ fontSize: 12, color: "var(--color-cream-400)" }}>{detail.address}</div>
                </div>
              </div>

              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-cream-600)", marginBottom: 12 }}>Fases del trabajo</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {detail.phases.map(phase => {
                  const ps = PHASE_STATUS_CFG[phase.status];
                  return (
                    <div key={phase.id} style={{ padding: "10px 14px", background: "var(--color-charcoal-600)", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 12, color: "var(--color-cream-400)", fontWeight: 500 }}>{phase.name}</div>
                        {phase.completed_at && <div style={{ fontSize: 11, color: "var(--color-cream-600)", marginTop: 2 }}>Completado: {phase.completed_at}</div>}
                      </div>
                      <span style={{ fontSize: 11, color: ps.color, fontWeight: 600 }}>{ps.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
