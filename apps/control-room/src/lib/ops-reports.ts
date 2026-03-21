/**
 * ops/reports writer — ZTE Stage 7 compliance
 *
 * Every ZTE task emits a machine-readable JSON report so a zero-context
 * agent can continue the work without asking questions.
 *
 * Report file: ops/reports/{bead_id}_{status}.json
 *
 * Written to the filesystem (Vercel: use /tmp; self-hosted: repo root).
 * Format mirrors ZTE communication protocol spec.
 */

import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ZTEStage =
  | 'CONTEXT_LOAD'
  | 'PLAN'
  | 'IMPLEMENT'
  | 'TEST'
  | 'COMMIT'
  | 'DEPLOY'
  | 'VERIFY'
  | 'NOTIFY';

export type ZTEStatus = 'IN_PROGRESS' | 'COMPLETE' | 'FAILED' | 'HALTED';

export interface OpsReport {
  bead_id: string;
  task_name: string;
  stage: ZTEStage;
  status: ZTEStatus;
  started_at: string;
  completed_at?: string;
  elapsed_seconds?: number;
  cost_used_usd: number;
  last_action: string;
  next_action: string;
  blockers: string[];
  files_changed: string[];
  tests_run: number;
  tests_passed: number;
  deployment_url?: string;
  notes?: string;
  // Systems scoring (Meadows 12-axis) — optional, filled when available
  systems_score?: {
    STK?: number; FLW?: number; FBK?: number; DLY?: number;
    LVR?: number; RSL?: number; VIS?: number; AGT?: number;
    BLR?: number; LRN?: number; SEC?: number; DOC?: number;
    overall?: number;
  };
}

// ---------------------------------------------------------------------------
// Report directory
// ---------------------------------------------------------------------------

const REPORTS_DIR = process.env.OPS_REPORTS_DIR ?? (
  // Vercel / serverless environments: write to /tmp (ephemeral but available)
  // Self-hosted / local: write to repo root ops/reports
  typeof process !== 'undefined' && process.env.VERCEL
    ? '/tmp/ops-reports'
    : path.join(process.cwd(), 'ops', 'reports')
);

function ensureDir(): void {
  try {
    if (!fs.existsSync(REPORTS_DIR)) {
      fs.mkdirSync(REPORTS_DIR, { recursive: true });
    }
  } catch {
    // Filesystem may be read-only in some serverless envs — log only
    console.warn(`[ops-reports] Cannot create dir ${REPORTS_DIR}`);
  }
}

// ---------------------------------------------------------------------------
// Write / update a report
// ---------------------------------------------------------------------------

export function writeReport(report: OpsReport): string {
  const filename = `${report.bead_id}_${report.status.toLowerCase()}.json`;
  const filepath = path.join(REPORTS_DIR, filename);
  ensureDir();

  const content = JSON.stringify(
    { ...report, _written_at: new Date().toISOString() },
    null,
    2
  );

  try {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`[ops-reports] ✅ Report written: ${filepath}`);
  } catch (err) {
    // Filesystem may be read-only in edge runtime — log to stdout as fallback
    console.log(`[ops-reports] REPORT_JSON: ${content}`);
  }

  return filepath;
}

// ---------------------------------------------------------------------------
// Convenience: start a report at Stage 0
// ---------------------------------------------------------------------------

export function startReport(beadId: string, taskName: string): OpsReport {
  const report: OpsReport = {
    bead_id: beadId,
    task_name: taskName,
    stage: 'CONTEXT_LOAD',
    status: 'IN_PROGRESS',
    started_at: new Date().toISOString(),
    cost_used_usd: 0,
    last_action: 'Context loading',
    next_action: 'Plan',
    blockers: [],
    files_changed: [],
    tests_run: 0,
    tests_passed: 0,
  };
  writeReport(report);
  return report;
}

// ---------------------------------------------------------------------------
// Convenience: complete a report at Stage 7
// ---------------------------------------------------------------------------

export function completeReport(
  report: OpsReport,
  opts: {
    deploymentUrl?: string;
    filesChanged?: string[];
    testsRun?: number;
    testsPassed?: number;
    costUsd?: number;
    notes?: string;
  } = {}
): OpsReport {
  const startedAt = new Date(report.started_at).getTime();
  const now = Date.now();
  const completed: OpsReport = {
    ...report,
    stage: 'NOTIFY',
    status: 'COMPLETE',
    completed_at: new Date().toISOString(),
    elapsed_seconds: Math.round((now - startedAt) / 1000),
    deployment_url: opts.deploymentUrl,
    files_changed: opts.filesChanged ?? report.files_changed,
    tests_run: opts.testsRun ?? report.tests_run,
    tests_passed: opts.testsPassed ?? report.tests_passed,
    cost_used_usd: opts.costUsd ?? report.cost_used_usd,
    notes: opts.notes,
    last_action: 'Task complete',
    next_action: 'None',
    blockers: [],
  };
  writeReport(completed);
  return completed;
}

// ---------------------------------------------------------------------------
// Convenience: fail a report
// ---------------------------------------------------------------------------

export function failReport(
  report: OpsReport,
  reason: string,
  stage: ZTEStage = report.stage
): OpsReport {
  const failed: OpsReport = {
    ...report,
    stage,
    status: 'FAILED',
    completed_at: new Date().toISOString(),
    blockers: [reason],
    last_action: `Failed: ${reason}`,
    next_action: 'Manual review required',
  };
  writeReport(failed);
  return failed;
}

// ---------------------------------------------------------------------------
// List recent reports (for cockpit display)
// ---------------------------------------------------------------------------

export function listReports(limit = 20): OpsReport[] {
  ensureDir();
  try {
    const files = fs.readdirSync(REPORTS_DIR)
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse()
      .slice(0, limit);

    return files.map(f => {
      try {
        return JSON.parse(fs.readFileSync(path.join(REPORTS_DIR, f), 'utf8')) as OpsReport;
      } catch {
        return null;
      }
    }).filter(Boolean) as OpsReport[];
  } catch {
    return [];
  }
}
