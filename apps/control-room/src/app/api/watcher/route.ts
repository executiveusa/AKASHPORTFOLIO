/**
 * La Vigilante (The Watcher) API — Microsoft Lightning Agent monitoring
 *
 * GET  /api/watcher/status      — system health overview
 * GET  /api/watcher/metrics     — per-agent KPIs
 * POST /api/watcher/alert       — receive alert from agents (Cazadora, Dr. Economía, etc.)
 * GET  /api/watcher/directives  — fetch active directives from La Vigilante
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase-client';
import { getBudgetStatus, getBudgetStatusAsync, getAgentCosts } from '@/lib/litellm-gateway';
import { auth } from '../../../../auth';

// ---------------------------------------------------------------------------
// GET /api/watcher — route based on ?view= param
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const view = req.nextUrl.searchParams.get('view') ?? 'status';

  if (view === 'metrics') return getMetrics();
  if (view === 'directives') return getDirectives();
  return getStatus();
}

// ---------------------------------------------------------------------------
// Status — overall health of Sphere OS
// ---------------------------------------------------------------------------

async function getStatus(): Promise<NextResponse> {
  // STK: use async version to get DB-persisted spend (survives cold starts)
  const budget = await getBudgetStatusAsync();

  // Agent heartbeats
  let agentHeartbeats: Array<{ agent_id: string; status: string; last_seen: string }> = [];
  try {
    const { data } = await supabaseClient
      .from('agent_state')
      .select('agent_id, status, last_seen')
      .order('last_seen', { ascending: false });
    agentHeartbeats = data ?? [];
  } catch { /* DB unavailable */ }

  // Count active meetings
  let openMeetings = 0;
  try {
    const { count } = await supabaseClient
      .from('sphere_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open');
    openMeetings = count ?? 0;
  } catch { /* DB unavailable */ }

  const warnings: string[] = [];
  if (budget.percentUsed > 80) {
    warnings.push(`LLM budget at ${budget.percentUsed.toFixed(0)}% (${budget.spentTodayUsd.toFixed(2)}/${budget.dailyBudgetUsd.toFixed(2)} USD)`);
  }

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    budget,
    agentHeartbeats,
    openMeetings,
    warnings,
  });
}

// ---------------------------------------------------------------------------
// Metrics — per-agent KPIs
// ---------------------------------------------------------------------------

async function getMetrics(): Promise<NextResponse> {
  let nodeStats: Array<{ owner_agent_id: string; count: number; avg_confidence: number }> = [];
  let memoryStats: Array<{ agent_id: string; count: number; avg_importance: number }> = [];

  try {
    const { data: nodesData } = await supabaseClient
      .from('vibe_nodes')
      .select('owner_agent_id')
      .is('superseded_by', null);

    if (nodesData) {
      const grouped = nodesData.reduce<Record<string, number>>((acc, n) => {
        acc[n.owner_agent_id] = (acc[n.owner_agent_id] ?? 0) + 1;
        return acc;
      }, {});
      nodeStats = Object.entries(grouped).map(([owner_agent_id, count]) => ({
        owner_agent_id,
        count,
        avg_confidence: 0.8, // simplified
      }));
    }
  } catch { /* DB unavailable */ }

  try {
    const { data: memData } = await supabaseClient
      .from('agent_memory')
      .select('agent_id')
      .is('superseded_by', null);

    if (memData) {
      const grouped = memData.reduce<Record<string, number>>((acc, m) => {
        acc[m.agent_id] = (acc[m.agent_id] ?? 0) + 1;
        return acc;
      }, {});
      memoryStats = Object.entries(grouped).map(([agent_id, count]) => ({
        agent_id,
        count,
        avg_importance: 0.6, // simplified
      }));
    }
  } catch { /* DB unavailable */ }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    vibeGraph: nodeStats,
    agentMemory: memoryStats,
    budget: getBudgetStatus(),
    agentCosts: getAgentCosts(), // FLW: per-agent cost breakdown
  });
}

// ---------------------------------------------------------------------------
// Directives — La Vigilante's standing orders to the council
// ---------------------------------------------------------------------------

async function getDirectives(): Promise<NextResponse> {
  const directives = [
    {
      id: 'D001',
      priority: 'high',
      text: 'All spheres MUST read /api/vibe/context before acting. Zero tolerance for collision.',
      issuedBy: 'la-vigilante',
      issuedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'D002',
      priority: 'medium',
      text: 'LLM responses exceeding 400 tokens per turn require justification to budget monitor.',
      issuedBy: 'la-vigilante',
      issuedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'D003',
      priority: 'high',
      text: 'When budget exceeds 80%, switch to haiku fallback model automatically.',
      issuedBy: 'la-vigilante',
      issuedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'D004',
      priority: 'critical',
      text: 'No agent may supersede agent_memory or vibe_nodes created by Ivette directly. Human override is final.',
      issuedBy: 'la-vigilante',
      issuedAt: '2025-01-01T00:00:00Z',
    },
  ];

  return NextResponse.json({ directives, count: directives.length });
}

// ---------------------------------------------------------------------------
// POST — receive alert from any agent
// ---------------------------------------------------------------------------

type AlertSeverity = 'INFO' | 'WARN' | 'ALERT' | 'CRITICAL';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    fromAgent?: string;
    severity?: AlertSeverity;
    message?: string;
    metadata?: Record<string, unknown>;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const severities: AlertSeverity[] = ['INFO', 'WARN', 'ALERT', 'CRITICAL'];
  if (!body.fromAgent || !body.message) {
    return NextResponse.json({ error: 'fromAgent and message are required' }, { status: 400 });
  }
  if (body.severity && !severities.includes(body.severity)) {
    return NextResponse.json({ error: 'severity must be INFO|WARN|ALERT|CRITICAL' }, { status: 400 });
  }

  const alert = {
    id: crypto.randomUUID(),
    fromAgent: body.fromAgent,
    severity: body.severity ?? 'WARN',
    message: body.message,
    metadata: body.metadata ?? {},
    receivedAt: new Date().toISOString(),
  };

  // Log to observations table
  try {
    await supabaseClient.from('observations').insert([{
      session_id: 'watcher',
      event_type: `alert.${alert.severity.toLowerCase()}`,
      summary: `[${body.fromAgent}] ${body.message}`,
      data: alert,
    }]);
  } catch { /* DB unavailable, log to console */ }

  if (alert.severity === 'CRITICAL') {
    console.error('[LA VIGILANTE — CRÍTICO]', alert);
  } else {
    console.warn('[La Vigilante]', alert.severity, '|', body.fromAgent, '|', body.message);
  }

  return NextResponse.json({ ok: true, alertId: alert.id });
}
