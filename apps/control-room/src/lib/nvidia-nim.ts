/**
 * NVIDIA NIM Inference Client — free OpenAI-compatible proxy
 * Base URL and key are injected via env vars; never hardcode in source.
 * Rate limit: 40 req/min. On 429, wait 2s and retry once.
 */

import OpenAI from 'openai';

const NIM_BASE_URL = process.env.NVIDIA_NIM_BASE_URL ?? 'http://31.220.58.212:8082';
const NIM_API_KEY  = process.env.NVIDIA_NIM_API_KEY  ?? 'dummy';
const NIM_MODEL    = process.env.NVIDIA_NIM_MODEL    ?? 'moonshotai/kimi-k2-thinking';

export const nimClient = new OpenAI({
  baseURL: NIM_BASE_URL,
  apiKey:  NIM_API_KEY,
  defaultHeaders: { 'User-Agent': 'synthia-control-room/1.0' },
});

export interface NIMCallOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export async function nimChat(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  opts: NIMCallOptions = {},
): Promise<string> {
  const payload = {
    model:      opts.model      ?? NIM_MODEL,
    max_tokens: opts.maxTokens  ?? 4096,
    temperature: opts.temperature ?? 0.7,
    messages: opts.systemPrompt
      ? [{ role: 'system' as const, content: opts.systemPrompt }, ...messages]
      : messages,
  };

  const attempt = async () =>
    nimClient.chat.completions.create(payload);

  let res;
  try {
    res = await attempt();
  } catch (err: unknown) {
    const status = (err as { status?: number }).status;
    if (status === 429) {
      await new Promise(r => setTimeout(r, 2000));
      res = await attempt();
    } else {
      throw err;
    }
  }

  return res.choices[0]?.message?.content ?? '';
}

export { NIM_BASE_URL, NIM_MODEL };
