import { NextResponse } from "next/server";

/**
 * GET /api/integrations/status — check which integrations have env vars set
 */
export const dynamic = "force-dynamic";

const ENV_MAP: Record<string, string> = {
  mercadopago: "MERCADOPAGO_ACCESS_TOKEN",
  oxxo:        "MERCADOPAGO_ACCESS_TOKEN",
  spei:        "MERCADOPAGO_ACCESS_TOKEN",
  mxnb:        "BITSO_API_KEY",
  stripe:      "STRIPE_SECRET_KEY",
  paypal:      "PAYPAL_CLIENT_ID",
  bitcoin:     "BTCPAY_URL",
  creem:       "CREEM_API_KEY",
  whatsapp:    "WHATSAPP_TOKEN",
  telegram:    "TELEGRAM_BOT_TOKEN",
  twilio:      "TWILIO_ACCOUNT_SID",
  github:      "GITHUB_TOKEN",
  notion:      "NOTION_TOKEN",
  gcal:        "GOOGLE_CLIENT_ID",
  zapier:      "ZAPIER_WEBHOOK_URL",
};

export async function GET() {
  const statuses: Record<string, "connected" | "not_set"> = {};

  for (const [id, envKey] of Object.entries(ENV_MAP)) {
    statuses[id] = process.env[envKey] ? "connected" : "not_set";
  }

  const connected = Object.values(statuses).filter((s) => s === "connected").length;

  return NextResponse.json({
    ok: true,
    statuses,
    connected_count: connected,
    total: Object.keys(ENV_MAP).length,
  });
}
