/**
 * ops-report.ts — ZTE Stage 7 Machine-Readable Ops Reporter
 *
 * Writes structured JSON reports to Supabase `ops_reports` table.
 * Per ZTE Protocol: every WRITE→TEST→FIX→COMMIT→DEPLOY→VERIFY→NOTIFY cycle
 * MUST emit a completion report readable by La Vigilante and other agents.
 *
 * Conforms to: ZTE_AGENT_PERSONA.md Stage 7 NOTIFY requirement
 * Conforms to: SYNTHIA_SYSTEMS_FORCE_PROMPT (Information Flow — Meadows feedback loop)
 */

import { supabaseAdmin } from '@/lib/supabase-client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type OpsReportStatus = 'success' | 'failure' | 'partial' | 'halted';
export type RiskTier = 'LOW' | 'MEDIUM' | 'HIGH';

export interface OpsReport {
  bead_id: string;            // format: ZTE-YYYYMMDD-NNNN
  agent_id: string;            // sphere agent ID
  task_summary: string;        // one-sentence description
  status: OpsReportStatus;
  risk_tier: RiskTier;
  files_modified: string[];
  tests_passed: boolean;
  cost_usd: number;
  duration_ms: number;
  errors: string[];
  circuit_breakers_hit: string[]; // e.g. ["LOOP_GUARD", "COST_GUARD"]
  metadata?: Record<string, unknown>;
  created_at?: string;
}

// ---------------------------------------------------------------------------
// Write ops report to Supabase (non-throwing — never block the main task)
// ---------------------------------------------------------------------------

export async function writeOpsReport(report: Omit<OpsReport, 'created_at'>): Promise<void> {
  const row = {
    ...report,
    files_modified: JSON.stringify(report.files_modified),
    errors: JSON.stringify(report.errors),
    circuit_breakers_hit: JSON.stringify(report.circuit_breakers_hit),
    metadata: report.metadata ? JSON.stringify(report.metadata) : null,
    created_at: new Date().toISOString(),
  };

  try {
    const { error } = await supabaseAdmin
      .from('ops_reports')
      .insert(row);

    if (error) {
      console.warn('[ops-report] Failed to write report:', error.message);
    } else {
      console.log(`[ops-report] ✅ Report ${report.bead_id} written (${report.status})`);
    }
  } catch (err) {
    console.warn('[ops-report] Exception writing report:', (err as Error).message);
  }
}

// ---------------------------------------------------------------------------
// Read recent reports (for La Vigilante cockpit)
// ---------------------------------------------------------------------------

export async function readRecentReports(limit = 50): Promise<OpsReport[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('ops_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map((r: Record<string, unknown>) => ({
      bead_id: r.bead_id as string,
      agent_id: r.agent_id as string,
      task_summary: r.task_summary as string,
      status: r.status as OpsReportStatus,
      risk_tier: r.risk_tier as RiskTier,
      files_modified: safeParseArray(r.files_modified),
      tests_passed: r.tests_passed as boolean,
      cost_usd: r.cost_usd as number,
      duration_ms: r.duration_ms as number,
      errors: safeParseArray(r.errors),
      circuit_breakers_hit: safeParseArray(r.circuit_breakers_hit),
      metadata: r.metadata ? safeParse(r.metadata as string) : undefined,
      created_at: r.created_at as string,
    }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// SQL migration helper — run once to create the ops_reports table
// ---------------------------------------------------------------------------

export const OPS_REPORTS_MIGRATION = `
CREATE TABLE IF NOT EXISTS ops_reports (
  id              BIGSERIAL PRIMARY KEY,
  bead_id         TEXT NOT NULL,
  agent_id        TEXT NOT NULL,
  task_summary    TEXT NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('success','failure','partial','halted')),
  risk_tier       TEXT NOT NULL CHECK (risk_tier IN ('LOW','MEDIUM','HIGH')),
  files_modified  JSONB DEFAULT '[]',
  tests_passed    BOOLEAN DEFAULT FALSE,
  cost_usd        NUMERIC(10,6) DEFAULT 0,
  duration_ms     BIGINT DEFAULT 0,
  errors          JSONB DEFAULT '[]',
  circuit_breakers_hit JSONB DEFAULT '[]',
  metadata        JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ops_reports_agent_id_idx ON ops_reports(agent_id);
CREATE INDEX IF NOT EXISTS ops_reports_created_at_idx ON ops_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS ops_reports_status_idx ON ops_reports(status);
`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function safeParseArray(val: unknown): string[] {
  if (Array.isArray(val)) return val as string[];
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return []; }
  }
  return [];
}

function safeParse(val: string): Record<string, unknown> {
  try { return JSON.parse(val); } catch { return {}; }
}
