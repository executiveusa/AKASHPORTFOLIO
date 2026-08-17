import { NextRequest, NextResponse } from "next/server";
import { requireOperatorOrAdmin, toErrorResponse } from '@/lib/auth/guards';

/**
 * GET  /api/panorama/projects — list projects
 * POST /api/panorama/projects — create project
 *
 * Persistence: Supabase (panorama_projects table) when configured.
 * Falls back to an in-memory store when SUPABASE_URL is unset so the
 * feature remains usable in dev/preview. The fallback is explicitly
 * non-canonical — data does not survive cold starts. Run
 * supabase/migrations/011_panorama_projects.sql to enable persistence.
 */
export const dynamic = "force-dynamic";

// In-memory fallback store (non-canonical; used only when Supabase is unconfigured)
const PROJECTS: Array<{
  id: string;
  name: string;
  sponsor: string;
  business_case?: string;
  objectives?: string;
  stakeholders?: string;
  wbs?: string[];
  milestones?: { label: string; date: string }[];
  risks?: { desc: string; level: string }[];
  phase: string;
  progress: number;
  risk_level: string;
  created_at: string;
}> = [];

async function getProjectsTable() {
  try {
    const { supabaseAdmin } = await import('@/lib/supabase-client');
    // Probe: if supabaseAdmin is the no-op stub client, treat as unconfigured
    const probe = await supabaseAdmin.from('panorama_projects').select('id').limit(1);
    if (probe.error) return null; // table missing or client is stub -> fallback
    return supabaseAdmin;
  } catch {
    return null;
  }
}

export async function GET() {
  try { await requireOperatorOrAdmin(); } catch (e) { return toErrorResponse(e); }

  const db = await getProjectsTable();
  if (db) {
    const { data, error } = await db.from('panorama_projects')
      .select('*').order('created_at', { ascending: false });
    if (error) {
      return NextResponse.json({ ok: false, error: 'DB_QUERY_FAILED', detail: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, projects: data ?? [], source: 'supabase' });
  }
  return NextResponse.json({ ok: true, projects: PROJECTS.slice().reverse(), source: 'memory-fallback' });
}

export async function POST(req: NextRequest) {
  try { await requireOperatorOrAdmin(); } catch (e) { return toErrorResponse(e); }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.name) {
    return NextResponse.json({ error: "name required" }, { status: 422 });
  }

  const risks = Array.isArray(body.risks) ? body.risks : [];
  const highRisks = risks.filter((r: { level?: string }) => r.level === "high").length;

  const project = {
    id: crypto.randomUUID(),
    name: String(body.name),
    sponsor: String(body.sponsor ?? "Ivette"),
    business_case: body.business_case ? String(body.business_case) : undefined,
    objectives: body.objectives ? String(body.objectives) : undefined,
    stakeholders: body.stakeholders ? String(body.stakeholders) : undefined,
    wbs: Array.isArray(body.wbs) ? body.wbs.filter(Boolean) : [],
    milestones: Array.isArray(body.milestones) ? body.milestones : [],
    risks,
    phase: "iniciacion",
    progress: 0,
    risk_level: highRisks > 1 ? "high" : highRisks === 1 ? "medium" : "low",
    created_at: new Date().toISOString(),
  };

  const db = await getProjectsTable();
  if (db) {
    const { data, error } = await db.from('panorama_projects').insert(project).select().single();
    if (error) {
      return NextResponse.json({ ok: false, error: 'DB_INSERT_FAILED', detail: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, project: data, source: 'supabase' }, { status: 201 });
  }

  PROJECTS.push(project);
  return NextResponse.json({ ok: true, project, source: 'memory-fallback' }, { status: 201 });
}
