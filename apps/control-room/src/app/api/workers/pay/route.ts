/**
 * POST /api/workers/pay  — Execute or confirm a worker payment
 *
 * Body: { payment_id, action: 'approve' | 'mark_paid', notes?: string }
 *
 * approve:   moves status pending → approved
 * mark_paid: moves status approved → paid, records paid_at timestamp
 *            and updates job status to 'completed'
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

    const supabase = getSupabase();
    let query = supabase
      .from("payments")
      .select("*, workers(name, payment_method), jobs(title)")
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ payments: data ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      payment_id: string;
      action: "approve" | "mark_paid";
      notes?: string;
    };

    const { payment_id, action, notes } = body;

    if (!payment_id || !action) {
      return NextResponse.json({ error: "payment_id and action are required" }, { status: 400 });
    }
    if (action !== "approve" && action !== "mark_paid") {
      return NextResponse.json({ error: "action must be 'approve' or 'mark_paid'" }, { status: 400 });
    }

    const supabase = getSupabase();

    // Fetch existing payment
    const { data: existing, error: fetchErr } = await supabase
      .from("payments")
      .select("*")
      .eq("id", payment_id)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Gate checks
    if (action === "approve" && existing.status !== "pending") {
      return NextResponse.json({ error: "Only pending payments can be approved" }, { status: 409 });
    }
    if (action === "mark_paid" && existing.status !== "approved") {
      return NextResponse.json({ error: "Only approved payments can be marked paid" }, { status: 409 });
    }

    const update: Record<string, unknown> = {
      status: action === "approve" ? "approved" : "paid",
      notes: notes ?? existing.notes,
    };
    if (action === "mark_paid") {
      update.paid_at = new Date().toISOString();
    }

    const { data: payment, error: updateErr } = await supabase
      .from("payments")
      .update(update)
      .eq("id", payment_id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // On mark_paid: close the job
    if (action === "mark_paid" && existing.job_id) {
      await supabase
        .from("jobs")
        .update({ status: "completed" })
        .eq("id", existing.job_id);

      // Bump reliability_score +1 (capped at 100), jobs_completed +1
      const { data: worker } = await supabase
        .from("workers")
        .select("reliability_score, jobs_completed")
        .eq("id", existing.worker_id)
        .single();

      if (worker) {
        await supabase
          .from("workers")
          .update({
            jobs_completed: (worker.jobs_completed ?? 0) + 1,
            reliability_score: Math.min(100, (worker.reliability_score ?? 50) + 1),
          })
          .eq("id", existing.worker_id);
      }
    }

    return NextResponse.json({ payment });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
