"use client";

import { useState, useEffect } from "react";

interface Agent {
  id: string;
  name: string;
  role: string;
  sphere: string;
  color: string;
  status: "active" | "idle" | "processing" | "error" | "offline";
  lastAction: string;
  lastActionTime: string;
  tasksCompleted: number;
  tasksPending: number;
  uptimePercent: number;
  memoryMb: number;
  cpuPercent: number;
}

const sphereAgents: Agent[] = [
  { id: "alex", name: "ALEX™", role: "Strategy Director", sphere: "El Arquitecto", color: "#d4af37", status: "active", lastAction: "Generating Q3 strategy deck", lastActionTime: "2m ago", tasksCompleted: 847, tasksPending: 3, uptimePercent: 99.8, memoryMb: 124, cpuPercent: 12 },
  { id: "seductora", name: "SEDUCTORA™", role: "Conversion Specialist", sphere: "La Seductora", color: "#eab308", status: "processing", lastAction: "A/B test landing CDMX", lastActionTime: "1m ago", tasksCompleted: 623, tasksPending: 5, uptimePercent: 99.5, memoryMb: 89, cpuPercent: 34 },
  { id: "cazadora", name: "CAZADORA™", role: "Lead Hunter", sphere: "La Cazadora", color: "#ef4444", status: "active", lastAction: "LinkedIn scan — Madrid C-suite", lastActionTime: "5m ago", tasksCompleted: 1204, tasksPending: 12, uptimePercent: 99.9, memoryMb: 156, cpuPercent: 8 },
  { id: "forjadora", name: "FORJADORA™", role: "Content Creator", sphere: "La Forjadora", color: "#22c55e", status: "idle", lastAction: "Published 3 social posts", lastActionTime: "23m ago", tasksCompleted: 456, tasksPending: 0, uptimePercent: 98.2, memoryMb: 67, cpuPercent: 2 },
  { id: "dra-cultura", name: "DRA. CULTURA™", role: "Cultural Intelligence", sphere: "Dra. Cultura", color: "#f43f5e", status: "active", lastAction: "LATAM market brief updated", lastActionTime: "8m ago", tasksCompleted: 389, tasksPending: 2, uptimePercent: 99.1, memoryMb: 98, cpuPercent: 15 },
  { id: "ing-teknos", name: "ING. TEKNOS", role: "Tech Infrastructure", sphere: "Ing. Teknos", color: "#06b6d4", status: "active", lastAction: "Monitoring deploy pipeline", lastActionTime: "30s ago", tasksCompleted: 2103, tasksPending: 1, uptimePercent: 99.95, memoryMb: 210, cpuPercent: 22 },
  { id: "dr-economia", name: "DR. ECONOMÍA", role: "Financial Analysis", sphere: "Dr. Economía", color: "#f97316", status: "active", lastAction: "Revenue forecast updated", lastActionTime: "12m ago", tasksCompleted: 567, tasksPending: 2, uptimePercent: 99.7, memoryMb: 112, cpuPercent: 10 },
  { id: "consejo", name: "CONSEJO™", role: "Council Facilitator", sphere: "El Consejo", color: "#1d4ed8", status: "idle", lastAction: "Facilitated morning standup", lastActionTime: "45m ago", tasksCompleted: 789, tasksPending: 0, uptimePercent: 99.3, memoryMb: 78, cpuPercent: 1 },
  { id: "synthia", name: "SYNTHIA™", role: "Chief of Staff", sphere: "La Coordinadora", color: "#8b5cf6", status: "active", lastAction: "Routing tasks to fleet", lastActionTime: "3m ago", tasksCompleted: 1456, tasksPending: 1, uptimePercent: 99.99, memoryMb: 188, cpuPercent: 18 },
  { id: "la-vigilante", name: "LA VIGILANTE™", role: "System Overseer", sphere: "Overseer", color: "#64748b", status: "active", lastAction: "All systems nominal", lastActionTime: "10s ago", tasksCompleted: 5678, tasksPending: 0, uptimePercent: 100, memoryMb: 256, cpuPercent: 5 },
];

function StatusIndicator({ status }: { status: string }) {
  const config: Record<string, { color: string; label: string }> = {
    active: { color: "var(--color-status-ok)", label: "Activo" },
    idle: { color: "var(--color-cream-400)", label: "Idle" },
    processing: { color: "var(--color-status-info)", label: "Procesando" },
    error: { color: "var(--color-status-error)", label: "Error" },
    offline: { color: "var(--color-charcoal-600)", label: "Offline" },
  };
  const c = config[status] || config.idle;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500 }}>
      <span style={{
        width: 8, height: 8, borderRadius: "50%", backgroundColor: c.color,
        boxShadow: status === "active" || status === "processing" ? `0 0 6px ${c.color}` : "none",
        animation: status === "processing" ? "pulse 1.5s infinite" : "none",
      }} />
      {c.label}
    </span>
  );
}

function ResourceBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 4, backgroundColor: "var(--color-charcoal-600)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", backgroundColor: color, borderRadius: 2, transition: "width 0.5s ease" }} />
      </div>
      <span style={{ fontSize: 11, fontVariantNumeric: "tabular-nums", color: "var(--color-cream-400)", minWidth: 32, textAlign: "right" }}>
        {value}{max > 100 ? "MB" : "%"}
      </span>
    </div>
  );
}

export default function FleetPage() {
  const [agents] = useState<Agent[]>(sphereAgents);
  const [view, setView] = useState<"grid" | "table">("grid");
  const [lastRefresh, setLastRefresh] = useState("");

  useEffect(() => {
    setLastRefresh(new Date().toLocaleTimeString("es-MX", { timeZone: "America/Mexico_City" }));
    const interval = setInterval(() => {
      setLastRefresh(new Date().toLocaleTimeString("es-MX", { timeZone: "America/Mexico_City" }));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const activeCount = agents.filter(a => a.status === "active" || a.status === "processing").length;
  const totalTasks = agents.reduce((s, a) => s + a.tasksCompleted, 0);
  const avgUptime = (agents.reduce((s, a) => s + a.uptimePercent, 0) / agents.length).toFixed(2);
  const totalMemory = agents.reduce((s, a) => s + a.memoryMb, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--color-cream-100)", margin: 0 }}>
            Fleet Monitor
          </h1>
          <p style={{ fontSize: 13, color: "var(--color-cream-400)", marginTop: 4 }}>
            {activeCount}/{agents.length} agentes activos — Último refresh: {lastRefresh}
          </p>
        </div>
        <div style={{ display: "flex", gap: 4, backgroundColor: "var(--color-charcoal-800)", borderRadius: 8, padding: 2 }}>
          {(["grid", "table"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: view === v ? 600 : 400,
                color: view === v ? "var(--color-charcoal-900)" : "var(--color-cream-400)",
                backgroundColor: view === v ? "var(--color-gold-600)" : "transparent",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Fleet KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <div className="panel" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: "var(--color-cream-400)" }}>Agentes Activos</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-status-ok)" }}>{activeCount}/{agents.length}</div>
        </div>
        <div className="panel" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: "var(--color-cream-400)" }}>Tasks Completados</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-cream-100)", fontVariantNumeric: "tabular-nums" }}>{totalTasks.toLocaleString()}</div>
        </div>
        <div className="panel" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: "var(--color-cream-400)" }}>Uptime Promedio</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-status-ok)" }}>{avgUptime}%</div>
        </div>
        <div className="panel" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: "var(--color-cream-400)" }}>Memoria Total</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-cream-100)", fontVariantNumeric: "tabular-nums" }}>{totalMemory} MB</div>
        </div>
      </div>

      {/* Grid View */}
      {view === "grid" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
          {agents.map((agent) => (
            <div key={agent.id} className="panel" style={{ padding: 16, borderLeft: `3px solid ${agent.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--color-cream-100)" }}>{agent.name}</div>
                  <div style={{ fontSize: 12, color: agent.color }}>{agent.role}</div>
                </div>
                <StatusIndicator status={agent.status} />
              </div>
              <div style={{ fontSize: 13, color: "var(--color-cream-200)", marginBottom: 12, lineHeight: 1.4 }}>
                {agent.lastAction}
                <span style={{ display: "block", fontSize: 11, color: "var(--color-cream-400)", marginTop: 2 }}>
                  {agent.lastActionTime}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--color-cream-400)" }}>Completados</div>
                  <div style={{ fontSize: 16, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{agent.tasksCompleted}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--color-cream-400)" }}>Pendientes</div>
                  <div style={{ fontSize: 16, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: agent.tasksPending > 0 ? "var(--color-status-warn)" : "var(--color-cream-100)" }}>
                    {agent.tasksPending}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--color-cream-400)", marginBottom: 2 }}>CPU</div>
                  <ResourceBar value={agent.cpuPercent} max={100} color={agent.cpuPercent > 80 ? "var(--color-status-error)" : agent.cpuPercent > 50 ? "var(--color-status-warn)" : "var(--color-status-ok)"} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--color-cream-400)", marginBottom: 2 }}>Memoria</div>
                  <ResourceBar value={agent.memoryMb} max={512} color={agent.color} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {view === "table" && (
        <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table" style={{ width: "100%", minWidth: 900 }}>
              <thead>
                <tr>
                  <th style={{ padding: "10px 16px", textAlign: "left" }}>Agente</th>
                  <th style={{ padding: "10px 16px", textAlign: "center" }}>Estado</th>
                  <th style={{ padding: "10px 16px", textAlign: "left" }}>Última Acción</th>
                  <th style={{ padding: "10px 16px", textAlign: "right" }}>Tasks</th>
                  <th style={{ padding: "10px 16px", textAlign: "right" }}>Uptime</th>
                  <th style={{ padding: "10px 16px", textAlign: "right" }}>CPU</th>
                  <th style={{ padding: "10px 16px", textAlign: "right" }}>Mem</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((a) => (
                  <tr key={a.id}>
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 3, height: 24, backgroundColor: a.color, borderRadius: 2 }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{a.name}</div>
                          <div style={{ fontSize: 11, color: a.color }}>{a.role}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "10px 16px", textAlign: "center" }}><StatusIndicator status={a.status} /></td>
                    <td style={{ padding: "10px 16px", fontSize: 13, color: "var(--color-cream-200)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {a.lastAction}
                    </td>
                    <td style={{ padding: "10px 16px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                      <span style={{ fontWeight: 600 }}>{a.tasksCompleted}</span>
                      {a.tasksPending > 0 && <span style={{ color: "var(--color-status-warn)", fontSize: 11, marginLeft: 4 }}>+{a.tasksPending}</span>}
                    </td>
                    <td style={{ padding: "10px 16px", textAlign: "right", fontVariantNumeric: "tabular-nums", color: a.uptimePercent >= 99.5 ? "var(--color-status-ok)" : "var(--color-status-warn)" }}>
                      {a.uptimePercent}%
                    </td>
                    <td style={{ padding: "10px 16px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{a.cpuPercent}%</td>
                    <td style={{ padding: "10px 16px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{a.memoryMb}MB</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
