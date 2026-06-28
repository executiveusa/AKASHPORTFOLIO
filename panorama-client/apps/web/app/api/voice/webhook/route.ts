import { NextRequest, NextResponse } from "next/server";
import { parseVoiceCommand } from "@/lib/voice-commands";
import { createClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-vapi-secret");
  if (secret !== process.env.VAPI_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { transcript?: string; call?: { metadata?: { locale?: string; boardId?: string } } };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const transcript = body.transcript;
  if (!transcript) {
    return NextResponse.json({ ok: true, action: "none" });
  }

  const locale = (body.call?.metadata?.locale ?? "es") as "en" | "es";
  const boardId = body.call?.metadata?.boardId;

  const intent = parseVoiceCommand(transcript, locale);

  // Relay high-confidence intents to Rust API
  if (intent.confidence >= 0.7 && boardId) {
    const apiUrl = process.env.PANORAMA_API_URL;
    if (apiUrl) {
      await fetch(`${apiUrl}/api/voice/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.PANORAMA_API_SECRET ?? ""}` },
        body: JSON.stringify({ intent, board_id: boardId, locale }),
      }).catch(() => {});
    }
  }

  return NextResponse.json({ ok: true, intent });
}
