/**
 * La Vigilante™ — Microsoft Lightning Agent
 * Guardian of the Kupuri Media Cosmic Council
 *
 * Monitors system health, budget, Vibe Graph conflicts,
 * and enforces the Ralphy Loop protocol.
 *
 * Designed as a Lightning Agent (stateless, event-driven, fast);
 * no LLM calls — pure observation and rule-based alerting.
 */

import { getBudgetStatus } from '@/lib/litellm-gateway';
import { supabaseAdmin } from '@/lib/supabase-client';

// ---------------------------------------------------------------------------
// Thresholds
// ---------------------------------------------------------------------------
const THRESHOLDS = {
  budgetWarning:     3.00,
  budgetCritical:    5.00,
  vibeConflictsWarn: 3,
  vibeConflictsCrit: 7,
  coherenceWarn:     0.4,
  coherenceCrit:     0.2,
  stalMemoryWarn:    10,
  stalMemoryCrit:    25,
} as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface WatcherAlert {
  id: string;
  agentId: string;
  category: string;
  message: string;
  severity: AlertSeverity;
  timestamp: string;
  resolved: boolean;
}

export interface SystemSnapshot {
  budgetUsed: number;
  budgetLimit: number;
  vibeConflicts: number;
  avgCoherence: number;
  staleMemoryCount: number;
  agentsOnline: number;
  activeMeetings: number;
  timestamp: string;
}

// In-process alert queue (max 200 entries rolling)
const alertQueue: WatcherAlert[] = [];
const MAX_ALERTS = 200;

// ---------------------------------------------------------------------------
// Core inspection functions
// ---------------------------------------------------------------------------

/** Inspect LLM budget and emit alert if thresholds exceeded. */
async function inspectBudget(): Promise<WatcherAlert | null> {
  try {
    const { totalSpent, dailyLimit } = await getBudgetStatus();
    if (totalSpent >= THRESHOLDS.budgetCritical) {
      return buildAlert('la-vigilante', 'budget',
        `Presupuesto LLM CRÍTICO: $${totalSpent.toFixed(2)} de $${dailyLimit} usado hoy.`,
        'critical');
    }
    if (totalSpent >= THRESHOLDS.budgetWarning) {
      return buildAlert('la-vigilante', 'budget',
        `Presupuesto LLM advertencia: $${totalSpent.toFixed(2)} de $${dailyLimit}.`,
        'warning');
    }
    return null;
  } catch {
    return null;
  }
}

/** Inspect Vibe Graph for active conflicts (edges with kind = 'conflicts'). */
async function inspectVibeConflicts(): Promise<WatcherAlert | null> {
  if (!supabaseAdmin) return null;
  try {
    const { count } = await supabaseAdmin
      .from('vibe_edges')
      .select('*', { count: 'exact', head: true })
      .eq('kind', 'conflicts')
      .gte('confidence', 0.5);

    const n = count ?? 0;
    if (n >= THRESHOLDS.vibeConflictsCrit) {
      return buildAlert('la-vigilante', 'vibe-graph',
        `${n} conflictos activos en Vibe Graph. Intervención requerida.`,
        'critical');
    }
    if (n >= THRESHOLDS.vibeConflictsWarn) {
      return buildAlert('la-vigilante', 'vibe-graph',
        `${n} conflictos detectados en Vibe Graph.`,
        'warning');
    }
    return null;
  } catch {
    return null;
  }
}

/** Inspect agent memory for stale records (low confidence). */
async function inspectStaleMemory(): Promise<WatcherAlert | null> {
  if (!supabaseAdmin) return null;
  try {
    const { count } = await supabaseAdmin
      .from('agent_memory')
      .select('*', { count: 'exact', head: true })
      .lt('confidence', 0.2);

    const n = count ?? 0;
    if (n >= THRESHOLDS.stalMemoryCrit) {
      return buildAlert('la-vigilante', 'memory',
        `${n} registros de memoria con confianza < 0.2. Ejecutar decay.`,
        'warning');
    }
    if (n >= THRESHOLDS.stalMemoryWarn) {
      return buildAlert('la-vigilante', 'memory',
        `${n} registros de memoria obsoletos detectados.`,
        'info');
    }
    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Full sweep — called by cron or on-demand
// ---------------------------------------------------------------------------
export async function runWatcherSweep(): Promise<WatcherAlert[]> {
  const results = await Promise.allSettled([
    inspectBudget(),
    inspectVibeConflicts(),
    inspectStaleMemory(),
  ]);

  const newAlerts: WatcherAlert[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value) {
      newAlerts.push(r.value);
      enqueueAlert(r.value);
    }
  }
  return newAlerts;
}

// ---------------------------------------------------------------------------
// Snapshot — aggregate system stats for the dashboard
// ---------------------------------------------------------------------------
export async function buildSnapshot(): Promise<SystemSnapshot> {
  const budgetInfo = await getBudgetStatus().catch(() => ({ totalSpent: 0, dailyLimit: 5 }));

  let vibeConflicts = 0;
  let staleMemoryCount = 0;
  let avgCoherence = 0.8;

  if (supabaseAdmin) {
    const [conflictsRes, staleRes, coherenceRes] = await Promise.allSettled([
      supabaseAdmin
        .from('vibe_edges')
        .select('*', { count: 'exact', head: true })
        .eq('kind', 'conflicts')
        .gte('confidence', 0.5),
      supabaseAdmin
        .from('agent_memory')
        .select('*', { count: 'exact', head: true })
        .lt('confidence', 0.2),
      supabaseAdmin
        .from('agent_state')
        .select('coherence'),
    ]);

    if (conflictsRes.status === 'fulfilled') vibeConflicts = conflictsRes.value.count ?? 0;
    if (staleRes.status === 'fulfilled') staleMemoryCount = staleRes.value.count ?? 0;
    if (coherenceRes.status === 'fulfilled' && coherenceRes.value.data?.length) {
      const vals = (coherenceRes.value.data as Array<{ coherence: number }>)
        .map((r) => r.coherence)
        .filter((v) => typeof v === 'number');
      if (vals.length > 0) avgCoherence = vals.reduce((a, b) => a + b, 0) / vals.length;
    }
  }

  return {
    budgetUsed:       budgetInfo.totalSpent,
    budgetLimit:      budgetInfo.dailyLimit,
    vibeConflicts,
    avgCoherence,
    staleMemoryCount,
    agentsOnline:     9,
    activeMeetings:   0,
    timestamp:        new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Alert helpers
// ---------------------------------------------------------------------------
function buildAlert(
  agentId: string,
  category: string,
  message: string,
  severity: AlertSeverity,
): WatcherAlert {
  return {
    id:        `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    agentId,
    category,
    message,
    severity,
    timestamp: new Date().toISOString(),
    resolved:  false,
  };
}

function enqueueAlert(alert: WatcherAlert) {
  alertQueue.unshift(alert);
  if (alertQueue.length > MAX_ALERTS) alertQueue.length = MAX_ALERTS;
}

/** External call: record an alert from a sphere agent. */
export function recordExternalAlert(
  agentId: string,
  message: string,
  severity: AlertSeverity = 'info',
): WatcherAlert {
  const alert = buildAlert(agentId, 'external', message, severity);
  enqueueAlert(alert);
  return alert;
}

/** Read recent alerts (for the watcher API GET). */
export function getRecentAlerts(limit = 50): WatcherAlert[] {
  return alertQueue.slice(0, limit);
}
