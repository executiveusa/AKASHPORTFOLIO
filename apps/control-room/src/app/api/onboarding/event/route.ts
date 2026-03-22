/**
 * POST /api/onboarding/event
 *
 * Viral-scale beacon endpoint for the Kupuri onboarding flipbook.
 * Runs at Vercel Edge (global, near-zero cold start, unlimited concurrent).
 *
 * Called via navigator.sendBeacon — no response body is read by the client.
 * Always returns 204. Input errors are silently swallowed (no user-visible failure).
 *
 * Security (Tablet VII): Raw IPs never stored. Hashed with SHA-256 + salt.
 * Validation: event type is allowlist-checked. All strings are truncated.
 */

import { NextRequest } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const ALLOWED_EVENTS = new Set(['view', 'stage_change', 'lang_toggle', 'complete']);

/** SHA-256 hex of `value` — runs in Web Crypto (edge-compatible) */
async function sha256hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function POST(req: NextRequest): Promise<Response> {
  const NO_CONTENT = new Response(null, { status: 204 });

  // ── 1. Parse body ────────────────────────────────────────────────────────
  let body: Record<string, unknown> = {};
  try {
    const ct = req.headers.get('content-type') ?? '';
    const raw = await req.text();
    if (!raw) return NO_CONTENT;
    body = ct.includes('json') ? JSON.parse(raw) : JSON.parse(raw); // beacon sends JSON text/plain
  } catch {
    return NO_CONTENT; // Malformed payload — drop silently
  }

  // ── 2. Validate event type (allowlist — Tablet VII) ──────────────────────
  const eventType = typeof body.event === 'string' ? body.event : '';
  if (!ALLOWED_EVENTS.has(eventType)) return NO_CONTENT;

  // ── 3. Sanitise fields ───────────────────────────────────────────────────
  const sessionId = String(body.sessionId ?? '').replace(/[^a-zA-Z0-9\-_]/g, '').slice(0, 36);
  const lang      = body.lang === 'en' ? 'en' : 'es';
  const stage     = typeof body.stage === 'number' && body.stage >= 0 && body.stage <= 3
    ? body.stage
    : null;
  const ts = typeof body.ts === 'number' && body.ts > 0
    ? new Date(body.ts).toISOString()
    : new Date().toISOString();

  // ── 4. Privacy-safe IP hash ───────────────────────────────────────────────
  const rawIp = (req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim();
  const ipHash = await sha256hex(rawIp + (process.env.IP_HASH_SALT ?? 'kupuri-salt'));

  // ── 5. Write to Supabase via REST (no SDK import — fully edge-safe) ───────
  const supabaseUrl = (process.env.SUPABASE_URL ?? 'http://31.220.58.212:8001').replace(/\/$/, '');
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

  if (serviceKey) {
    // Fire-and-forget: we do NOT await this — beacon semantics
    fetch(`${supabaseUrl}/rest/v1/onboarding_events`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${serviceKey}`,
        apikey:          serviceKey,
        Prefer:          'return=minimal',
      },
      body: JSON.stringify({ session_id: sessionId, event_type: eventType, stage, lang, ip_hash: ipHash, ts }),
    }).catch(() => { /* absorb errors — never let analytics crash the response */ });
  }

  return NO_CONTENT;
}

/** OPTIONS for CORS preflight (some browsers send this before beacon) */
export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age':       '86400',
    },
  });
}
