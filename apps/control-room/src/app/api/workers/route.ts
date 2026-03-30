/**
 * GET  /api/workers       — List workers (with optional status filter)
 * POST /api/workers       — Create a new worker profile
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
      .from("workers")
      .select("*")
      .order("reliability_score", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ workers: data ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      name: string;
      phone: string;
      colonia: string;
      specialties: string[];
      payment_method: "cash" | "mercadopago" | "bank";
    };

    const { name, phone, colonia, specialties, payment_method } = body;
    if (!name || !phone) {
      return NextResponse.json({ error: "name and phone are required" }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("workers")
      .insert({
        name,
        phone,
        colonia,
        specialties: specialties ?? [],
        payment_method: payment_method ?? "cash",
        status: "active",
        reliability_score: 50,
        jobs_completed: 0,
        volunteer_hours: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ worker: data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
