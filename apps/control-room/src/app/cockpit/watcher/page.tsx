"use client";

import { useEffect, useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BudgetStatus {
  spentTodayUsd: number;
  dailyBudgetUsd: number;
  percentUsed: number;
  overBudget: boolean;
}

interface LoopGuardEntry {
  count: number;
  lastError: string;
  haltedAt?: string;
}

interface TelemetryEvent {
  id: string;
  sessionId?: string;
  type: string;
  summary: string;
  timestamp: string;
  data?: unknown;
}

interface OpsReport {
  bead_id: string;
  task_name: string;
  stage: string;
  status: "IN_PROGRESS" | "COMPLETE" | "FAILED" | "HALTED";
  started_at: string;
  completed_at?: string;
  cost_used_usd: number;
  last_action: string;
  next_action: string;
  blockers: string[];
  files_changed: string[];
  tests_run: number;
  tests_passed: number;
  systems_score?: Record<string, number>;
}

interface WatcherStatus {
  ok: boolean;
  timestamp: string;
  budget: BudgetStatus;
  agentHeartbeats: Array<{ agent_id: string; status: string; last_seen: string }>;
  openMeetings: number;
  warnings: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<string, string> = {
  active: "#22c55e",
  idle: "#dfc36a",
  error: "#ef4444",
  halted: "#ef4444",
};

const REPORT_COLORS: Record<string, string> = {
  COMPLETE: "#22c55e",
  IN_PROGRESS: "#dfc36a",
  FAILED: "#ef4444",
  HALTED: "#ef4444",
};

const EVENT_COLORS: Record<string, string> = {
  error: "#ef4444",
  success: "#22c55e",
  info: "#dfc36a",
  tool_call: "#8b5cf6",
  reasoning: "#06b6d4",
  state_change: "#f97316",
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function KpiCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="metric-card" style={{ padding: "14px 18px", flex: 1, minWidth: 130 }}>
      <div style={{ fontSize: 11, color: "var(--color-cream-400)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 600, color: accent ?? "var(--color-cream-100)", fontFamily: "var(--font-mono)" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: "var(--color-cream-600)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function BudgetBar({ budget }: { budget: BudgetStatus }) {
  const pct = Math.min(budget.percentUsed, 100);
  const barColor = pct > 90 ? "#ef4444" : pct > 70 ? "#f97316" : "#22c55e";
  return (
    <div className="panel" style={{ padding: "14px 18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
        <span style={{ color: "var(--color-cream-200)", fontWeight: 500 }}>LLM Budget Hoy</span>
        <span style={{ color: budget.overBudget ? "#ef4444" : "var(--color-cream-100)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
          ${budget.spentTodayUsd.toFixed(4)} / ${budget.dailyBudgetUsd.toFixed(2)}
        </span>
      </div>
      <div style={{ height: 4, background: "var(--color-charcoal-600)", borderRadius: 2 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: 2, transition: "width 0.3s" }} />
      </div>
      {budget.overBudget && (
        <div style={{ marginTop: 6, fontSize: 11, color: "#ef4444", fontWeight: 600 }}>
          ⚠ COST_GUARD ACTIVO — LLM en modo stub
        </div>
      )}
    </div>
  );
}

function CircuitBreakerPanel({ loopGuard }: { loopGuard: Record<string, LoopGuardEntry> }) {
  const entries = Object.entries(loopGuard);
  return (
    <div className="panel" style={{ padding: "14px 18px" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-cream-200)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        Circuit Breakers
      </div>
      {entries.length === 0 ? (
        <div style={{ fontSize: 12, color: "var(--color-cream-400)", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
          Todos los circuitos operativos
        </div>
      ) : (
        entries.map(([key, entry]) => {
          const halted = (entry.count ?? 0) >= 3;
          return (
            <div key={key} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "6px 0", borderBottom: "1px solid var(--color-charcoal-600)", fontSize: 12
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: halted ? "#ef4444" : "#f97316" }} />
                <span style={{ color: "var(--color-cream-200)", fontFamily: "var(--font-mono)" }}>{key}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: halted ? "#ef4444" : "#f97316", fontWeight: 600 }}>
                  {halted ? "HALTED" : `${entry.count}/3 errores`}
                </div>
                <div style={{ color: "var(--color-cream-600)", fontSize: 10 }}>{entry.lastError?.slice(0, 40)}</div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function AgentHeartbeatPanel({ agents }: { agents: WatcherStatus["agentHeartbeats"] }) {
  return (
    <div className="panel" style={{ padding: "14px 18px" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-cream-200)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        Latidos de Agentes
      </div>
      {agents.length === 0 ? (
        <div style={{ fontSize: 12, color: "var(--color-cream-600)" }}>Sin datos de Supabase</div>
      ) : (
        agents.map((a) => (
          <div key={a.agent_id} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "5px 0", borderBottom: "1px solid var(--color-charcoal-600)", fontSize: 12,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: STATUS_COLORS[a.status] ?? "#64748b" }} />
              <span style={{ color: "var(--color-cream-100)", fontFamily: "var(--font-mono)" }}>{a.agent_id}</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ color: STATUS_COLORS[a.status] ?? "var(--color-cream-400)", fontSize: 11 }}>{a.status}</span>
              <div style={{ color: "var(--color-cream-600)", fontSize: 10 }}>
                {new Date(a.last_seen).toLocaleTimeString("es-MX")}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function EventFeed({ events }: { events: TelemetryEvent[] }) {
  return (
    <div className="panel" style={{ padding: "14px 18px", height: 320, display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-cream-200)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        Feed de Telemetría
      </div>
      <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        {events.length === 0 ? (
          <div style={{ fontSize: 12, color: "var(--color-cream-600)" }}>No hay eventos recientes</div>
        ) : (
          events.map((evt) => (
            <div key={evt.id} style={{
              display: "flex", gap: 10, alignItems: "flex-start",
              padding: "5px 0", borderBottom: "1px solid var(--color-charcoal-600)",
            }}>
              <span style={{
                display: "inline-block", width: 6, height: 6, borderRadius: "50%",
                background: EVENT_COLORS[evt.type] ?? "#64748b", marginTop: 4, flexShrink: 0
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: "var(--color-cream-100)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {evt.summary}
                </div>
                <div style={{ fontSize: 10, color: "var(--color-cream-600)", marginTop: 1 }}>
                  {evt.type} · {new Date(evt.timestamp).toLocaleTimeString("es-MX")}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function OpsReportRow({ report }: { report: OpsReport }) {
  const [expanded, setExpanded] = useState(false);
  const score = report.systems_score?.overall;
  const passScore = score !== undefined ? score >= 8.5 : null;
  return (
    <div style={{ borderBottom: "1px solid var(--color-charcoal-600)" }}>
      <div
        onClick={() => setExpanded(p => !p)}
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", cursor: "pointer" }}
      >
        <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: REPORT_COLORS[report.status] ?? "#64748b", flexShrink: 0 }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-cream-400)", flexShrink: 0 }}>
          {report.bead_id}
        </span>
        <span style={{ fontSize: 12, color: "var(--color-cream-100)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {report.task_name}
        </span>
        <span style={{ fontSize: 11, color: REPORT_COLORS[report.status], flexShrink: 0 }}>{report.status}</span>
        {score !== undefined && (
          <span style={{ fontSize: 11, color: passScore ? "#22c55e" : "#ef4444", flexShrink: 0 }}>
            {score.toFixed(1)}/10
          </span>
        )}
      </div>
      {expanded && (
        <div style={{ paddingBottom: 12, paddingLeft: 18, fontSize: 12, color: "var(--color-cream-400)" }}>
          <div><strong>Stage:</strong> {report.stage}</div>
          <div><strong>Último acción:</strong> {report.last_action}</div>
          <div><strong>Próximo:</strong> {report.next_action}</div>
          <div><strong>Costo:</strong> ${report.cost_used_usd?.toFixed(6) ?? "0"}</div>
          {report.blockers?.length > 0 && (
            <div style={{ color: "#ef4444" }}><strong>Bloqueadores:</strong> {report.blockers.join(", ")}</div>
          )}
          {report.files_changed?.length > 0 && (
            <div><strong>Archivos:</strong> {report.files_changed.join(", ")}</div>
          )}
          {report.systems_score && (
            <div style={{ marginTop: 4 }}>
              <strong>Scores:</strong>{" "}
              {Object.entries(report.systems_score).map(([k, v]) =>
                <span key={k} style={{ marginRight: 8 }}>{k}: {typeof v === "number" ? v.toFixed(1) : v}</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function WatcherPage() {
  const [status, setStatus] = useState<WatcherStatus | null>(null);
  const [loopGuard, setLoopGuard] = useState<Record<string, LoopGuardEntry>>({});
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [reports, setReports] = useState<OpsReport[]>([]);
  const [lastRefresh, setLastRefresh] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      console.warn('[TODO] migrate: /api/watcher, /api/telemetry');
      const [watcherRes, budgetRes, eventsRes, reportsRes] = await Promise.allSettled([
        Promise.reject(new Error('watcher migrating')),
        Promise.reject(new Error('telemetry migrating')),
        Promise.reject(new Error('telemetry migrating')),
        Promise.reject(new Error('telemetry migrating')),
      ]);

      if (watcherRes.status === "fulfilled") setStatus(watcherRes.value as WatcherStatus);

      if (budgetRes.status === "fulfilled") {
        const b = budgetRes.value as { loopGuard?: Record<string, LoopGuardEntry> };
        if (b.loopGuard) setLoopGuard(b.loopGuard);
      }

      if (eventsRes.status === "fulfilled") {
        const e = eventsRes.value as { events?: TelemetryEvent[] };
        setEvents(e.events ?? []);
      }

      if (reportsRes.status === "fulfilled") {
        const r = reportsRes.value as { reports?: OpsReport[] };
        setReports(r.reports ?? []);
      }
    } finally {
      setLoading(false);
      setLastRefresh(new Date().toLocaleTimeString("es-MX"));
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30000); // auto-refresh every 30s
    return () => clearInterval(id);
  }, [refresh]);

  const budget = status?.budget ?? { spentTodayUsd: 0, dailyBudgetUsd: 20, percentUsed: 0, overBudget: false };
  const warnings = status?.warnings ?? [];
  const agents = status?.agentHeartbeats ?? [];
  const openMeetings = status?.openMeetings ?? 0;
  const circuitHalted = Object.values(loopGuard).filter(v => v.count >= 3).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--color-cream-100)", margin: 0 }}>
            La Vigilante™
          </h1>
          <p style={{ fontSize: 13, color: "var(--color-cream-400)", marginTop: 4 }}>
            Guardian del Consejo — Sistema de Observabilidad ZTE · actualizado {lastRefresh || "…"}
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          style={{
            padding: "7px 18px", fontSize: 12, fontWeight: 600,
            background: "transparent", color: "var(--color-cream-200)",
            border: "1px solid var(--color-charcoal-600)", borderRadius: 6, cursor: "pointer",
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? "…" : "↻ Actualizar"}
        </button>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {warnings.map((w, i) => (
            <div key={i} style={{
              padding: "8px 14px", fontSize: 12, color: "#f97316",
              background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 6,
            }}>
              ⚠ {w}
            </div>
          ))}
        </div>
      )}

      {/* KPI Row */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <KpiCard label="Gasto Hoy" value={`$${budget.spentTodayUsd.toFixed(4)}`} sub={`${budget.percentUsed.toFixed(0)}% del presupuesto`} accent={budget.overBudget ? "#ef4444" : "var(--color-gold-400)"} />
        <KpiCard label="Agentes Online" value={agents.filter(a => a.status === "active").length} sub={`${agents.length} registrados`} />
        <KpiCard label="Reuniones Abiertas" value={openMeetings} />
        <KpiCard label="Circuitos Rotos" value={circuitHalted} accent={circuitHalted > 0 ? "#ef4444" : "#22c55e"} />
        <KpiCard label="Eventos (50)" value={events.length} sub={`${events.filter(e => e.type === "error").length} errores`} />
        <KpiCard label="Reportes ZTE" value={reports.length} />
      </div>

      {/* Budget bar */}
      <BudgetBar budget={budget} />

      {/* Main grid: heartbeats + circuit breakers | event feed */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <AgentHeartbeatPanel agents={agents} />
          <CircuitBreakerPanel loopGuard={loopGuard} />
        </div>
        <EventFeed events={events} />
      </div>

      {/* Ops Reports */}
      <div className="panel" style={{ padding: "14px 18px" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-cream-200)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Reportes ZTE (Stage 7)
        </div>
        {reports.length === 0 ? (
          <div style={{ fontSize: 12, color: "var(--color-cream-600)" }}>
            Sin reportes — los crons y tareas ZTE escriben aquí automáticamente.
          </div>
        ) : (
          reports.map(r => <OpsReportRow key={r.bead_id} report={r} />)
        )}
      </div>
    </div>
  );
}
