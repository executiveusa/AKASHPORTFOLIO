/**
 * models.ts — SYNTHIA model catalog (single home for model ids)
 *
 * Policy (owner, 2026-09-05): FREE models by default via OpenRouter; paid models only when the
 * operator switches explicitly (chat model switcher) or a route passes `allowPaid`.
 * Ids verified against https://openrouter.ai/api/v1/models on 2026-09-05.
 */

export type ModelTier = 'free' | 'fast' | 'smart' | 'council';

export interface ModelInfo {
  id: string;            // OpenRouter id
  label: string;         // UI label (es)
  tier: ModelTier;
  free: boolean;
  ctx: number;
  note?: string;
}

/** Ordered free chain — first is the default, the rest are automatic fallbacks (429/404/empty). */
export const FREE_CHAIN: string[] = [
  'google/gemma-4-31b-it:free',        // clean Spanish, 1.4 s measured, 262k ctx
  'minimax/minimax-m2.7:free',         // good Spanish, 6 s, 196k ctx
  'nvidia/nemotron-3-super-120b-a12b:free',
  'openrouter/free',                   // OpenRouter's auto-picked free model (last resort)
];

export const DEFAULT_MODEL = process.env.LLM_DEFAULT_MODEL || FREE_CHAIN[0];

export const CATALOG: ModelInfo[] = [
  { id: 'google/gemma-4-31b-it:free', label: 'Gemma 4 31B · gratis', tier: 'free', free: true, ctx: 262144, note: 'predeterminado' },
  { id: 'minimax/minimax-m2.7:free', label: 'MiniMax M2.7 · gratis', tier: 'free', free: true, ctx: 196608 },
  { id: 'nvidia/nemotron-3-super-120b-a12b:free', label: 'Nemotron 3 Super · gratis', tier: 'free', free: true, ctx: 262144 },
  { id: 'inclusionai/ling-3.0-flash-fin:free', label: 'Ling 3.0 Flash Fin · gratis (finanzas)', tier: 'free', free: true, ctx: 262144 },
  { id: 'openrouter/free', label: 'OpenRouter auto · gratis', tier: 'free', free: true, ctx: 200000 },
  { id: 'google/gemini-3.8-flash', label: 'Gemini 3.8 Flash', tier: 'fast', free: false, ctx: 1048576 },
  { id: 'deepseek/deepseek-v4-flash', label: 'DeepSeek V4 Flash', tier: 'fast', free: false, ctx: 128000 },
  { id: 'anthropic/claude-sonnet-5', label: 'Claude Sonnet 5', tier: 'smart', free: false, ctx: 200000 },
  { id: 'openai/gpt-5.6-sol', label: 'GPT-5.6 Sol', tier: 'smart', free: false, ctx: 400000 },
  { id: 'moonshotai/kimi-k3', label: 'Kimi K3', tier: 'smart', free: false, ctx: 262144 },
  { id: 'anthropic/claude-opus-5', label: 'Claude Opus 5 · consejo', tier: 'council', free: false, ctx: 200000 },
  { id: 'anthropic/claude-fable-5.1', label: 'Claude Fable 5.1 · consejo', tier: 'council', free: false, ctx: 200000 },
];

/** Legacy aliases used across the codebase → FREE by default. Old Claude ids are tier hints, not purchases:
 *  they map to the free chain unless LLM_ALLOW_PAID=true, in which case they map to the paid tier model. */
const LEGACY_PAID: Record<string, string> = {
  'claude-opus-4-5': 'anthropic/claude-opus-5',
  'claude-opus-4-6': 'anthropic/claude-opus-5',
  'claude-3-opus-20240229': 'anthropic/claude-opus-5',
  'anthropic/claude-opus-4-5': 'anthropic/claude-opus-5',
  'claude-sonnet-4-6': 'anthropic/claude-sonnet-5',
  'claude-3-5-sonnet-20241022': 'anthropic/claude-sonnet-5',
  'anthropic/claude-3.5-sonnet': 'anthropic/claude-sonnet-5',
  'claude-haiku-4-5-20251001': 'google/gemini-3.8-flash',
  'claude-3-5-haiku-20241022': 'google/gemini-3.8-flash',
  'claude-3-haiku-20240307': 'google/gemini-3.8-flash',
  'anthropic/claude-3.5-haiku': 'google/gemini-3.8-flash',
  'anthropic/claude-3-haiku': 'google/gemini-3.8-flash',
  'anthropic/claude-haiku-3-5': 'google/gemini-3.8-flash',
};
const LEGACY_FREE: Record<string, string> = Object.fromEntries(Object.keys(LEGACY_PAID).map((k) => [k, k.includes('opus') ? FREE_CHAIN[2] : k.includes('sonnet') ? FREE_CHAIN[1] : FREE_CHAIN[0]]));
const ALIASES: Record<string, string> = { free: FREE_CHAIN[0], default: FREE_CHAIN[0] };

export function isLegacyAlias(id: string): boolean {
  return id in LEGACY_PAID;
}

export function resolveModel(id?: string | null): string {
  if (!id) return DEFAULT_MODEL;
  if (id in LEGACY_PAID) return process.env.LLM_ALLOW_PAID === 'true' ? LEGACY_PAID[id] : LEGACY_FREE[id];
  return ALIASES[id] ?? id;
}

export function isFreeModel(id: string): boolean {
  return id.endsWith(':free') || id === 'openrouter/free';
}

export function isKnownModel(id: string): boolean {
  return CATALOG.some((m) => m.id === id) || isFreeModel(id);
}

/** Paid models are allowed only when the operator asked for one or the caller opted in. */
export function paidAllowed(explicitModel?: string | null, allowPaid?: boolean): boolean {
  if (allowPaid) return true;
  if (process.env.LLM_ALLOW_PAID === 'true') return true;
  // Only a *current* OpenRouter paid id chosen by the operator counts as explicit; legacy aliases never buy.
  return !!explicitModel && !isLegacyAlias(explicitModel) && !isFreeModel(resolveModel(explicitModel));
}
