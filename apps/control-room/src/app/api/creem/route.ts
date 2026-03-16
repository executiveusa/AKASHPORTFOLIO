import { NextRequest, NextResponse } from "next/server";
import { verifyCreemWebhook, parseCreemWebhookEvent } from "@/lib/creem-client";

/**
 * POST /api/creem — Creem.io webhook receiver
 * Handles checkout.completed, payment.succeeded, etc.
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-creem-signature") || "";

  // Verify webhook signature
  const valid = verifyCreemWebhook(body, signature);
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = parseCreemWebhookEvent(body);

  switch (event.type) {
    case "checkout.completed":
      console.log("[creem] Checkout completed:", event.data.checkoutId, event.data.amount);
      break;

    case "payment.succeeded":
      console.log("[creem] Payment succeeded:", event.data.amount, event.data.currency);
      break;

    case "payment.failed":
      console.log("[creem] Payment failed:", event.data.productId);
      break;

    default:
      console.log("[creem] Event:", event.type);
  }

  return NextResponse.json({ received: true });
}

/**
 * GET /api/creem — Status check
 */
export async function GET() {
  return NextResponse.json({
    status: "connected",
    provider: "creem.io",
    webhookActive: !!process.env.CREEM_WEBHOOK_SECRET,
    apiKeyConfigured: !!process.env.CREEM_API_KEY,
  });
}
