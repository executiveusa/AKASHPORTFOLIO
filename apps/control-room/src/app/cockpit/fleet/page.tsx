"use client";

import { useState, useEffect, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types matching /api/spheres/status response
// ---------------------------------------------------------------------------

interface SphereRow {
  id: string;
  displayName: string;
  role: string;
  locale: string;
  color: string;
  status: "speaking" | "active" | "idle" | "standby";
  lastSignalAt: number | null;
  turnsToday: number;
  lastTranscript: string | null;
  meetingId: string | null;
}

interface ActiveMeeting {
  meetingId: string;
  topic: string;
  agentIds: string[];
  startedAt: number;
  lastSpeaker: string | null;
  turns: number;
}

interface StatusPayload {
  ok: boolean;
  spheres: SphereRow[];
  activeMeetings: ActiveMeeting[];
  activeCount: number;
  updatedAt: number;
  uptimeSec: number;
}

// ---------------------------------------------------------------------------
// Status indicator
// ---------------------------------------------------------------------------

function StatusIndicator({ status }: { status: SphereRow["status"] }) {
  const config: Record<string, { color: string; label: string }> = {
    speaking:  { color: "var(--color-status-info)",  label: "Hablando" },
    active:    { color: "var(--color-status-ok)",    label: "Activo" },
    idle:      { color: "var(--color-cream-400)",    label: "En reposo" },
    standby:   { color: "var(--color-charcoal-600)", label: "En espera" },
  };
  const c = config[status] ?? config.standby;
  const pulse = status === "speaking" || status === "active";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500 }}>
      <span style={{
        width: 8, height: 8, borderRadius: "50%", backgroundColor: c.color,
        boxShadow: pulse ? `0 0 6px ${c.color}` : "none",
        animation: status === "speaking" ? "pulse 1.5s infinite" : "none",
      }} />
      {c.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Relative time helper (no fake numbers)
// ---------------------------------------------------------------------------

function relativeTime(epochMs: number | null): string {
  if (!epochMs) return "—";
  const diffSec = Math.floor((Date.now() - epochMs) / 1000);
  if (diffSec < 60) return `hace ${diffSec}s`;
  if (diffSec < 3600) return `hace ${Math.floor(diffSec / 60)}m`;
  return `hace ${Math.floor(diffSec / 3600)}h`;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function FleetPage() {
  const [data, setData] = useState<StatusPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string>("");
  const [view, setView] = useState<"grid" | "table">("grid");
  const VIEW_LABELS: Record<"grid" | "table", string> = { grid: "cuadrícula", table: "tabla" };

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/spheres/status", { cache: "no-store" });
      if (!res.ok) { setError(`Error ${res.status}`); return; }
      const json: StatusPayload = await res.json();
      setData(json);
      setError(null);
      setLastRefresh(new Date().toLocaleTimeString("es-MX", { timeZone: "America/Mexico_City" }));
    } catch (err) {
      setError(String(err));
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const spheres = data?.spheres ?? [];
  const activeMeetings = data?.activeMeetings ?? [];
  const activeCount = spheres.filter(s => s.status === "speaking" || s.status === "active").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--color-cream-100)", margin: 0 }}>
            Monitor de la flota
          </h1>
          <p style={{ fontSize: 13, color: "var(--color-cream-400)", marginTop: 4 }}>
            {data
              ? `${activeCount}/${spheres.length} agentes activos — Última actualización: ${lastRefresh}`
              : error
                ? `Error al cargar: ${error}`
                : "Cargando…"}
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
              }}
            >
              {VIEW_LABELS[v]}
            </button>
          ))}
        </div>
      </div>

      {/* Fleet KPIs — only real sources */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <div className="panel" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: "var(--color-cream-400)" }}>Agentes Activos</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-status-ok)" }}>
            {data ? `${activeCount}/${spheres.length}` : "—"}
          </div>
        </div>
        <div className="panel" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: "var(--color-cream-400)" }}>Reuniones Activas</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-cream-100)", fontVariantNumeric: "tabular-nums" }}>
            {data ? activeMeetings.length : "—"}
          </div>
        </div>
        <div className="panel" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: "var(--color-cream-400)" }}>Turnos Hoy (total)</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-cream-100)", fontVariantNumeric: "tabular-nums" }}>
            {data ? spheres.reduce((s, sp) => s + sp.turnsToday, 0) : "—"}
          </div>
        </div>
        <div className="panel" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: "var(--color-cream-400)" }}>Uptime servidor</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-status-ok)" }}>
            {data ? `${Math.floor(data.uptimeSec / 60)}m` : "—"}
          </div>
        </div>
      </div>

      {/* Active meetings summary */}
      {activeMeetings.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-cream-400)", textTransform: "uppercase", letterSpacing: 1 }}>
            Reuniones en curso
          </div>
          {activeMeetings.map(m => (
            <div key={m.meetingId} className="panel" style={{ padding: "12px 16px", borderLeft: "3px solid var(--color-status-info)" }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "var(--color-cream-100)" }}>{m.topic}</div>
              <div style={{ fontSize: 12, color: "var(--color-cream-400)", marginTop: 4 }}>
                {m.agentIds.length} participantes · {m.turns} turnos · inicio: {relativeTime(m.startedAt)}
                {m.lastSpeaker && <span> · último: <strong>{m.lastSpeaker}</strong></span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {data && activeMeetings.length === 0 && activeCount === 0 && (
        <div className="panel" style={{ padding: 24, textAlign: "center", color: "var(--color-cream-400)" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>—</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--color-cream-200)" }}>Todo en calma</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>No hay reuniones ni señales activas en este momento.</div>
        </div>
      )}

      {/* Grid View */}
      {view === "grid" && spheres.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
          {spheres.map((sphere) => (
            <div key={sphere.id} className="panel" style={{ padding: 16, borderLeft: `3px solid ${sphere.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--color-cream-100)" }}>{sphere.displayName}</div>
                  <div style={{ fontSize: 12, color: sphere.color }}>{sphere.role}</div>
                </div>
                <StatusIndicator status={sphere.status} />
              </div>
              {sphere.lastTranscript ? (
                <div style={{ fontSize: 13, color: "var(--color-cream-200)", marginBottom: 12, lineHeight: 1.4 }}>
                  <span style={{ fontStyle: "italic" }}>&ldquo;{sphere.lastTranscript}&rdquo;</span>
                  <span style={{ display: "block", fontSize: 11, color: "var(--color-cream-400)", marginTop: 2 }}>
                    {relativeTime(sphere.lastSignalAt)}
                  </span>
                </div>
              ) : (
                <div style={{ fontSize: 13, color: "var(--color-cream-400)", marginBottom: 12, fontStyle: "italic" }}>
                  Sin actividad reciente
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--color-cream-400)" }}>Turnos hoy</div>
                  <div style={{ fontSize: 16, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{sphere.turnsToday}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--color-cream-400)" }}>Última señal</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{relativeTime(sphere.lastSignalAt)}</div>
                </div>
              </div>
              {sphere.meetingId && (
                <div style={{ marginTop: 8, fontSize: 11, color: "var(--color-status-info)" }}>
                  En reunión activa
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {view === "table" && spheres.length > 0 && (
        <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table" style={{ width: "100%", minWidth: 700 }}>
              <thead>
                <tr>
                  <th style={{ padding: "10px 16px", textAlign: "left" }}>Agente</th>
                  <th style={{ padding: "10px 16px", textAlign: "center" }}>Estado</th>
                  <th style={{ padding: "10px 16px", textAlign: "left" }}>Último transcript</th>
                  <th style={{ padding: "10px 16px", textAlign: "right" }}>Turnos hoy</th>
                  <th style={{ padding: "10px 16px", textAlign: "right" }}>Última señal</th>
                </tr>
              </thead>
              <tbody>
                {spheres.map((s) => (
                  <tr key={s.id}>
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 3, height: 24, backgroundColor: s.color, borderRadius: 2 }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{s.displayName}</div>
                          <div style={{ fontSize: 11, color: s.color }}>{s.role}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "10px 16px", textAlign: "center" }}>
                      <StatusIndicator status={s.status} />
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: 13, color: "var(--color-cream-200)", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.lastTranscript ?? <span style={{ color: "var(--color-cream-400)", fontStyle: "italic" }}>—</span>}
                    </td>
                    <td style={{ padding: "10px 16px", textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                      {s.turnsToday}
                    </td>
                    <td style={{ padding: "10px 16px", textAlign: "right", color: "var(--color-cream-400)" }}>
                      {relativeTime(s.lastSignalAt)}
                    </td>
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
