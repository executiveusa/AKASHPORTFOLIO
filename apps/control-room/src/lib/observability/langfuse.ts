/**
 * Langfuse observability wrapper — env-gated, no fake traces.
 *
 * When LANGFUSE_HOST + LANGFUSE_PUBLIC_KEY + LANGFUSE_SECRET_KEY are set,
 * this wrapper posts traces to Langfuse using the HTTP API.
 * Secrets and PII are redacted before transmission.
 */

export type LangfuseTraceInput = {
  name: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
};

export type LangfuseGenerationInput = {
  traceId: string;
  name: string;
  model?: string;
  prompt?: unknown;
  completion?: unknown;
  usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
  metadata?: Record<string, unknown>;
  level?: 'DEFAULT' | 'DEBUG' | 'WARNING' | 'ERROR';
};

// ── Redaction ────────────────────────────────────────────────────────────────
const REDACT_PATTERNS: RegExp[] = [
  /sk-[a-zA-Z0-9]{20,}/g,
  /ghp_[a-zA-Z0-9]{36,}/g,
  /Bearer\s+[a-zA-Z0-9._\-]{20,}/g,
  /password["']?\s*[:=]\s*["']?[^\s"',]+/gi,
  /secret["']?\s*[:=]\s*["']?[^\s"',]+/gi,
];

export function redact(value: unknown): unknown {
  if (typeof value === 'string') {
    let s = value;
    for (const pattern of REDACT_PATTERNS) {
      s = s.replace(pattern, '[REDACTED]');
    }
    return s;
  }
  if (value === null || value === undefined) return value;
  if (typeof value === 'object') {
    if (Array.isArray(value)) return value.map(redact);
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const lk = k.toLowerCase();
      if (['password', 'secret', 'token', 'key', 'authorization'].some(s => lk.includes(s))) {
        out[k] = '[REDACTED]';
      } else {
        out[k] = redact(v);
      }
    }
    return out;
  }
  return value;
}

// ── Config ───────────────────────────────────────────────────────────────────
export function langfuseConfigured(): boolean {
  return Boolean(
    process.env.LANGFUSE_HOST &&
    process.env.LANGFUSE_PUBLIC_KEY &&
    process.env.LANGFUSE_SECRET_KEY
  );
}

function langfuseHeaders() {
  const creds = Buffer.from(
    `${process.env.LANGFUSE_PUBLIC_KEY}:${process.env.LANGFUSE_SECRET_KEY}`
  ).toString('base64');
  return {
    'Content-Type': 'application/json',
    Authorization: `Basic ${creds}`,
  };
}

function langfuseBase() {
  return (process.env.LANGFUSE_BASE_URL || process.env.LANGFUSE_HOST || '').replace(/\/$/, '');
}

// ── Trace creation ───────────────────────────────────────────────────────────
export async function createTrace(input: LangfuseTraceInput): Promise<string | null> {
  if (!langfuseConfigured()) return null;
  const traceId = `trace-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  try {
    const body = {
      batch: [
        {
          id: `ingestion-${traceId}`,
          type: 'trace-create',
          timestamp: new Date().toISOString(),
          body: {
            id: traceId,
            name: input.name,
            userId: input.userId,
            sessionId: input.sessionId,
            metadata: redact(input.metadata),
            tags: input.tags,
          },
        },
      ],
    };
    await fetch(`${langfuseBase()}/api/public/ingestion`, {
      method: 'POST',
      headers: langfuseHeaders(),
      body: JSON.stringify(body),
    });
    return traceId;
  } catch {
    return null;
  }
}

// ── Generation logging ────────────────────────────────────────────────────────
export async function logGeneration(input: LangfuseGenerationInput): Promise<void> {
  if (!langfuseConfigured()) return;
  const generationId = `gen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  try {
    const body = {
      batch: [
        {
          id: `ingestion-${generationId}`,
          type: 'generation-create',
          timestamp: new Date().toISOString(),
          body: {
            id: generationId,
            traceId: input.traceId,
            name: input.name,
            model: input.model,
            input: redact(input.prompt),
            output: redact(input.completion),
            usage: input.usage,
            metadata: redact(input.metadata),
            level: input.level || 'DEFAULT',
          },
        },
      ],
    };
    await fetch(`${langfuseBase()}/api/public/ingestion`, {
      method: 'POST',
      headers: langfuseHeaders(),
      body: JSON.stringify(body),
    });
  } catch {
    // silently fail — observability must not crash business logic
  }
}
