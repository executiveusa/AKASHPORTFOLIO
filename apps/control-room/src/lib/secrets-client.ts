/**
 * secrets-client.ts — Kupuri Media™ / SYNTHIA™ Secrets Layer
 * Bead B0: Central secrets resolver. Reads from process.env (populated by
 * Infisical CLI sync or Vercel env inject). Falls back gracefully to local
 * .env values. Never logs secret values — only key names.
 *
 * Usage:
 *   import { secrets } from '@/lib/secrets-client';
 *   const key = secrets.elevenLabsApiKey();
 */

function required(key: string, fallback?: string): string {
  const val = process.env[key] ?? fallback ?? '';
  if (!val && process.env.NODE_ENV === 'production') {
    // Log key name only — never value
    console.error(`[secrets-client] MISSING required secret: ${key}`);
  }
  return val;
}

export const secrets = {
  // ── ElevenLabs ──────────────────────────────────────────────────────────
  elevenLabsApiKey: () =>
    required('ELEVEN_LABS_API', process.env.ELEVENLABS_API_KEY),

  // ── VAPI ────────────────────────────────────────────────────────────────
  vapiPrivateKey: () => required('VAPI_PRIVATE_KEY'),
  vapiPublicKey: () => required('VAPI_PUBLIC_KEY'),

  // ── Mercury 2 / Inception API ───────────────────────────────────────────
  mercuryApiKey: () =>
    required('INCEPTION_MERCURY2_API_TOKEN', process.env.MERCURY2_API_TOKEN),

  // ── OpenRouter (primary LLM gateway) ────────────────────────────────────
  openRouterApiKey: () => required('OPEN_ROUTER_API'),

  // ── Anthropic (fallback) ─────────────────────────────────────────────────
  anthropicApiKey: () => required('ANTHROPIC_API_KEY'),

  // ── Supabase (self-hosted VPS) ───────────────────────────────────────────
  supabaseUrl: () =>
    required('NEXT_PUBLIC_SUPABASE_URL', 'http://31.220.58.212:8001'),
  supabaseAnonKey: () => required('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  supabaseServiceKey: () => required('SUPABASE_SERVICE_ROLE_KEY'),

  // ── Coolify ──────────────────────────────────────────────────────────────
  coolifyToken: () =>
    required('COOLIFY_API_TOKEN', process.env.COOLIFY_CLOUD_TOKEN),
  coolifyBaseUrl: () =>
    required('COOLIFY_BASE_URL', 'http://31.220.58.212:8000'),

  // ── Hostinger ────────────────────────────────────────────────────────────
  hostingerToken: () => required('HOSTINGER_API_TOKEN'),

  // ── Vercel ────────────────────────────────────────────────────────────────
  vercelToken: () => required('VERCEL_TOKEN'),
  vercelOrgId: () => required('VERCEL_ORG_ID'),

  // ── Stripe ───────────────────────────────────────────────────────────────
  stripeSecretKey: () => required('STRIPE_SECRET_KEY'),

  // ── GitHub ───────────────────────────────────────────────────────────────
  githubPat: () => required('GH_PAT'),

  // ── Infisical ────────────────────────────────────────────────────────────
  infisicalToken: () => required('INFISICAL_TOKEN'),
  infisicalOrgId: () =>
    required('INFISICAL_ORG_ID', 'bdfc227f-410f-4b15-a0d6-63d1c99472d2'),
} as const;

export type SecretKey = keyof typeof secrets;
