import OpenAI from 'openai';

const BASE_URL  = process.env.NVIDIA_NIM_BASE_URL  ?? 'http://31.220.58.212:8082';
const API_KEY   = process.env.NVIDIA_NIM_API_KEY   ?? 'dummy';
const DEFAULT_MODEL = process.env.NVIDIA_NIM_MODEL ?? 'moonshotai/kimi-k2-thinking';

export const nimClient = new OpenAI({
  baseURL: `${BASE_URL}/v1`,
  apiKey:  API_KEY,
});

interface NimChatOpts {
  model?:       string;
  system?:      string;
  maxTokens?:   number;
  temperature?: number;
}

export async function nimChat(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  opts: NimChatOpts = {},
): Promise<OpenAI.Chat.Completions.ChatCompletion> {
  const { model = DEFAULT_MODEL, system, maxTokens = 4096, temperature = 0.7 } = opts;

  const full = system
    ? [{ role: 'system' as const, content: system }, ...messages]
    : messages;

  const attempt = async () =>
    nimClient.chat.completions.create({
      model,
      messages: full,
      max_tokens: maxTokens,
      temperature,
    });

  try {
    return await attempt();
  } catch (err: unknown) {
    const status = (err as { status?: number }).status;
    if (status === 429) {
      await new Promise(r => setTimeout(r, 2000));
      return attempt();
    }
    throw err;
  }
}
