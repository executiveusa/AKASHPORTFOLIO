/**
 * GET  /api/workers/jobs        — List all jobs
 * POST /api/workers/jobs        — Create a new job
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars missing");
  return createClient(url, key);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const worker_id = searchParams.get("worker_id");

    const supabase = getSupabase();
    let query = supabase
      .from("jobs")
      .select("*, job_phases(*)")
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);
    if (worker_id) query = query.eq("worker_id", worker_id);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ jobs: data ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      title: string;
      description: string;
      address: string;
      worker_id: string;
      amount_mxn: number;
      scheduled_date: string;
      phases: { name: string; order_index: number }[];
    };

    const { title, description, address, worker_id, amount_mxn, scheduled_date, phases } = body;

    if (!title || !worker_id || !amount_mxn) {
      return NextResponse.json({ error: "title, worker_id, and amount_mxn are required" }, { status: 400 });
    }

    const supabase = getSupabase();

    const { data: job, error: jobErr } = await supabase
      .from("jobs")
      .insert({ title, description, address, worker_id, amount_mxn, scheduled_date, status: "pending" })
      .select()
      .single();

    if (jobErr) throw jobErr;

    if (phases?.length) {
      const phaseRows = phases.map(p => ({
        job_id: job.id,
        name: p.name,
        order_index: p.order_index,
        status: "pending",
      }));
      const { error: phaseErr } = await supabase.from("job_phases").insert(phaseRows);
      if (phaseErr) throw phaseErr;
    }

    return NextResponse.json({ job }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
