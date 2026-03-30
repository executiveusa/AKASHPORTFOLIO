"use client";

import { useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type WorkerStatus = "active" | "inactive" | "verified" | "suspended";
type Specialty =
  | "pintura"
  | "limpieza"
  | "jardinería"
  | "plomería"
  | "electricidad"
  | "carpintería"
  | "general";

interface Worker {
  id: string;
  name: string;
  phone: string;
  colonia: string;
  status: WorkerStatus;
  specialties: Specialty[];
  reliability_score: number;
  jobs_completed: number;
  jobs_disputed: number;
  volunteer_hours: number;
  avg_response_min: number;
  joined_date: string;
  last_active: string;
  payment_method: "cash" | "mercadopago" | "bank";
  verified_by: string;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const WORKERS: Worker[] = [
  {
    id: "w4",
    name: "Lupita Torres",
    phone: "+52 55 1234-5678",
    colonia: "Col. Tepito, CDMX",
    status: "verified",
    specialties: ["limpieza", "general"],
    reliability_score: 97,
    jobs_completed: 44,
    jobs_disputed: 0,
    volunteer_hours: 15,
    avg_response_min: 12,
    joined_date: "2025-06-10",
    last_active: "Hoy",
    payment_method: "mercadopago",
    verified_by: "Agent Zero Vision v2",
  },
  {
    id: "w1",
    name: "Carlos Méndez",
    phone: "+52 55 2345-6789",
    colonia: "Col. Guerrero, CDMX",
    status: "verified",
    specialties: ["pintura", "carpintería"],
    reliability_score: 94,
    jobs_completed: 31,
    jobs_disputed: 1,
    volunteer_hours: 9,
    avg_response_min: 18,
    joined_date: "2025-08-20",
    last_active: "Hoy",
    payment_method: "cash",
    verified_by: "Agent Zero Vision v2",
  },
  {
    id: "w3",
    name: "Diego Vargas",
    phone: "+52 55 3456-7890",
    colonia: "Col. Roma Norte, CDMX",
    status: "active",
    specialties: ["plomería", "electricidad"],
    reliability_score: 82,
    jobs_completed: 19,
    jobs_disputed: 2,
    volunteer_hours: 6,
    avg_response_min: 25,
    joined_date: "2025-11-05",
    last_active: "Ayer",
    payment_method: "bank",
    verified_by: "Ivette Marín",
  },
  {
    id: "w2",
    name: "Rosa Hernández",
    phone: "+52 55 4567-8901",
    colonia: "Col. Morelos, CDMX",
    status: "active",
    specialties: ["jardinería", "limpieza"],
    reliability_score: 78,
    jobs_completed: 12,
    jobs_disputed: 1,
    volunteer_hours: 3,
    avg_response_min: 31,
    joined_date: "2026-01-15",
    last_active: "2026-03-23",
    payment_method: "mercadopago",
    verified_by: "Agent Zero Vision v2",
    notes: "Verificación de fotos reciente requirió revisión manual.",
  },
  {
    id: "w5",
    name: "Fernando Castillo",
    phone: "+52 55 5678-9012",
    colonia: "Col. Peralvillo, CDMX",
    status: "inactive",
    specialties: ["general"],
    reliability_score: 55,
    jobs_completed: 5,
    jobs_disputed: 1,
    volunteer_hours: 0,
    avg_response_min: 90,
    joined_date: "2026-02-01",
    last_active: "2026-03-01",
    payment_method: "cash",
    verified_by: "Pendiente",
    notes: "Sin actividad reciente. Contactar para reactivar.",
  },
];

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const STATUS_CFG: Record<WorkerStatus, { label: string; color: string; bg: string }> = {
  active:    { label: "Activo",     color: "#818cf8", bg: "rgba(129,140,248,0.12)" },
  inactive:  { label: "Inactivo",   color: "#64748b", bg: "rgba(100,116,139,0.1)" },
  verified:  { label: "Verificado", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  suspended: { label: "Suspendido", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

const SPECIALTY_LABELS: Record<Specialty, string> = {
  pintura:      "Pintura",
  limpieza:     "Limpieza",
  jardinería:   "Jardinería",
  plomería:     "Plomería",
  electricidad: "Electricidad",
  carpintería:  "Carpintería",
  general:      "General",
};

function scoreColor(s: number) {
  if (s >= 90) return "#22c55e";
  if (s >= 70) return "#818cf8";
  if (s >= 50) return "#eab308";
  return "#ef4444";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DirectoryPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<WorkerStatus | "all">("all");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = WORKERS.filter(w => {
    const matchSearch = search === "" ||
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.colonia.toLowerCase().includes(search.toLowerCase()) ||
      w.specialties.some(s => SPECIALTY_LABELS[s].toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "all" || w.status === statusFilter;
    return matchSearch && matchStatus;
  }).sort((a, b) => b.reliability_score - a.reliability_score);

  const detail = selected ? WORKERS.find(w => w.id === selected) : null;

  const verified = WORKERS.filter(w => w.status === "verified").length;
  const active = WORKERS.filter(w => w.status === "active" || w.status === "verified").length;
  const avgScore = Math.round(WORKERS.reduce((s, w) => s + w.reliability_score, 0) / WORKERS.length);
  const totalVolHours = WORKERS.reduce((s, w) => s + w.volunteer_hours, 0);

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1300 }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--color-cream-400)", margin: 0, letterSpacing: "-0.02em" }}>
          Directorio Verificado
        </h1>
        <p style={{ fontSize: 13, color: "var(--color-cream-600)", marginTop: 4 }}>
          {WORKERS.length} trabajadores · {verified} verificados por Agent Zero Vision
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total trabajadores", value: WORKERS.length,         color: "var(--color-cream-400)" },
          { label: "Verificados",        value: verified,                color: "#22c55e" },
          { label: "Score promedio",     value: `${avgScore}%`,          color: scoreColor(avgScore) },
          { label: "Horas voluntario",   value: totalVolHours,           color: "#818cf8" },
        ].map(k => (
          <div key={k.label} className="metric-card" style={{ padding: "16px 20px" }}>
            <div style={{ fontSize: 11, color: "var(--color-cream-400)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: k.color, lineHeight: 1 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, colonia o especialidad..."
          style={{
            flex: 1,
            maxWidth: 340,
            padding: "8px 14px",
            background: "var(--color-charcoal-800)",
            border: "1px solid var(--color-charcoal-600)",
            borderRadius: 6,
            color: "var(--color-cream-400)",
            fontSize: 13,
            outline: "none",
          }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          {(["all", "verified", "active", "inactive", "suspended"] as const).map(f => {
            const cfg = STATUS_CFG[f as WorkerStatus];
            const count = f === "all" ? WORKERS.length : WORKERS.filter(w => w.status === f).length;
            return (
              <button key={f} onClick={() => setStatusFilter(f)} style={{
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
                border: "1px solid",
                cursor: "pointer",
                borderColor: statusFilter === f ? (f === "all" ? "var(--color-gold-400)" : cfg.color) : "var(--color-charcoal-600)",
                color: statusFilter === f ? (f === "all" ? "var(--color-gold-400)" : cfg.color) : "var(--color-cream-600)",
                background: statusFilter === f ? (f === "all" ? "rgba(212,175,55,0.08)" : cfg.bg) : "transparent",
              }}>
                {f === "all" ? `Todos (${count})` : `${STATUS_CFG[f as WorkerStatus].label} (${count})`}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: detail ? "1fr 360px" : "1fr", gap: 20 }}>

        {/* Worker grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(w => {
            const s = STATUS_CFG[w.status];
            const isActive = selected === w.id;
            return (
              <div
                key={w.id}
                onClick={() => setSelected(isActive ? null : w.id)}
                style={{
                  padding: "16px 20px",
                  background: isActive ? "rgba(212,175,55,0.04)" : "var(--color-charcoal-800)",
                  border: `1px solid ${isActive ? "var(--color-gold-400)44" : "var(--color-charcoal-600)"}`,
                  borderRadius: 8,
                  cursor: "pointer",
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  {/* Score ring */}
                  <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
                    <svg width="44" height="44" viewBox="0 0 44 44">
                      <circle cx="22" cy="22" r="18" fill="none" stroke="var(--color-charcoal-600)" strokeWidth="3" />
                      <circle
                        cx="22" cy="22" r="18"
                        fill="none"
                        stroke={scoreColor(w.reliability_score)}
                        strokeWidth="3"
                        strokeDasharray={`${(w.reliability_score / 100) * 113} 113`}
                        strokeLinecap="round"
                        transform="rotate(-90 22 22)"
                      />
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: scoreColor(w.reliability_score) }}>
                      {w.reliability_score}
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-cream-400)" }}>{w.name}</span>
                      <span style={{ fontSize: 10, color: s.color, background: s.bg, padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>
                        {s.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--color-cream-600)", marginBottom: 6 }}>{w.colonia}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {w.specialties.map(sp => (
                        <span key={sp} style={{ fontSize: 10, color: "var(--color-cream-600)", background: "var(--color-charcoal-600)", padding: "2px 8px", borderRadius: 4 }}>
                          {SPECIALTY_LABELS[sp]}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-cream-400)" }}>{w.jobs_completed} trabajos</div>
                  <div style={{ fontSize: 11, color: "var(--color-cream-600)", marginTop: 2 }}>{w.volunteer_hours}h voluntario</div>
                  <div style={{ fontSize: 11, color: "var(--color-cream-600)", marginTop: 1 }}>Activo: {w.last_active}</div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--color-cream-600)", fontSize: 13 }}>
              Sin resultados para &quot;{search}&quot;
            </div>
          )}
        </div>

        {/* Detail panel */}
        {detail && (
          <div className="metric-card" style={{ padding: 0, overflow: "hidden", alignSelf: "start" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-charcoal-600)", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-cream-400)" }}>Perfil del trabajador</span>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "var(--color-cream-600)", cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>
            <div style={{ padding: "20px" }}>

              {/* Name + status */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-cream-400)" }}>{detail.name}</div>
                  <span style={{ fontSize: 11, color: STATUS_CFG[detail.status].color, background: STATUS_CFG[detail.status].bg, padding: "3px 8px", borderRadius: 4, fontWeight: 600 }}>
                    {STATUS_CFG[detail.status].label}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "var(--color-cream-600)" }}>{detail.colonia}</div>
                <div style={{ fontSize: 13, color: "var(--color-cream-600)", marginTop: 2 }}>{detail.phone}</div>
              </div>

              {/* Score bar */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-cream-600)" }}>Score de confiabilidad</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: scoreColor(detail.reliability_score) }}>{detail.reliability_score}%</span>
                </div>
                <div style={{ height: 6, background: "var(--color-charcoal-600)", borderRadius: 3 }}>
                  <div style={{ width: `${detail.reliability_score}%`, height: "100%", background: scoreColor(detail.reliability_score), borderRadius: 3 }} />
                </div>
              </div>

              {/* Stats grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                {[
                  { label: "Trabajos completados", value: detail.jobs_completed },
                  { label: "Trabajos disputados", value: detail.jobs_disputed, warn: detail.jobs_disputed > 0 },
                  { label: "Horas voluntario", value: detail.volunteer_hours },
                  { label: "Resp. promedio (min)", value: detail.avg_response_min },
                ].map(st => (
                  <div key={st.label} style={{ padding: "10px 12px", background: "var(--color-charcoal-600)", borderRadius: 6 }}>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-cream-600)", marginBottom: 4 }}>{st.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: st.warn ? "#f97316" : "var(--color-cream-400)" }}>{st.value}</div>
                  </div>
                ))}
              </div>

              {/* Specialties */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-cream-600)", marginBottom: 8 }}>Especialidades</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {detail.specialties.map(sp => (
                    <span key={sp} style={{ fontSize: 12, color: "var(--color-cream-400)", background: "var(--color-charcoal-600)", padding: "4px 10px", borderRadius: 6 }}>
                      {SPECIALTY_LABELS[sp]}
                    </span>
                  ))}
                </div>
              </div>

              {/* Payment method */}
              <div style={{ marginBottom: 16, padding: "10px 14px", background: "var(--color-charcoal-600)", borderRadius: 6 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-cream-600)", marginBottom: 4 }}>Método de pago</div>
                <div style={{ fontSize: 13, color: "var(--color-cream-400)", fontWeight: 500 }}>
                  {detail.payment_method === "cash" ? "💵 Efectivo" : detail.payment_method === "mercadopago" ? "💳 MercadoPago" : "🏦 Transferencia bancaria"}
                </div>
              </div>

              {/* Verification */}
              <div style={{ fontSize: 11, color: "var(--color-cream-600)", marginBottom: detail.notes ? 12 : 0 }}>
                Verificado por: <span style={{ color: "var(--color-cream-400)", fontWeight: 500 }}>{detail.verified_by}</span>
                {" · "}Miembro desde: <span style={{ color: "var(--color-cream-400)" }}>{detail.joined_date}</span>
              </div>

              {detail.notes && (
                <div style={{ padding: "10px 14px", background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 6, marginTop: 12 }}>
                  <div style={{ fontSize: 12, color: "#f97316" }}>{detail.notes}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
