import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * GET /api/fleet — Aggregate fleet status from all agents
 */
export async function GET() {
  try {
    const supabase = getSupabase();
    if (!supabase) throw new Error("No Supabase config");

    // Try to pull live data from Supabase
    const { data: tasks } = await supabase
      .from("agent_tasks")
      .select("agent_id, status, created_at, result")
      .order("created_at", { ascending: false })
      .limit(100);

    // Aggregate by agent
    const agentMap = new Map<string, { completed: number; pending: number; lastAction: string }>();
    for (const t of tasks || []) {
      const current = agentMap.get(t.agent_id) || { completed: 0, pending: 0, lastAction: t.created_at };
      if (t.status === "completed") current.completed++;
      if (t.status === "pending") current.pending++;
      agentMap.set(t.agent_id, current);
    }

    const agents = [
      "alex", "seductora", "cazadora", "forjadora", "cultura",
      "teknos", "economia", "verdad", "guardian", "vigilante",
    ].map((id) => ({
      id,
      status: "active" as const,
      tasksCompleted: agentMap.get(id)?.completed || 0,
      tasksPending: agentMap.get(id)?.pending || 0,
      lastAction: agentMap.get(id)?.lastAction || new Date().toISOString(),
    }));

    return NextResponse.json({
      agents,
      totalActive: agents.length,
      timestamp: new Date().toISOString(),
    });
  } catch {
    // Fallback: return nominal status
    return NextResponse.json({
      agents: [
        "alex", "seductora", "cazadora", "forjadora", "cultura",
        "teknos", "economia", "verdad", "guardian", "vigilante",
      ].map((id) => ({
        id,
        status: "active",
        tasksCompleted: 0,
        tasksPending: 0,
        lastAction: new Date().toISOString(),
      })),
      totalActive: 10,
      timestamp: new Date().toISOString(),
    });
  }
}
