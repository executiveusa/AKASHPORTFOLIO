/**
 * LLM Gateway — Synthia™ Sphere OS
 *
 * Provider-agnostic LLM routing with budget guard and fallback chain.
 * Primary:  OpenRouter (OPEN_ROUTER_API) → anthropic/claude-3.5-sonnet
 * Fallback: Direct Anthropic SDK (ANTHROPIC_API_KEY) → claude-3-haiku-20240307
 * Legacy:   LiteLLM proxy (LITELLM_BASE_URL) — kept for compatibility
 * Guard:    LITELLM_DAILY_BUDGET_USD (default $20) circuit breaker
 */

import Anthropic from '@anthropic-ai/sdk';
import type { SphereAgentId } from '@/shared/council-events';

// ---------------------------------------------------------------------------
// OpenRouter model name mapping
// ---------------------------------------------------------------------------
function toOpenRouterModel(model: string): string {
  const map: Record<string, string> = {
    'claude-opus-4-5': 'anthropic/claude-3.5-sonnet',
    'claude-3-opus-20240229': 'anthropic/claude-3-opus',
    'claude-3-5-sonnet-20241022': 'anthropic/claude-3.5-sonnet',
    'claude-3-5-haiku-20241022': 'anthropic/claude-3.5-haiku',
    'claude-haiku-3-20240307': 'anthropic/claude-3-haiku',
    'claude-3-haiku-20240307': 'anthropic/claude-3-haiku',
    // SYNTHIA OS model aliases
    'claude-sonnet-4-6':         'anthropic/claude-3.5-sonnet',
    'claude-opus-4-6':           'anthropic/claude-opus-4-5',
    'claude-haiku-4-5-20251001': 'anthropic/claude-haiku-3-5',
  };
  return map[model] ?? model;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LLMCallOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  sphereId?: SphereAgentId; // for logging/telemetry
  taskId?: string;
}

export interface LLMResult {
  content: string;
  model: string;
  provider: 'litellm' | 'anthropic-direct' | 'stub';
  inputTokens?: number;
  outputTokens?: number;
  costEstimateUsd?: number;
}

// ---------------------------------------------------------------------------
// Daily spend tracker
// NOTE: In-memory resets on cold start (serverless). Acceptable for cost
// visibility; hard enforcement anchored by ZTE $10/task guard below.
// ---------------------------------------------------------------------------

const dailySpend = {
  date: '',
  totalUsd: 0,
};

function getDailyBudget(): number {
  return parseFloat(process.env.LITELLM_DAILY_BUDGET_USD || '20');
}

function recordSpend(usd: number) {
  const today = new Date().toISOString().split('T')[0];
  if (dailySpend.date !== today) {
    dailySpend.date = today;
    dailySpend.totalUsd = 0;
  }
  dailySpend.totalUsd += usd;
  persistBudgetAsync(today, dailySpend.totalUsd); // STK: survive cold-start resets
}

function isOverBudget(): boolean {
  return dailySpend.totalUsd >= getDailyBudget();
}

// ---------------------------------------------------------------------------
// STK: Supabase budget persistence — fire-and-forget
// ---------------------------------------------------------------------------

function persistBudgetAsync(date: string, totalUsd: number): void {
  (async () => {
    try {
      const { supabaseAdmin } = await import('@/lib/supabase-client');
      await supabaseAdmin
        .from('budget_daily')
        .upsert({ date, total_usd: totalUsd, updated_at: new Date().toISOString() }, { onConflict: 'date' });
    } catch { /* non-critical — in-memory value accurate for this invocation */ }
  })();
}

export async function getBudgetStatusAsync() {
  const today = new Date().toISOString().split('T')[0];
  let dbSpend = 0;
  try {
    const { supabaseAdmin } = await import('@/lib/supabase-client');
    const { data } = await supabaseAdmin
      .from('budget_daily')
      .select('total_usd')
      .eq('date', today)
      .single();
    dbSpend = (data as { total_usd?: number } | null)?.total_usd ?? 0;
  } catch { /* non-critical */ }
  const effectiveSpend = Math.max(dailySpend.totalUsd, dbSpend);
  const budget = getDailyBudget();
  return {
    dailyBudgetUsd: budget,
    spentTodayUsd: effectiveSpend,
    date: today,
    percentUsed: Math.round((effectiveSpend / budget) * 100),
    isOverBudget: effectiveSpend >= budget,
    perTaskMaxUsd: PER_TASK_MAX_USD,
    loopGuard: getLoopGuardStatus(),
    byAgent: { ...agentDailySpend },
    source: 'db' as const,
  };
}

// ---------------------------------------------------------------------------
// FLW: Per-agent cost tracking — in-memory + Supabase persistence
// ---------------------------------------------------------------------------

const agentDailySpend: Record<string, number> = {};

export function getAgentCosts(): Record<string, number> {
  return { ...agentDailySpend };
}

function trackAgentCost(agentId: string | undefined, usd: number): void {
  if (!agentId || usd <= 0) return;
  agentDailySpend[agentId] = (agentDailySpend[agentId] ?? 0) + usd;
  const today = new Date().toISOString().split('T')[0];
  (async () => {
    try {
      const { supabaseAdmin } = await import('@/lib/supabase-client');
      await supabaseAdmin
        .from('budget_agent_daily')
        .upsert(
          { agent_id: agentId, date: today, total_usd: agentDailySpend[agentId], updated_at: new Date().toISOString() },
          { onConflict: 'agent_id,date' }
        );
    } catch { /* non-critical */ }
  })();
}

// ---------------------------------------------------------------------------
// LOOP_GUARD — ZTE circuit breaker: halt after 3 consecutive provider errors
// ---------------------------------------------------------------------------

const loopGuard: Record<string, { count: number; lastError: string; haltedAt?: string }> = {};

const LOOP_GUARD_MAX = 3;

function recordProviderError(key: string, errMsg: string): void {
  if (!loopGuard[key]) loopGuard[key] = { count: 0, lastError: '' };
  loopGuard[key].count += 1;
  loopGuard[key].lastError = errMsg;
  if (loopGuard[key].count >= LOOP_GUARD_MAX) {
    loopGuard[key].haltedAt = new Date().toISOString();
    console.error(
      `[litellm-gateway] LOOP_GUARD TRIGGERED for "${key}": ` +
      `${LOOP_GUARD_MAX} consecutive failures. Last error: ${errMsg}. ` +
      `Call resetLoopGuard("${key}") to clear.`
    );
  }
}

function clearProviderError(key: string): void {
  delete loopGuard[key];
}

function isLoopGuardHalted(key: string): boolean {
  return (loopGuard[key]?.count ?? 0) >= LOOP_GUARD_MAX;
}

export function resetLoopGuard(key?: string): void {
  if (key) {
    delete loopGuard[key];
  } else {
    Object.keys(loopGuard).forEach(k => delete loopGuard[k]);
  }
}

export function getLoopGuardStatus(): Record<string, { count: number; lastError: string; haltedAt?: string }> {
  return { ...loopGuard };
}

// ---------------------------------------------------------------------------
// PER-TASK COST_GUARD — $10 max per single callLLM invocation
// ---------------------------------------------------------------------------

const PER_TASK_MAX_USD = parseFloat(process.env.ZTE_PER_TASK_BUDGET_USD || '10');

// Rough cost estimate: Claude Opus ~$15/Mtok in, $75/Mtok out
function estimateCost(inputTokens: number, outputTokens: number, model: string): number {
  if (model.includes('opus')) return (inputTokens * 15 + outputTokens * 75) / 1_000_000;
  if (model.includes('haiku')) return (inputTokens * 0.25 + outputTokens * 1.25) / 1_000_000;
  return (inputTokens * 3 + outputTokens * 15) / 1_000_000; // sonnet-class default
}

// ---------------------------------------------------------------------------
// Main LLM call function
// ---------------------------------------------------------------------------

export async function callLLM(
  messages: LLMMessage[],
  options: LLMCallOptions = {}
): Promise<LLMResult> {
  const {
    model = 'claude-opus-4-5',
    maxTokens = 1024,
    temperature = 0.7,
    sphereId,
    taskId,
  } = options;

  // COST_GUARD — daily budget circuit breaker
  if (isOverBudget()) {
    console.error(`[litellm-gateway] COST_GUARD: Daily budget $${getDailyBudget()} reached. Using stub.`);
    return stub(messages, 'COST_GUARD_TRIGGERED');
  }

  // LOOP_GUARD — halt if all providers have consecutive errors
  const guardKey = 'global';
  if (isLoopGuardHalted(guardKey)) {
    const status = loopGuard[guardKey];
    console.error(
      `[litellm-gateway] LOOP_GUARD active since ${status.haltedAt}. ` +
      `Call resetLoopGuard() to recover. Last error: ${status.lastError}`
    );
    return stub(messages, `LOOP_GUARD_TRIGGERED: ${status.lastError}`);
  }

  // PER-TASK cost guard — track cost within this single call
  let taskCostAccumulator = 0;

  // Route 1: OpenRouter (primary — OPEN_ROUTER_API)
  const openRouterKey = process.env.OPEN_ROUTER_API;
  if (openRouterKey) {
    const orModel = toOpenRouterModel(model);
    const result = await tryOpenRouter(messages, { model: orModel, maxTokens, temperature, sphereId }, openRouterKey);
    if (result) {
      taskCostAccumulator += result.costEstimateUsd ?? 0;
      if (taskCostAccumulator > PER_TASK_MAX_USD) {
        console.error(`[litellm-gateway] PER_TASK COST_GUARD: $${taskCostAccumulator.toFixed(4)} > $${PER_TASK_MAX_USD} limit`);
        return stub(messages, `PER_TASK_COST_GUARD: $${taskCostAccumulator.toFixed(4)}`);
      }
      trackAgentCost(sphereId, result.costEstimateUsd ?? 0); // FLW: per-agent cost tracking
      clearProviderError('openrouter');
      return result;
    }
    recordProviderError('openrouter', 'OpenRouter unreachable');
  }

  // Route 2: LiteLLM proxy (legacy compatibility)
  if (process.env.LITELLM_BASE_URL && process.env.LITELLM_MASTER_KEY &&
      process.env.LITELLM_MASTER_KEY !== 'your-litellm-master-key') {
    const result = await tryLiteLLM(messages, { model, maxTokens, temperature, sphereId });
    if (result) {
      trackAgentCost(sphereId, result.costEstimateUsd ?? 0); // FLW: per-agent cost tracking
      clearProviderError('litellm');
      return result;
    }
    recordProviderError('litellm', 'LiteLLM proxy unreachable');
  }

  // Route 3: Direct Anthropic SDK (fallback)
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    const fallbackModel = model.includes('opus') ? 'claude-3-haiku-20240307' : model;
    const result = await tryAnthropic(messages, { model: fallbackModel, maxTokens, temperature, sphereId });
    if (result) {
      trackAgentCost(sphereId, result.costEstimateUsd ?? 0); // FLW: per-agent cost tracking
      clearProviderError('anthropic');
      return result;
    }
    recordProviderError('anthropic', 'Anthropic SDK failed');
  }

  // All providers tried — record global failure
  recordProviderError(guardKey, 'all providers failed');
  return stub(messages, 'no-providers-configured');
}

// ---------------------------------------------------------------------------
// OpenRouter (primary)
// ---------------------------------------------------------------------------

async function tryOpenRouter(
  messages: LLMMessage[],
  opts: { model: string; maxTokens: number; temperature: number; sphereId?: SphereAgentId },
  apiKey: string,
): Promise<LLMResult | null> {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://dashboard-agent-swarm-eight.vercel.app',
        'X-Title': 'Synthia Sphere OS',
      },
      body: JSON.stringify({
        model: opts.model,
        messages,
        max_tokens: opts.maxTokens,
        temperature: opts.temperature,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`OpenRouter HTTP ${res.status}: ${errText.slice(0, 120)}`);
    }

    const data = await res.json() as {
      choices: Array<{ message: { content: string } }>;
      usage?: { prompt_tokens: number; completion_tokens: number };
      model?: string;
    };

    const content = data.choices[0]?.message?.content ?? '';
    const inputTokens = data.usage?.prompt_tokens ?? 0;
    const outputTokens = data.usage?.completion_tokens ?? 0;
    const costEstimateUsd = estimateCost(inputTokens, outputTokens, opts.model);
    recordSpend(costEstimateUsd);

    return {
      content,
      model: data.model ?? opts.model,
      provider: 'litellm', // reuse litellm discriminant to avoid breaking callers
      inputTokens,
      outputTokens,
      costEstimateUsd,
    };
  } catch (err) {
    console.warn('[llm-gateway] OpenRouter unreachable:', (err as Error).message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// LiteLLM proxy
// ---------------------------------------------------------------------------

async function tryLiteLLM(
  messages: LLMMessage[],
  opts: { model: string; maxTokens: number; temperature: number; sphereId?: SphereAgentId }
): Promise<LLMResult | null> {
  try {
    const res = await fetch(`${process.env.LITELLM_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LITELLM_MASTER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: opts.model,
        messages,
        max_tokens: opts.maxTokens,
        temperature: opts.temperature,
        metadata: opts.sphereId ? { sphere_id: opts.sphereId } : undefined,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) throw new Error(`LiteLLM HTTP ${res.status}`);

    const data = await res.json() as {
      choices: Array<{ message: { content: string } }>;
      usage?: { prompt_tokens: number; completion_tokens: number };
      model?: string;
    };

    const content = data.choices[0]?.message?.content ?? '';
    const inputTokens = data.usage?.prompt_tokens ?? 0;
    const outputTokens = data.usage?.completion_tokens ?? 0;
    const costEstimateUsd = estimateCost(inputTokens, outputTokens, opts.model);
    recordSpend(costEstimateUsd);

    return {
      content,
      model: data.model ?? opts.model,
      provider: 'litellm',
      inputTokens,
      outputTokens,
      costEstimateUsd,
    };
  } catch (err) {
    console.warn('[litellm-gateway] LiteLLM unreachable:', (err as Error).message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Direct Anthropic SDK
// ---------------------------------------------------------------------------

let _anthropicClient: Anthropic | null = null;

function getAnthropic(): Anthropic {
  if (!_anthropicClient) {
    _anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _anthropicClient;
}

async function tryAnthropic(
  messages: LLMMessage[],
  opts: { model: string; maxTokens: number; temperature: number; sphereId?: SphereAgentId }
): Promise<LLMResult | null> {
  try {
    const client = getAnthropic();

    // Separate system from conversation messages
    const systemMessages = messages.filter(m => m.role === 'system');
    const chatMessages = messages.filter(m => m.role !== 'system');

    const systemPrompt = systemMessages.map(m => m.content).join('\n\n');

    const response = await client.messages.create({
      model: opts.model,
      max_tokens: opts.maxTokens,
      system: systemPrompt || undefined,
      messages: chatMessages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    const content = response.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('');

    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const costEstimateUsd = estimateCost(inputTokens, outputTokens, opts.model);
    recordSpend(costEstimateUsd);

    return {
      content,
      model: response.model,
      provider: 'anthropic-direct',
      inputTokens,
      outputTokens,
      costEstimateUsd,
    };
  } catch (err) {
    console.error('[litellm-gateway] Anthropic failed:', (err as Error).message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Stub response (all providers failed)
// ---------------------------------------------------------------------------

function stub(messages: LLMMessage[], reason: string): LLMResult {
  console.error(`[litellm-gateway] STUB activated: ${reason}`);
  const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content ?? '';

  return {
    content: `[Sistema en pausa — ${reason}. El consejo retomará en breve.]`,
    model: 'stub',
    provider: 'stub',
    inputTokens: 0,
    outputTokens: 0,
    costEstimateUsd: 0,
  };
}

// ---------------------------------------------------------------------------
// Budget status (for Watcher dashboard)
// ---------------------------------------------------------------------------

export function getBudgetStatus() {
  return {
    dailyBudgetUsd: getDailyBudget(),
    spentTodayUsd: dailySpend.totalUsd,
    date: dailySpend.date,
    percentUsed: Math.round((dailySpend.totalUsd / getDailyBudget()) * 100),
    isOverBudget: isOverBudget(),
    perTaskMaxUsd: PER_TASK_MAX_USD,
    loopGuard: getLoopGuardStatus(),
    byAgent: { ...agentDailySpend }, // FLW: per-agent breakdown
  };
}

// ---------------------------------------------------------------------------
// SMART LLM ROUTER — Bead B1
// Classifies tasks into tiers and routes to the cheapest capable model.
// Tier 0: Fast/cheap  → Ollama Nemotron 3 local (sub-100ms, $0)
// Tier 1: Mid-tier    → Claude Haiku / gemini-flash (< $0.02/call)
// Tier 2: Full power  → Claude Sonnet / GPT-4o (< $0.15/call)
// Tier 3: Heavy       → Claude Opus (reserved for council synthesis)
// ---------------------------------------------------------------------------

export type TaskTier = 0 | 1 | 2 | 3;

export const TASK_TIER_MAP: Record<string, TaskTier> = {
  // Tier 0 — local fast path
  classify:        0,  translate_short: 0,  ping: 0,  intent_detect: 0,
  // Tier 1 — cheap remote
  summarise:       1,  format:           1,  tag: 1,   route: 1,  extract: 1,
  // Tier 2 — capable remote
  draft:           2,  analyse:          2,  plan: 2,  reply: 2,  research: 2,
  // Tier 3 — heavy synthesis
  council_meeting: 3,  strategy: 3,  report_full: 3,
};

export const TIER_MODELS: Record<TaskTier, string> = {
  0: 'nemotron:latest',          // Ollama local
  1: 'claude-3-5-haiku-20241022',
  2: 'claude-opus-4-5',
  3: 'claude-opus-4-6',
};

export const TIER_MAX_COST: Record<TaskTier, number> = {
  0: 0,
  1: 0.02,
  2: 0.15,
  3: 1.00,
};

export function classifyTask(taskType: string): TaskTier {
  return TASK_TIER_MAP[taskType.toLowerCase()] ?? 2;
}

export function getTierModel(tier: TaskTier): string {
  return TIER_MODELS[tier];
}

// ---------------------------------------------------------------------------
// Ollama local fast-path (Nemotron 3 / any local model)
// ---------------------------------------------------------------------------

async function callOllamaLocal(
  messages: LLMMessage[],
  model = 'nemotron:latest',
  maxTokens = 512,
): Promise<LLMResult | null> {
  const ollamaBase = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  try {
    const res = await fetch(`${ollamaBase}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: { num_predict: maxTokens },
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json() as { message?: { content: string } };
    const content = data.message?.content ?? '';
    return { content, model, provider: 'stub', inputTokens: 0, outputTokens: 0, costEstimateUsd: 0 };
  } catch {
    return null;
  }
}

/**
 * routeLLM — smart entry point that picks model by task tier.
 * Falls back to callLLM() if Ollama is unavailable or tier > 0.
 */
export async function routeLLM(
  messages: LLMMessage[],
  taskType: string,
  overrides: LLMCallOptions = {},
): Promise<LLMResult> {
  const tier = classifyTask(taskType);

  // Tier 0 — try Ollama first
  if (tier === 0) {
    const local = await callOllamaLocal(messages, TIER_MODELS[0], overrides.maxTokens ?? 512);
    if (local) return local;
    // fall through to Tier 1 if Ollama is down
  }

  const model = overrides.model ?? TIER_MODELS[Math.max(tier, 1) as TaskTier];
  return callLLM(messages, { ...overrides, model });
}

