/**
 * LiteLLM Gateway — Synthia™ Sphere OS
 * 
 * Provider-agnostic LLM routing with budget guard and fallback chain.
 * Primary:  LiteLLM proxy (if LITELLM_BASE_URL configured) → claude-opus-4-5
 * Fallback: Direct Anthropic SDK → claude-3-haiku-20240307
 * Guard:    LITELLM_DAILY_BUDGET_USD (default $20) circuit breaker
 */

import Anthropic from '@anthropic-ai/sdk';
import type { SphereAgentId } from '@/shared/council-events';

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
// Daily spend tracker (in-memory, resets on server restart)
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
}

function isOverBudget(): boolean {
  return dailySpend.totalUsd >= getDailyBudget();
}

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

  // Budget circuit breaker
  if (isOverBudget()) {
    console.error(`[litellm-gateway] COST_GUARD: Daily budget $${getDailyBudget()} reached. Using stub.`);
    return stub(messages, 'COST_GUARD_TRIGGERED');
  }

  // Route 1: LiteLLM proxy
  if (process.env.LITELLM_BASE_URL && process.env.LITELLM_MASTER_KEY && 
      process.env.LITELLM_MASTER_KEY !== 'your-litellm-master-key') {
    const result = await tryLiteLLM(messages, { model, maxTokens, temperature, sphereId });
    if (result) return result;
  }

  // Route 2: Direct Anthropic
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    // Downgrade to haiku on fallback to save cost
    const fallbackModel = model.includes('opus') ? 'claude-haiku-3-20240307' : model;
    const result = await tryAnthropic(messages, { model: fallbackModel, maxTokens, temperature, sphereId });
    if (result) return result;
  }

  return stub(messages, 'no-providers-configured');
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
  };
}
