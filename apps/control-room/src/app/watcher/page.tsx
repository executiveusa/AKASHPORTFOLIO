'use client';

/**
 * /watcher — La Vigilante Performance Dashboard
 * Real-time metrics, alert feed, active directives.
 */

import { useEffect, useState, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Types mirroring the watcher API response shapes
// ---------------------------------------------------------------------------
interface WatcherStatus {
  agentsOnline: number;
  activeMeetings: number;
  alertsLast24h: number;
  budgetUsedToday: number;
  budgetLimitUSD: number;
  systemHealth: 'ok' | 'warning' | 'critical';
  lastChecked: string;
}

interface WatcherMetrics {
  vibeNodes: number;
  vibeEdges: number;
  memoryRecords: number;
  meetingsToday: number;
  avgCoherence: number;
  topAgent: string | null;
}

interface Directive {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  instruction: string;
  isActive: boolean;
}

interface AlertEntry {
  agentId: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  receivedAt: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const HEALTH_COLOR: Record<string, string> = {
  ok:       'text-emerald-400',
  warning:  'text-amber-400',
  critical: 'text-red-400',
};

const PRIORITY_BADGE: Record<string, string> = {
  critical: 'bg-red-900/50 text-red-300 border-red-700',
  high:     'bg-amber-900/50 text-amber-300 border-amber-700',
  medium:   'bg-blue-900/50 text-blue-300 border-blue-700',
  low:      'bg-zinc-800/50 text-zinc-400 border-zinc-700',
};

const SEV_DOT: Record<string, string> = {
  critical: 'bg-red-500',
  warning:  'bg-amber-500',
  info:     'bg-blue-500',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function WatcherPage() {
  const [status, setStatus]       = useState<WatcherStatus | null>(null);
  const [metrics, setMetrics]     = useState<WatcherMetrics | null>(null);
  const [directives, setDirectives] = useState<Directive[]>([]);
  const [alerts, setAlerts]       = useState<AlertEntry[]>([]);
  const [error, setError]         = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchAll = useCallback(async () => {
    try {
      console.warn('[TODO] migrate: /api/watcher');
      throw new Error('Watcher migrating to SYNTHIA™ backend');
      setLastRefresh(new Date());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll();
    const interval = setInterval(() => void fetchAll(), 15_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // ---- Render ---------------------------------------------------------------
  if (loading && !status) {
    return (
      <main className="flex items-center justify-center h-screen bg-zinc-950 text-zinc-400">
        <div className="text-sm animate-pulse">Conectando con La Vigilante…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              La Vigilante™{' '}
              <span className="text-[10px] font-normal text-zinc-500 ml-2 uppercase tracking-widest">
                Monitor del Consejo
              </span>
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Última actualización: {lastRefresh.toLocaleTimeString('es-MX')}
            </p>
          </div>
          <button
            onClick={() => void fetchAll()}
            className="px-3 py-1.5 rounded-lg border border-zinc-700 text-xs text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors uppercase tracking-widest"
          >
            Actualizar
          </button>
        </div>
        {error && (
          <div className="mt-2 px-3 py-2 bg-red-900/30 border border-red-800 rounded-lg text-xs text-red-400">
            {error}
          </div>
        )}
      </header>

      {/* Status KPI row */}
      {status && (
        <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          <KpiCard label="Agentes Activos"  value={status.agentsOnline}      />
          <KpiCard label="Reuniones Activas" value={status.activeMeetings}   />
          <KpiCard label="Alertas (24h)"    value={status.alertsLast24h}     color="text-amber-400" />
          <KpiCard
            label="Presupuesto LLM"
            value={`$${status.budgetUsedToday.toFixed(2)} / $${status.budgetLimitUSD}`}
            sub={`${((status.budgetUsedToday / status.budgetLimitUSD) * 100).toFixed(0)}% usado`}
          />
          <KpiCard
            label="Salud del Sistema"
            value={status.systemHealth.toUpperCase()}
            color={HEALTH_COLOR[status.systemHealth] ?? 'text-zinc-300'}
          />
          {metrics && (
            <KpiCard label="Coherencia Prom." value={`${(metrics.avgCoherence * 100).toFixed(0)}%`} />
          )}
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Vibe Graph metrics */}
        {metrics && (
          <section className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
            <h2 className="text-[10px] uppercase tracking-widest text-violet-400 mb-3">Vibe Graph</h2>
            <dl className="space-y-2 text-sm">
              <MetricRow label="Nodos" value={metrics.vibeNodes} />
              <MetricRow label="Aristas" value={metrics.vibeEdges} />
              <MetricRow label="Registros de Memoria" value={metrics.memoryRecords} />
              <MetricRow label="Reuniones Hoy" value={metrics.meetingsToday} />
              {metrics.topAgent && (
                <MetricRow label="Agente Principal" value={metrics.topAgent} />
              )}
            </dl>
          </section>
        )}

        {/* Directives */}
        <section className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
          <h2 className="text-[10px] uppercase tracking-widest text-amber-400 mb-3">
            Directivas Activas ({directives.filter((d) => d.isActive).length})
          </h2>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {directives.length === 0 && (
              <p className="text-xs text-zinc-500">Sin directivas.</p>
            )}
            {directives.map((d) => (
              <div
                key={d.id}
                className={`px-3 py-2 rounded-lg border text-[11px] ${d.isActive ? PRIORITY_BADGE[d.priority] : 'bg-zinc-800/30 text-zinc-600 border-zinc-800'}`}
              >
                <p className="font-bold uppercase tracking-widest text-[9px] mb-0.5">
                  [{d.priority.toUpperCase()}] {d.category}
                </p>
                <p className="leading-snug">{d.instruction}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Alert feed */}
        <section className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[10px] uppercase tracking-widest text-rose-400">
              Feed de Alertas
            </h2>
            {alerts.length > 0 && (
              <button
                onClick={() => setAlerts([])}
                className="text-[9px] text-zinc-500 hover:text-zinc-300 uppercase tracking-widest"
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 max-h-60">
            {alerts.length === 0 && (
              <p className="text-xs text-zinc-600">Sin alertas recientes.</p>
            )}
            {alerts.map((a, idx) => (
              <div key={idx} className="flex items-start gap-2 text-[11px]">
                <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${SEV_DOT[a.severity]}`} />
                <div>
                  <span className="font-bold text-zinc-300">{a.agentId}</span>
                  <span className="text-zinc-500 mx-1">·</span>
                  <span className="text-zinc-400">{a.message}</span>
                  <p className="text-[9px] text-zinc-600 mt-0.5">
                    {new Date(a.receivedAt).toLocaleTimeString('es-MX')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Manual alert test */}
          <SendAlertForm onAlert={(a) => setAlerts((prev) => [a, ...prev.slice(0, 49)])} />
        </section>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function KpiCard({
  label,
  value,
  sub,
  color = 'text-white',
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3">
      <p className="text-[9px] uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      {sub && <p className="text-[9px] text-zinc-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-zinc-500 text-xs">{label}</dt>
      <dd className="font-mono text-xs text-zinc-200">{value}</dd>
    </div>
  );
}

function SendAlertForm({ onAlert }: { onAlert: (a: AlertEntry) => void }) {
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!msg.trim()) return;
    setSending(true);
    try {
      console.warn('[TODO] migrate: /api/watcher');
      onAlert({ agentId: 'manual', message: msg.trim(), severity: 'info', receivedAt: new Date().toISOString() });
      setMsg('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-3 flex gap-2">
      <input
        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
        placeholder="Enviar alerta manual…"
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') void send(); }}
      />
      <button
        onClick={() => void send()}
        disabled={sending || !msg.trim()}
        className="px-2 py-1 bg-violet-700 hover:bg-violet-600 disabled:opacity-40 rounded-lg text-[10px] uppercase tracking-widest transition-colors"
      >
        Enviar
      </button>
    </div>
  );
}
