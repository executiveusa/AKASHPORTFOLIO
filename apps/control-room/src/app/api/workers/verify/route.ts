/**
 * POST /api/workers/verify  — Submit a verification decision for a job photo set
 *
 * Body: { verification_id, status: 'approved' | 'rejected', reviewer_notes?: string }
 *
 * On approval, triggers payment record creation automatically.
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      verification_id: string;
      status: "approved" | "rejected";
      reviewer_notes?: string;
    };

    const { verification_id, status, reviewer_notes } = body;

    if (!verification_id || !status) {
      return NextResponse.json({ error: "verification_id and status are required" }, { status: 400 });
    }
    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json({ error: "status must be 'approved' or 'rejected'" }, { status: 400 });
    }

    const supabase = getSupabase();

    // Update verification record
    const { data: verification, error: verErr } = await supabase
      .from("verifications")
      .update({ status, reviewer_notes, reviewed_at: new Date().toISOString() })
      .eq("id", verification_id)
      .select("*, jobs(id, worker_id, amount_mxn)")
      .single();

    if (verErr) throw verErr;

    // On approval: create payment record if not exists
    if (status === "approved" && verification?.jobs) {
      const { jobs } = verification as { jobs: { id: string; worker_id: string; amount_mxn: number } };

      // Update job status to awaiting-payment
      await supabase
        .from("jobs")
        .update({ status: "awaiting-verification" })
        .eq("id", jobs.id);

      // Upsert payment record
      const { error: payErr } = await supabase
        .from("payments")
        .upsert(
          {
            job_id: jobs.id,
            worker_id: jobs.worker_id,
            amount_mxn: jobs.amount_mxn,
            status: "approved",
            verification_id,
            created_at: new Date().toISOString(),
          },
          { onConflict: "job_id" }
        );
      if (payErr) throw payErr;
    }

    return NextResponse.json({ verification, payment_created: status === "approved" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
