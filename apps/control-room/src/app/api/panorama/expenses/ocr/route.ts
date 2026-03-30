import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/panorama/expenses/ocr
 * Accepts: multipart/form-data with field "file" (image)
 * Returns: { amount, vendor, date } extracted by Claude vision
 */
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OCR service unavailable" }, { status: 503 });
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mediaType = (file.type || "image/jpeg") as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 256,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 },
            },
            {
              type: "text",
              text: 'Extract from this receipt: total amount (number only), vendor name, and date. Respond ONLY with JSON: {"amount": 123.45, "vendor": "Store Name", "date": "2026-03-30"}. If you cannot read a field, use null.',
            },
          ],
        }],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Vision API error" }, { status: 502 });
    }

    const data = await response.json();
    const text = data?.content?.[0]?.text ?? "{}";

    let extracted: { amount?: number; vendor?: string; date?: string } = {};
    try {
      extracted = JSON.parse(text);
    } catch {
      // If JSON parse fails, return partial
    }

    return NextResponse.json({ ok: true, ...extracted });
  } catch (err) {
    console.error("[expenses/ocr]", err);
    return NextResponse.json({ error: "OCR failed" }, { status: 500 });
  }
}
