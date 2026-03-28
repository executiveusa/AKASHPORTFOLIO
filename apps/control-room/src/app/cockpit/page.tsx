"use client";

import { useEffect, useState } from "react";
import HeraldToolLibrary from "@/components/HeraldToolLibrary";

interface SwarmData {
  agents: Array<{ id: string; name: string; status: string; role: string; color: string; lastAction?: string }>;
  systemHealth: number;
  activeMeetings: number;
  alertCount: number;
}

interface RevenueData {
  todayUsd: number;
  monthUsd: number;
  sources: Array<{ name: string; amount: number; currency: string }>;
  streak: number;
}

const SPHERES = [
  { id: "synthia", name: "SYNTHIA", role: "Coordinadora General", color: "#8b5cf6", hz: 0.85 },
  { id: "alex", name: "ALEX", role: "Estratega Ejecutivo", color: "#d4af37", hz: 0.8 },
  { id: "cazadora", name: "CAZADORA", role: "Cazadora de Oportunidades", color: "#ef4444", hz: 0.95 },
  { id: "forjadora", name: "FORJADORA", role: "Arquitecta de Sistemas", color: "#22c55e", hz: 0.45 },
  { id: "seductora", name: "SEDUCTORA", role: "Closera Maestra", color: "#eab308", hz: 0.65 },
  { id: "consejo", name: "CONSEJO", role: "Consejero Mayor", color: "#1d4ed8", hz: 0.25 },
  { id: "dr-economia", name: "DR. ECONOMÍA", role: "Analista Financiero", color: "#f97316", hz: 0.75 },
  { id: "dra-cultura", name: "DRA. CULTURA", role: "Estratega Cultural", color: "#f43f5e", hz: 0.55 },
  { id: "ing-teknos", name: "ING. TEKNOS", role: "Ingeniero de Sistemas", color: "#06b6d4", hz: 0.35 },
];

function MetricCard({ label, value, sub, status }: { label: string; value: string; sub?: string; status?: "ok" | "warn" | "error" }) {
  const borderColor = status === "error" ? "var(--status-error)" : status === "warn" ? "var(--status-warn)" : "var(--color-charcoal-600)";
  return (
    <div className="metric-card" style={{ borderLeftWidth: 3, borderLeftColor: borderColor }}>
      <div style={{ fontSize: 11, color: "var(--color-cream-600)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 600, color: "var(--color-cream-100)" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--color-cream-400)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function AgentRow({ agent }: { agent: typeof SPHERES[0] & { status?: string; lastAction?: string } }) {
  return (
    <tr>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: agent.color, flexShrink: 0 }} />
          <span style={{ fontWeight: 500, color: "var(--color-cream-100)" }}>{agent.name}</span>
        </div>
      </td>
      <td style={{ color: "var(--color-cream-400)", fontSize: 13 }}>{agent.role}</td>
      <td>
        <span style={{
          fontSize: 11,
          padding: "2px 8px",
          borderRadius: 4,
          background: agent.status === "active" ? "rgba(34,197,94,0.15)" : "rgba(234,179,8,0.15)",
          color: agent.status === "active" ? "var(--status-ok)" : "var(--status-warn)",
        }}>
          {agent.status === "active" ? "activo" : "standby"}
        </span>
      </td>
      <td style={{ color: "var(--color-cream-600)", fontSize: 12 }}>
        {agent.lastAction || "Esperando tarea..."}
      </td>
    </tr>
  );
}

function RecentActivity() {
  const activities = [
    { time: "14:32", agent: "CAZADORA", action: "Prospect scan completado — 3 leads encontrados", color: "#ef4444" },
    { time: "14:15", agent: "DR. ECONOMÍA", action: "Arbitraje MXN/USD gap: 0.3% — below threshold", color: "#f97316" },
    { time: "13:58", agent: "SYNTHIA", action: "Daily standup finalizado — 7 tareas asignadas", color: "#8b5cf6" },
    { time: "13:45", agent: "DRA. CULTURA", action: "Blog post generado — 'IA para PyMEs en CDMX'", color: "#f43f5e" },
    { time: "13:30", agent: "ING. TEKNOS", action: "Health check pasado — 9/9 servicios OK", color: "#06b6d4" },
    { time: "13:12", agent: "SEDUCTORA", action: "Propuesta enviada — Restaurante La Capital $2,400/mo", color: "#eab308" },
    { time: "12:55", agent: "FORJADORA", action: "Pipeline CI/CD actualizado — deploy v3.0.1", color: "#22c55e" },
  ];

  return (
    <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-charcoal-600)" }}>
        <h3 style={{ fontSize: 14, fontWeight: 500, color: "var(--color-cream-100)", margin: 0 }}>Actividad Reciente</h3>
      </div>
      <div style={{ maxHeight: 320, overflowY: "auto" }}>
        {activities.map((a, i) => (
          <div key={i} style={{ padding: "10px 16px", borderBottom: "1px solid var(--color-charcoal-700)", display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 11, color: "var(--color-cream-600)", minWidth: 36, paddingTop: 2 }}>{a.time}</span>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: a.color, marginTop: 6, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: a.color }}>{a.agent}</span>
              <span style={{ fontSize: 13, color: "var(--color-cream-200)", marginLeft: 6 }}>{a.action}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RevenueWidget() {
  return (
    <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-charcoal-600)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: 14, fontWeight: 500, color: "var(--color-cream-100)", margin: 0 }}>Revenue Agent</h3>
        <span style={{ fontSize: 11, color: "var(--status-ok)" }}>● Activo</span>
      </div>
      <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--color-cream-600)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Hoy</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: "var(--status-ok)" }}>$147.00</div>
          <div style={{ fontSize: 11, color: "var(--color-cream-400)" }}>USD</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "var(--color-cream-600)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Este Mes</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: "var(--color-gold-400)" }}>$2,340.00</div>
          <div style={{ fontSize: 11, color: "var(--color-cream-400)" }}>USD</div>
        </div>
      </div>
      <div style={{ padding: "0 16px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          { label: "Stripe", amount: "$1,200", pct: 51 },
          { label: "Creem.io", amount: "$840", pct: 36 },
          { label: "Crypto (DIS)", amount: "$300", pct: 13 },
        ].map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "var(--color-cream-400)", minWidth: 60 }}>{s.label}</span>
            <div style={{ flex: 1, height: 4, background: "var(--color-charcoal-600)", borderRadius: 2 }}>
              <div style={{ width: `${s.pct}%`, height: "100%", background: "var(--color-gold-500)", borderRadius: 2 }} />
            </div>
            <span style={{ fontSize: 12, color: "var(--color-cream-200)", minWidth: 50, textAlign: "right" }}>{s.amount}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: "8px 16px 12px", borderTop: "1px solid var(--color-charcoal-700)" }}>
        <div style={{ fontSize: 11, color: "var(--color-cream-600)" }}>Mercados activos</div>
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          {["🇲🇽 MXN", "🇺🇸 USD", "🇪🇸 EUR", "🇵🇷 USD"].map((m) => (
            <span key={m} style={{ fontSize: 11, color: "var(--color-cream-400)", padding: "2px 6px", background: "var(--color-charcoal-600)", borderRadius: 4 }}>
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CockpitOverview() {
  const [swarmData, setSwarmData] = useState<SwarmData | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadSwarm() {
      try {
        console.warn('[TODO] migrate: /api/swarm');
      } catch { /* silent fallback */ }
    }
    loadSwarm();
    const interval = setInterval(loadSwarm, 15000);
    return () => clearInterval(interval);
  }, []);

  const agentsWithStatus = SPHERES.map((s) => ({
    ...s,
    status: "active" as const,
    lastAction: swarmData?.agents?.find((a) => a.id === s.id)?.lastAction,
  }));

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--color-cream-100)", margin: 0 }}>
          Vista General
        </h1>
        <p style={{ fontSize: 13, color: "var(--color-cream-400)", margin: "4px 0 0" }}>
          Estado operativo del sistema · {now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })} CDMX
        </p>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
        <MetricCard label="Agentes Activos" value="9 / 9" sub="+ La Vigilante" status="ok" />
        <MetricCard label="Salud del Sistema" value="98%" sub="Todos los servicios OK" status="ok" />
        <MetricCard label="Revenue Hoy" value="$147" sub="+23% vs ayer" status="ok" />
        <MetricCard label="Alertas Activas" value="0" sub="Sin incidentes" status="ok" />
        <MetricCard label="Reuniones Hoy" value="2" sub="Standup + estrategia" />
        <MetricCard label="Tareas Pendientes" value="4" sub="3 en progreso" />
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }} className="max-md:!grid-cols-1">
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Agent fleet table */}
          <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-charcoal-600)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 14, fontWeight: 500, color: "var(--color-cream-100)", margin: 0 }}>Flota de Agentes</h3>
              <span style={{ fontSize: 11, color: "var(--color-cream-600)" }}>9 esferas + 1 guardián</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Agente</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Última Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {agentsWithStatus.map((a) => (
                    <AgentRow key={a.id} agent={a} />
                  ))}
                  <tr>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#64748b" }} />
                        <span style={{ fontWeight: 500, color: "var(--color-cream-100)" }}>LA VIGILANTE</span>
                      </div>
                    </td>
                    <td style={{ color: "var(--color-cream-400)", fontSize: 13 }}>Guardián del Consejo</td>
                    <td>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "rgba(34,197,94,0.15)", color: "var(--status-ok)" }}>
                        vigilando
                      </span>
                    </td>
                    <td style={{ color: "var(--color-cream-600)", fontSize: 12 }}>Monitoreando cumplimiento ZTE</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity feed */}
          <RecentActivity />
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <RevenueWidget />

          {/* Quick actions */}
          <div className="panel" style={{ padding: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 500, color: "var(--color-cream-100)", margin: "0 0 12px" }}>Acciones Rápidas</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Iniciar Reunión del Consejo", action: "/cockpit/spheres" },
                { label: "Ver Teatro 3D", action: "/cockpit/theater" },
                { label: "Crear Checkout Link", action: "/cockpit/payments" },
                { label: "Generar Reporte", action: "/cockpit/revenue" },
              ].map((qa) => (
                <a
                  key={qa.label}
                  href={qa.action}
                  style={{
                    display: "block",
                    padding: "8px 12px",
                    fontSize: 13,
                    color: "var(--color-cream-200)",
                    background: "var(--color-charcoal-700)",
                    border: "1px solid var(--color-charcoal-600)",
                    borderRadius: 6,
                    textDecoration: "none",
                    transition: "border-color 150ms ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-gold-600)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-charcoal-600)")}
                >
                  {qa.label}
                </a>
              ))}
            </div>
          </div>

          {/* Markets */}
          <div className="panel" style={{ padding: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 500, color: "var(--color-cream-100)", margin: "0 0 12px" }}>Mercados Objetivo</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { flag: "🇲🇽", country: "México", currency: "MXN + Crypto DIS", status: "active" },
                { flag: "🇪🇸", country: "España", currency: "EUR", status: "active" },
                { flag: "🇵🇷", country: "Puerto Rico", currency: "USD", status: "active" },
                { flag: "🇨🇴", country: "Colombia", currency: "COP", status: "scanning" },
                { flag: "🇦🇷", country: "Argentina", currency: "ARS + USDT", status: "scanning" },
                { flag: "🇨🇱", country: "Chile", currency: "CLP", status: "queued" },
              ].map((m) => (
                <div key={m.country} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                  <span style={{ fontSize: 16 }}>{m.flag}</span>
                  <span style={{ flex: 1, color: "var(--color-cream-200)" }}>{m.country}</span>
                  <span style={{ fontSize: 11, color: "var(--color-cream-600)" }}>{m.currency}</span>
                  <span className={`status-dot ${m.status === "active" ? "status-dot-ok" : m.status === "scanning" ? "status-dot-warn" : ""}`}
                    style={m.status === "queued" ? { background: "var(--color-charcoal-600)" } : undefined}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* HERALD Tool Library */}
      <div style={{
        marginTop: 24,
        padding: 20,
        background: "rgba(0,0,0,0.3)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
      }}>
        <HeraldToolLibrary />
      </div>
    </div>
  );
}
