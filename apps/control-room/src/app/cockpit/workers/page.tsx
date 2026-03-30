"use client";

import Link from "next/link";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type WorkerStatus = "active" | "inactive" | "verified" | "suspended";
type JobStatus    = "pending" | "in-progress" | "awaiting-verification" | "completed" | "disputed";
type PaymentStatus = "pending" | "approved" | "paid" | "failed";

interface WorkerSummary {
  id: string;
  name: string;
  status: WorkerStatus;
  reliability_score: number;
  jobs_completed: number;
  volunteer_hours: number;
}

interface JobSummary {
  id: string;
  title: string;
  worker_name: string;
  status: JobStatus;
  amount_mxn: number;
  address: string;
  updated_at: string;
}

interface PaymentSummary {
  id: string;
  worker_name: string;
  amount_mxn: number;
  method: "cash" | "mercadopago" | "bank";
  status: PaymentStatus;
  job_title: string;
}

// ---------------------------------------------------------------------------
// Seed data (replace with Supabase queries)
// ---------------------------------------------------------------------------

const ACTIVE_WORKERS: WorkerSummary[] = [
  { id: "w1", name: "Carlos Méndez",  status: "verified",  reliability_score: 94, jobs_completed: 31, volunteer_hours: 9 },
  { id: "w2", name: "Rosa Hernández", status: "active",    reliability_score: 78, jobs_completed: 12, volunteer_hours: 3 },
  { id: "w3", name: "Diego Vargas",   status: "active",    reliability_score: 82, jobs_completed: 19, volunteer_hours: 6 },
  { id: "w4", name: "Lupita Torres",  status: "verified",  reliability_score: 97, jobs_completed: 44, volunteer_hours: 15 },
];

const RECENT_JOBS: JobSummary[] = [
  { id: "j1", title: "Pintura exterior — Casa Reyes",   worker_name: "Carlos Méndez",  status: "awaiting-verification", amount_mxn: 2400, address: "Calle Reforma 45, CDMX", updated_at: "hace 2h" },
  { id: "j2", title: "Limpieza profunda — Oficina NW",  worker_name: "Lupita Torres",   status: "completed",             amount_mxn: 1800, address: "Av. Insurgentes 120",    updated_at: "hace 5h" },
  { id: "j3", title: "Jardinería — Parque Comunitario", worker_name: "Rosa Hernández",  status: "in-progress",           amount_mxn: 900,  address: "Parque Tepito, CDMX",    updated_at: "hace 30m" },
  { id: "j4", title: "Reparación plomería",             worker_name: "Diego Vargas",    status: "pending",               amount_mxn: 1200, address: "Col. Roma Norte",        updated_at: "hace 1h" },
];

const PENDING_PAYMENTS: PaymentSummary[] = [
  { id: "p1", worker_name: "Lupita Torres",  amount_mxn: 1800, method: "mercadopago", status: "approved", job_title: "Limpieza profunda" },
  { id: "p2", worker_name: "Carlos Méndez", amount_mxn: 2400, method: "cash",        status: "pending",  job_title: "Pintura exterior" },
];

// ---------------------------------------------------------------------------
// Status configs
// ---------------------------------------------------------------------------

const JOB_STATUS: Record<JobStatus, { label: string; color: string; bg: string }> = {
  "pending":               { label: "Pendiente",        color: "#94a3b8", bg: "rgba(148,163,184,0.1)" },
  "in-progress":           { label: "En curso",         color: "#818cf8", bg: "rgba(129,140,248,0.12)" },
  "awaiting-verification": { label: "Verificando",      color: "#f97316", bg: "rgba(249,115,22,0.1)" },
  "completed":             { label: "Completado",       color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  "disputed":              { label: "En disputa",       color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

const WORKER_STATUS: Record<WorkerStatus, { label: string; color: string }> = {
  "active":    { label: "Activo",     color: "#818cf8" },
  "inactive":  { label: "Inactivo",   color: "#64748b" },
  "verified":  { label: "Verificado", color: "#22c55e" },
  "suspended": { label: "Suspendido", color: "#ef4444" },
};

const PAY_METHOD: Record<string, string> = {
  cash: "Efectivo", mercadopago: "MercadoPago", bank: "Banco",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function WorkersDashboard() {
  const activeCount  = ACTIVE_WORKERS.filter(w => w.status !== "suspended" && w.status !== "inactive").length;
  const verifiedCount = ACTIVE_WORKERS.filter(w => w.status === "verified").length;
  const onSiteCount  = RECENT_JOBS.filter(j => j.status === "in-progress").length;
  const pendingPayMxn = PENDING_PAYMENTS.filter(p => p.status === "pending" || p.status === "approved")
    .reduce((sum, p) => sum + p.amount_mxn, 0);

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1100 }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--color-cream-400)", margin: 0, letterSpacing: "-0.02em" }}>
          El Panorama — Trabajadores NW Kids
        </h1>
        <p style={{ fontSize: 13, color: "var(--color-cream-600)", marginTop: 4 }}>
          Sistema de gestión de campo · Zero-touch verification
        </p>
      </div>

      {/* Metric row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Trabajadores activos", value: activeCount,          sub: `${verifiedCount} verificados` },
          { label: "En campo ahora",       value: onSiteCount,           sub: "trabajos en curso" },
          { label: "Pendiente de pago",    value: `$${pendingPayMxn.toLocaleString("es-MX")}`, sub: "MXN esta semana" },
          { label: "Promedio confiabilidad", value: `${Math.round(ACTIVE_WORKERS.reduce((s,w) => s + w.reliability_score, 0) / ACTIVE_WORKERS.length)}`, sub: "score global" },
        ].map(m => (
          <div key={m.label} className="metric-card" style={{ padding: "20px 24px" }}>
            <div style={{ fontSize: 11, color: "var(--color-cream-400)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
              {m.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--color-gold-400)", lineHeight: 1 }}>
              {m.value}
            </div>
            <div style={{ fontSize: 12, color: "var(--color-cream-600)", marginTop: 6 }}>
              {m.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Two-column: jobs + workers */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, marginBottom: 24 }}>

        {/* Recent jobs */}
        <div className="metric-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-charcoal-600)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-cream-400)" }}>Trabajos recientes</span>
            <Link href="/cockpit/workers/jobs" style={{ fontSize: 12, color: "var(--color-gold-400)", textDecoration: "none" }}>
              Ver todos →
            </Link>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-charcoal-600)" }}>
                {["Trabajo", "Trabajador", "Estado", "Monto"].map(h => (
                  <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, color: "var(--color-cream-600)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_JOBS.map((job, i) => {
                const s = JOB_STATUS[job.status];
                return (
                  <tr key={job.id} style={{ borderBottom: i < RECENT_JOBS.length - 1 ? "1px solid var(--color-charcoal-600)" : "none" }}>
                    <td style={{ padding: "12px 20px" }}>
                      <div style={{ fontSize: 13, color: "var(--color-cream-400)", fontWeight: 500 }}>{job.title}</div>
                      <div style={{ fontSize: 11, color: "var(--color-cream-600)", marginTop: 2 }}>{job.address}</div>
                    </td>
                    <td style={{ padding: "12px 20px", fontSize: 13, color: "var(--color-cream-600)" }}>{job.worker_name}</td>
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

        {/* Workers sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Quick actions */}
          <div className="metric-card" style={{ padding: "16px 20px" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-cream-400)", marginBottom: 12 }}>Acciones rápidas</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { href: "/cockpit/workers/verify", label: "Verificar fotos pendientes", accent: "#f97316" },
                { href: "/cockpit/workers/pay",    label: "Aprobar pagos",              accent: "#22c55e" },
                { href: "/cockpit/workers/jobs",   label: "Crear nuevo trabajo",        accent: "#818cf8" },
              ].map(a => (
                <Link key={a.href} href={a.href} style={{
                  display: "block",
                  padding: "10px 14px",
                  background: "var(--color-charcoal-600)",
                  borderRadius: 8,
                  fontSize: 13,
                  color: a.accent,
                  textDecoration: "none",
                  fontWeight: 500,
                  border: `1px solid ${a.accent}22`,
                }}>
                  {a.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Workers list */}
          <div className="metric-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-charcoal-600)", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-cream-400)" }}>Equipo activo</span>
              <Link href="/cockpit/workers/directory" style={{ fontSize: 12, color: "var(--color-gold-400)", textDecoration: "none" }}>Directorio →</Link>
            </div>
            {ACTIVE_WORKERS.map((w, i) => {
              const ws = WORKER_STATUS[w.status];
              return (
                <div key={w.id} style={{ padding: "12px 16px", borderBottom: i < ACTIVE_WORKERS.length - 1 ? "1px solid var(--color-charcoal-600)" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-cream-400)" }}>{w.name}</div>
                      <div style={{ fontSize: 11, color: "var(--color-cream-600)", marginTop: 2 }}>{w.jobs_completed} trabajos · {w.volunteer_hours}h voluntario</div>
                    </div>
                    <span style={{ fontSize: 11, color: ws.color, fontWeight: 600 }}>{w.reliability_score}</span>
                  </div>
                  <div style={{ marginTop: 6, height: 2, background: "var(--color-charcoal-600)", borderRadius: 1 }}>
                    <div style={{ width: `${w.reliability_score}%`, height: "100%", background: w.reliability_score >= 90 ? "#22c55e" : w.reliability_score >= 70 ? "#818cf8" : "#f97316", borderRadius: 1 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pending payments bar */}
      {PENDING_PAYMENTS.length > 0 && (
        <div className="metric-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--color-charcoal-600)", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-cream-400)" }}>Pagos pendientes de aprobación</span>
            <Link href="/cockpit/workers/pay" style={{ fontSize: 12, color: "#22c55e", textDecoration: "none" }}>Aprobar pagos →</Link>
          </div>
          <div style={{ display: "flex", gap: 0 }}>
            {PENDING_PAYMENTS.map((pay, i) => (
              <div key={pay.id} style={{ flex: 1, padding: "14px 20px", borderRight: i < PENDING_PAYMENTS.length - 1 ? "1px solid var(--color-charcoal-600)" : "none" }}>
                <div style={{ fontSize: 12, color: "var(--color-cream-600)" }}>{pay.worker_name} · {PAY_METHOD[pay.method]}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-gold-400)", margin: "4px 0" }}>
                  ${pay.amount_mxn.toLocaleString("es-MX")} <span style={{ fontSize: 12, fontWeight: 400, color: "var(--color-cream-600)" }}>MXN</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--color-cream-600)" }}>{pay.job_title}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
