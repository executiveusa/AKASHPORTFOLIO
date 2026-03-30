import { NextRequest, NextResponse } from "next/server";

/**
 * GET  /api/panorama/projects — list projects
 * POST /api/panorama/projects — create project
 */
export const dynamic = "force-dynamic";

// In-memory MVP store (replace with Supabase)
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

export async function GET() {
  return NextResponse.json({ ok: true, projects: PROJECTS.slice().reverse() });
}

export async function POST(req: NextRequest) {
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

  PROJECTS.push(project);

  return NextResponse.json({ ok: true, project }, { status: 201 });
}
