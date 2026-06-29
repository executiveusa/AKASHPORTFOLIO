import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-client";

export const runtime = "edge";

export async function POST(req: Request) {
  let code: string;
  try {
    const body = await req.json();
    code = (body?.code ?? "").trim().toUpperCase();
  } catch {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  if (!code) return NextResponse.json({ valid: false });

  const now = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("invite_codes")
    .select("code, max_uses, uses, expires_at")
    .eq("code", code)
    .maybeSingle();

  if (error || !data) return NextResponse.json({ valid: false });
  if (data.expires_at && data.expires_at < now) return NextResponse.json({ valid: false });
  if (data.max_uses !== null && data.uses >= data.max_uses) return NextResponse.json({ valid: false });

  // Increment usage count (best-effort — don't fail the gate if this errors)
  await supabaseAdmin
    .from("invite_codes")
    .update({ uses: data.uses + 1 })
    .eq("code", code)
    .catch(() => {});

  return NextResponse.json({ valid: true });
}
