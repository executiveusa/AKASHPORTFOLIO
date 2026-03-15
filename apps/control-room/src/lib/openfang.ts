/**
 * OpenFang Agent OS — Client Library for Synthia 3.0
 *
 * OpenFang is a Rust-based Agent Operating System (https://github.com/RightNow-AI/openfang)
 * that runs as an autonomous daemon and exposes 140+ REST/WebSocket/SSE endpoints.
 *
 * This library wraps the OpenFang REST API so every Synthia agent can:
 *  - Deploy and trigger pre-built "Hands" (Clip, Lead, Collector, Predictor, Researcher, Twitter, Browser)
 *  - Deliver messages via 40 channel adapters (WhatsApp, Telegram, Discord, Slack, Email, …)
 *  - Query the agent vector memory store
 *  - Use 53 built-in tools autonomously on a schedule
 *
 * SECURITY: Credentials read from environment variables only. Never hardcode.
 * DEPLOYMENT: Run `openfang start` to launch the daemon (default: http://localhost:4200).
 *             In production set OPENFANG_BASE_URL to the container's internal URL.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type HandType =
  | 'clip'        // Video: YouTube → vertical short + captions + voiceover   (Lapina TikTok)
  | 'lead'        // Daily ICP-matched prospect discovery + scoring             (Clandestino)
  | 'collector'   // OSINT monitoring, change detection, knowledge graphs       (Morpho)
  | 'predictor'   // Superforecasting engine with calibrated reasoning          (Council + Morpho)
  | 'researcher'  // Deep autonomous research with source credibility scoring   (All agents)
  | 'twitter'     // Autonomous social posting with mandatory approval gates    (Lapina sub-agents)
  | 'browser';    // Web automation: competitor research, lead capture          (Indigo)

export type ChannelPlatform =
  | 'whatsapp'
  | 'telegram'
  | 'discord'
  | 'slack'
  | 'email'
  | 'signal'
  | 'matrix'
  | 'teams'
  | string; // OpenFang supports 40+ platforms

export interface OpenFangStatus {
  installed: boolean;
  running: boolean;
  version?: string;
  handsDeployed?: number;
  installCommand?: string;
}

export interface HandConfig {
  /** Human-readable name for this Hand instance */
  name: string;
  /** Which LLM provider to use (default: whatever is configured in openfang init) */
  llmProvider?: string;
  /** Cron schedule for autonomous execution, e.g. "0 9 * * 1-5" */
  schedule?: string;
  /** Hand-specific configuration (ICP criteria for Lead, source URL for Clip, etc.) */
  params?: Record<string, unknown>;
}

export interface HandInstance {
  id: string;
  type: HandType;
  name: string;
  status: 'idle' | 'running' | 'scheduled' | 'error';
  schedule?: string;
  lastRun?: string;
  nextRun?: string;
}

export interface HandRunResult {
  handId: string;
  success: boolean;
  output?: unknown;
  error?: string;
  durationMs?: number;
  artifacts?: string[]; // file paths produced (videos, reports, etc.)
}

export interface ChannelSendResult {
  success: boolean;
  platform: ChannelPlatform;
  messageId?: string;
  error?: string;
}

export interface MemoryQueryResult {
  agentId: string;
  results: Array<{
    content: string;
    similarity: number;
    timestamp: string;
    metadata?: Record<string, unknown>;
  }>;
}

// ─── Config ───────────────────────────────────────────────────────────────────

function getConfig() {
  const baseUrl = process.env.OPENFANG_BASE_URL ?? 'http://localhost:4200';
  const apiKey  = process.env.OPENFANG_API_KEY;
  return { baseUrl, apiKey };
}

function buildHeaders(): Record<string, string> {
  const { apiKey } = getConfig();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
  return headers;
}

// ─── Status ───────────────────────────────────────────────────────────────────

/**
 * Check whether the OpenFang daemon is running and reachable.
 * Safe to call at any time — always returns a result, never throws.
 */
export async function getOpenFangStatus(): Promise<OpenFangStatus> {
  const { baseUrl } = getConfig();
  try {
    const res = await fetch(`${baseUrl}/api/v1/health`, {
      headers: buildHeaders(),
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) {
      return { installed: true, running: false };
    }
    const data = await res.json().catch(() => ({}));
    return {
      installed: true,
      running: true,
      version: data.version,
      handsDeployed: data.agents ?? data.hands ?? 0,
    };
  } catch {
    return {
      installed: false,
      running: false,
      installCommand: 'curl -fsSL https://openfang.sh/install | sh && openfang init && openfang start',
    };
  }
}

// ─── Hands ────────────────────────────────────────────────────────────────────

/**
 * List all deployed Hand instances.
 */
export async function listHands(): Promise<HandInstance[]> {
  const { baseUrl } = getConfig();
  try {
    const res = await fetch(`${baseUrl}/api/v1/agents`, { headers: buildHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    // OpenFang returns agents array; normalize to our HandInstance shape
    const agents: Record<string, unknown>[] = data.agents ?? data.data ?? data ?? [];
    return agents.map((a: Record<string, unknown>) => ({
      id:       String(a.id ?? ''),
      type:     (a.type ?? a.hand_type ?? 'researcher') as HandType,
      name:     String(a.name ?? ''),
      status:   (a.status ?? 'idle') as HandInstance['status'],
      schedule: a.schedule as string | undefined,
      lastRun:  a.last_run as string | undefined,
      nextRun:  a.next_run as string | undefined,
    }));
  } catch (err) {
    console.warn('[OpenFang] listHands failed:', err);
    return [];
  }
}

/**
 * Deploy a pre-built Hand (Clip, Lead, Collector, etc.) with a given configuration.
 * Returns the new Hand instance ID.
 */
export async function deployHand(type: HandType, config: HandConfig): Promise<HandInstance | null> {
  const { baseUrl } = getConfig();
  try {
    const res = await fetch(`${baseUrl}/api/v1/agents`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ hand_type: type, ...config }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`HTTP ${res.status}: ${JSON.stringify(err)}`);
    }
    const data = await res.json();
    return {
      id:      String(data.id ?? data.agent_id ?? ''),
      type,
      name:    config.name,
      status:  'idle',
      schedule: config.schedule,
    };
  } catch (err) {
    console.error('[OpenFang] deployHand failed:', err);
    return null;
  }
}

/**
 * Trigger a deployed Hand to run immediately with an optional input payload.
 * Long-running — Hands can take minutes; use webhooks/SSE for real-time updates.
 */
export async function triggerHand(handId: string, input?: Record<string, unknown>): Promise<HandRunResult> {
  const { baseUrl } = getConfig();
  try {
    const res = await fetch(`${baseUrl}/api/v1/agents/${handId}/run`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ input: input ?? {} }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { handId, success: false, error: `HTTP ${res.status}: ${JSON.stringify(err)}` };
    }
    const data = await res.json();
    return {
      handId,
      success:    true,
      output:     data.output ?? data.result,
      durationMs: data.duration_ms,
      artifacts:  data.artifacts ?? [],
    };
  } catch (err) {
    return { handId, success: false, error: String(err) };
  }
}

// ─── Channel Adapters ─────────────────────────────────────────────────────────

/**
 * Send a message to a contact via any of OpenFang's 40 channel adapters.
 *
 * CRITICAL USE CASE — IVETTE APPROVAL LOOP:
 *   sendChannel('whatsapp', '+521XXXXXXXXXX', 'Ivette, hay un lead calificado: …')
 *   sendChannel('telegram', '@ivette_handle', 'Aprobar post de TikTok? Responde SÍ/NO')
 *
 * The `to` field format depends on the platform:
 *   whatsapp / signal / sms → E.164 phone number (+521XXXXXXXXXX)
 *   telegram                → @username or chat_id
 *   discord                 → channel_id
 *   slack                   → #channel-name or @username
 *   email                   → email@domain.com
 */
export async function sendChannel(
  platform: ChannelPlatform,
  to: string,
  message: string,
  options?: { subject?: string; attachments?: string[] }
): Promise<ChannelSendResult> {
  const { baseUrl } = getConfig();
  try {
    const res = await fetch(`${baseUrl}/api/v1/channels/send`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ platform, to, message, ...options }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, platform, error: `HTTP ${res.status}: ${JSON.stringify(err)}` };
    }
    const data = await res.json();
    return { success: true, platform, messageId: data.message_id ?? data.id };
  } catch (err) {
    return { success: false, platform, error: String(err) };
  }
}

// ─── Memory ───────────────────────────────────────────────────────────────────

/**
 * Query an agent's vector memory store with a natural-language query.
 * Returns the top-k most similar past memories with similarity scores.
 */
export async function queryMemory(
  agentId: string,
  query: string,
  topK = 5
): Promise<MemoryQueryResult> {
  const { baseUrl } = getConfig();
  try {
    const res = await fetch(`${baseUrl}/api/v1/memory/${agentId}/query`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ query, top_k: topK }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      agentId,
      results: (data.results ?? data.memories ?? []).map((r: Record<string, unknown>) => ({
        content:    String(r.content ?? r.text ?? ''),
        similarity: Number(r.similarity ?? r.score ?? 0),
        timestamp:  String(r.timestamp ?? r.created_at ?? ''),
        metadata:   (r.metadata as Record<string, unknown>) ?? undefined,
      })),
    };
  } catch (err) {
    console.warn('[OpenFang] queryMemory failed:', err);
    return { agentId, results: [] };
  }
}
