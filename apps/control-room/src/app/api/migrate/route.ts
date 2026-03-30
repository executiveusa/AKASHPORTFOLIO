/**
 * Database Migration Endpoint — ZTE Infrastructure Bootstrap
 *
 * POST /api/migrate
 * Creates required Supabase tables if they don't exist.
 * Protected by CRON_SECRET — run once on first deployment.
 *
 * Tables created:
 *  - ops_reports       (ZTE Stage 7 machine-readable reports)
 *  - telemetry_events  (observability events — cross-restart)
 *  - budget_daily      (STK: daily LLM spend survives cold starts)
 *  - budget_agent_daily (FLW: per-agent cost tracking)
 *  - mistake_log       (ZTE self-evolution: failure + fix pattern learning)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';

export const runtime = 'nodejs';

const MIGRATIONS: Array<{ name: string; sql: string }> = [
  {
    name: 'ops_reports',
    sql: `
      CREATE TABLE IF NOT EXISTS ops_reports (
        id                   BIGSERIAL PRIMARY KEY,
        bead_id              TEXT NOT NULL,
        agent_id             TEXT NOT NULL,
        task_summary         TEXT NOT NULL,
        status               TEXT NOT NULL CHECK (status IN ('success','failure','partial','halted')),
        risk_tier            TEXT NOT NULL CHECK (risk_tier IN ('LOW','MEDIUM','HIGH')),
        files_modified       JSONB DEFAULT '[]',
        tests_passed         BOOLEAN DEFAULT FALSE,
        cost_usd             NUMERIC(10,6) DEFAULT 0,
        duration_ms          BIGINT DEFAULT 0,
        errors               JSONB DEFAULT '[]',
        circuit_breakers_hit JSONB DEFAULT '[]',
        metadata             JSONB,
        created_at           TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS ops_reports_created_idx ON ops_reports (created_at DESC);
      CREATE INDEX IF NOT EXISTS ops_reports_agent_idx ON ops_reports (agent_id);
    `,
  },
  {
    name: 'telemetry_events',
    sql: `
      CREATE TABLE IF NOT EXISTS telemetry_events (
        id          BIGSERIAL PRIMARY KEY,
        event_type  TEXT NOT NULL,
        agent_id    TEXT DEFAULT 'system',
        severity    TEXT DEFAULT 'info',
        message     TEXT NOT NULL,
        metadata    JSONB,
        cost_usd    NUMERIC(10,6) DEFAULT 0,
        duration_ms BIGINT DEFAULT 0,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS telemetry_created_idx ON telemetry_events (created_at DESC);
    `,
  },
  {
    name: 'budget_daily',
    sql: `
      CREATE TABLE IF NOT EXISTS budget_daily (
        date         DATE PRIMARY KEY,
        total_usd    NUMERIC(10,6) DEFAULT 0,
        updated_at   TIMESTAMPTZ DEFAULT NOW()
      );
    `,
  },
  {
    name: 'budget_agent_daily',
    sql: `
      CREATE TABLE IF NOT EXISTS budget_agent_daily (
        agent_id    TEXT NOT NULL,
        date        DATE NOT NULL,
        total_usd   NUMERIC(10,6) DEFAULT 0,
        updated_at  TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (agent_id, date)
      );
      CREATE INDEX IF NOT EXISTS budget_agent_daily_date_idx ON budget_agent_daily (date DESC);
    `,
  },
  {
    name: 'mistake_log',
    sql: `
      CREATE TABLE IF NOT EXISTS mistake_log (
        id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        agent_id         TEXT NOT NULL,
        bead_id          TEXT,
        task_description TEXT,
        what_was_tried   TEXT,
        what_failed      TEXT,
        error_message    TEXT,
        fix_applied      TEXT,
        success_on_retry BOOLEAN,
        phase            TEXT,
        stage            TEXT,
        created_at       TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_mistake_log_agent   ON mistake_log (agent_id);
      CREATE INDEX IF NOT EXISTS idx_mistake_log_bead    ON mistake_log (bead_id);
      CREATE INDEX IF NOT EXISTS idx_mistake_log_phase   ON mistake_log (phase);
      CREATE INDEX IF NOT EXISTS idx_mistake_log_created ON mistake_log (created_at DESC);
    `,
  },
];

function verifyCronSecret(req: NextRequest): boolean {
  const auth = req.headers.get('authorization') ?? '';
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function POST(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: Array<{ name: string; status: 'ok' | 'error'; detail?: string }> = [];

  for (const migration of MIGRATIONS) {
    try {
      const { error } = await supabaseAdmin.rpc('exec_sql', { sql: migration.sql }).single();
      if (error) {
        // Supabase self-hosted may not have exec_sql RPC — try direct query
        throw new Error(error.message);
      }
      results.push({ name: migration.name, status: 'ok' });
    } catch (err) {
      // If exec_sql RPC isn't available, log the SQL for manual execution
      console.warn(`[migrate] Table ${migration.name}: ${(err as Error).message}`);
      console.log(`[migrate] Manual SQL for ${migration.name}:\n${migration.sql}`);
      results.push({ name: migration.name, status: 'error', detail: (err as Error).message });
    }
  }

  const allOk = results.every(r => r.status === 'ok');
  return NextResponse.json(
    { ok: allOk, results, note: allOk ? undefined : 'Some migrations failed — see server logs for manual SQL' },
    { status: allOk ? 200 : 207 }
  );
}

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Return the migration SQL for manual execution
  return NextResponse.json({
    tables: MIGRATIONS.map(m => ({ name: m.name, sql: m.sql.trim() })),
    note: 'Run each SQL statement against your Supabase instance to bootstrap the schema.',
  });
}
