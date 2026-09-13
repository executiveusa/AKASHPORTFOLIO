/**
 * POST /api/stream — token streaming via OpenRouter (free models by default).
 * Body: { prompt: string, model?: string, maxTokens?: number, system?: string }
 * Emits SSE `data: {"delta": "..."}` chunks and a final `data: {"done": true, "model": "..."}`.
 * Guarded (requireUser) + rate-limited. Replaces the old unguarded raw Anthropic proxy.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUser, toErrorResponse } from '@/lib/auth/guards';
import { checkRateLimit } from '@/lib/sanitize';
import { DEFAULT_MODEL, FREE_CHAIN, resolveModel, isFreeModel, paidAllowed } from '@/lib/models';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let user: { id?: string; email?: string } | undefined;
  try { user = (await requireUser()) as typeof user; } catch (e) { return toErrorResponse(e); }

  const clientId = user?.id || user?.email || req.headers.get('x-forwarded-for') || 'anonymous';
  if (!checkRateLimit(`stream:${clientId}`, 60).allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded (60/min)' }, { status: 429 });
  }

  let body: { prompt?: string; model?: string; maxTokens?: number; system?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const { prompt, maxTokens = 1000, system } = body;
  if (!prompt || typeof prompt !== 'string') return NextResponse.json({ error: 'prompt required' }, { status: 400 });

  const key = process.env.OPEN_ROUTER_API;
  if (!key) return NextResponse.json({ error: 'OPEN_ROUTER_API not configured' }, { status: 503 });

  const resolved = resolveModel(body.model);
  const model = paidAllowed(body.model) ? resolved : (isFreeModel(resolved) ? resolved : DEFAULT_MODEL);
  const candidates = isFreeModel(model) ? [model, ...FREE_CHAIN.filter((m) => m !== model)] : [model, ...FREE_CHAIN];

  const messages = [
    ...(system ? [{ role: 'system', content: system }] : []),
    { role: 'user', content: prompt },
  ];

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (obj: unknown) => controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`));
      for (const candidate of candidates) {
        try {
          const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${key}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://synthia.kupuri.media',
              'X-Title': 'SYNTHIA',
            },
            body: JSON.stringify({ model: candidate, messages, max_tokens: maxTokens, stream: true }),
            signal: AbortSignal.timeout(60_000),
          });
          if (!res.ok || !res.body) { continue; } // 429/404 on a free model → next candidate
          const reader = res.body.getReader();
          const dec = new TextDecoder();
          let buf = '';
          let emitted = false;
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += dec.decode(value, { stream: true });
            const lines = buf.split('\n'); buf = lines.pop() || '';
            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const data = line.slice(6).trim();
              if (!data || data === '[DONE]') continue;
              try {
                const j = JSON.parse(data) as { choices?: Array<{ delta?: { content?: string | null; reasoning?: string | null } }> };
                const delta = j.choices?.[0]?.delta?.content ?? '';
                if (delta) { emitted = true; send({ delta }); }
              } catch { /* skip malformed chunk */ }
            }
          }
          if (emitted) { send({ done: true, model: candidate, free: isFreeModel(candidate) }); controller.close(); return; }
        } catch { /* try next candidate */ }
      }
      send({ error: 'Todos los modelos fallaron. Intenta de nuevo.' });
      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
  });
}
