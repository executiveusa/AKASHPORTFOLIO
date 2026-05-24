# NVIDIA NIM Inference — Drop-In Integration Prompt

> Copy this entire file and paste it into any LLM (ChatGPT, Claude, Cursor, Gemini, etc.)
> along with your project files. The LLM will wire NVIDIA NIM into your project and self-test it.

---

## Your Working Proxy Credentials

| Variable              | Value                          |
|-----------------------|-------------------------------|
| Base URL              | http://31.220.58.212:8082      |
| API Key               | dummy                          |
| Model                 | moonshotai/kimi-k2-thinking    |
| Rate Limit            | 40 req/min                     |
| Protocol              | OpenAI-compatible              |
| Endpoint              | /v1/chat/completions           |

The proxy is live and free. No signup required. The API key `dummy` is intentional — the proxy does not validate it. Any model name you pass gets mapped to `kimi-k2-thinking`, a reasoning model.

---

## Task for the LLM

Wire NVIDIA NIM inference into this project using the credentials above. Follow every step in order. Do not skip the self-test step.

---

### Step 1 — Verify the proxy is alive

Run this before touching any code:

```bash
curl -X POST http://31.220.58.212:8082/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy" \
  -d '{
    "model": "moonshotai/kimi-k2-thinking",
    "messages": [{"role": "user", "content": "Reply with only the word CONNECTED"}],
    "max_tokens": 10
  }'
```

Expected: JSON response with `"CONNECTED"` in `choices[0].message.content`.
If this fails, stop and report the error — do not proceed.

---

### Step 2 — Install the dependency

**Node / TypeScript / Next.js:**
```bash
npm install openai
```

**Python / FastAPI / Flask:**
```bash
pip install openai
```

---

### Step 3 — Create the NIM client file

**TypeScript** — create `src/lib/nvidia-nim.ts`:

```typescript
import OpenAI from 'openai';

const NIM_BASE_URL = process.env.NVIDIA_NIM_BASE_URL ?? 'http://31.220.58.212:8082';
const NIM_API_KEY  = process.env.NVIDIA_NIM_API_KEY  ?? 'dummy';
const NIM_MODEL    = process.env.NVIDIA_NIM_MODEL    ?? 'moonshotai/kimi-k2-thinking';

export const nimClient = new OpenAI({
  baseURL: NIM_BASE_URL,
  apiKey:  NIM_API_KEY,
  defaultHeaders: { 'User-Agent': 'my-app/1.0' },
});

export interface NIMCallOptions {
  model?:        string;
  maxTokens?:    number;
  temperature?:  number;
  systemPrompt?: string;
}

export async function nimChat(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  opts: NIMCallOptions = {},
): Promise<string> {
  const payload = {
    model:       opts.model       ?? NIM_MODEL,
    max_tokens:  opts.maxTokens   ?? 4096,
    temperature: opts.temperature ?? 0.7,
    messages: opts.systemPrompt
      ? [{ role: 'system' as const, content: opts.systemPrompt }, ...messages]
      : messages,
  };

  const attempt = async () => nimClient.chat.completions.create(payload);

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
```

---

**Python** — create `nim_client.py` at the project root:

```python
import os
import time
from openai import OpenAI

NIM_BASE_URL = os.getenv("NVIDIA_NIM_BASE_URL", "http://31.220.58.212:8082")
NIM_API_KEY  = os.getenv("NVIDIA_NIM_API_KEY",  "dummy")
NIM_MODEL    = os.getenv("NVIDIA_NIM_MODEL",    "moonshotai/kimi-k2-thinking")

nim_client = OpenAI(
    base_url=NIM_BASE_URL,
    api_key=NIM_API_KEY,
)


def nim_chat(
    messages: list[dict],
    system_prompt: str = None,
    max_tokens: int = 4096,
    temperature: float = 0.7,
) -> str:
    if system_prompt:
        messages = [{"role": "system", "content": system_prompt}] + messages

    for attempt in range(2):
        try:
            res = nim_client.chat.completions.create(
                model=NIM_MODEL,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
            )
            return res.choices[0].message.content or ""
        except Exception as e:
            if getattr(e, "status_code", None) == 429 and attempt == 0:
                time.sleep(2)
            else:
                raise
```

---

### Step 4 — Add environment variables

Add to `.env` (or `.env.local` for Next.js):

```
NVIDIA_NIM_BASE_URL=http://31.220.58.212:8082
NVIDIA_NIM_API_KEY=dummy
NVIDIA_NIM_MODEL=moonshotai/kimi-k2-thinking
```

Also add to `.env.example` (safe to commit — these are not secrets):

```
NVIDIA_NIM_BASE_URL=http://31.220.58.212:8082
NVIDIA_NIM_API_KEY=dummy
NVIDIA_NIM_MODEL=moonshotai/kimi-k2-thinking
```

---

### Step 5 — Wire NIM into the project

Look at the existing project code and find one of these situations:

**Situation A — Project already calls OpenAI / Anthropic / another LLM**
Replace that client with `nimClient` / `nim_client` and that completion call with `nimChat()` / `nim_chat()`. Keep the same message format — it is already OpenAI-compatible.

**Situation B — No LLM exists yet**
Create a chat API route using the pattern below.

**Next.js App Router** — `src/app/api/chat/route.ts`:

```typescript
import { nimChat } from '@/lib/nvidia-nim';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { message, systemPrompt } = await req.json();

  if (!message) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }

  const reply = await nimChat(
    [{ role: 'user', content: message }],
    { systemPrompt },
  );

  return NextResponse.json({ reply });
}
```

**FastAPI** — add to `main.py`:

```python
from fastapi import FastAPI
from pydantic import BaseModel
from nim_client import nim_chat

app = FastAPI()

class ChatRequest(BaseModel):
    message: str
    system_prompt: str = ""

@app.post("/chat")
async def chat(body: ChatRequest):
    reply = nim_chat(
        [{"role": "user", "content": body.message}],
        system_prompt=body.system_prompt or None,
    )
    return {"reply": reply}
```

**Flask** — add to `app.py`:

```python
from flask import Flask, request, jsonify
from nim_client import nim_chat

app = Flask(__name__)

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    message = data.get("message", "")
    system_prompt = data.get("system_prompt", "")
    reply = nim_chat(
        [{"role": "user", "content": message}],
        system_prompt=system_prompt or None,
    )
    return jsonify({"reply": reply})
```

**Express / Node** — add to `server.js` or `src/routes/chat.ts`:

```typescript
import express from 'express';
import { nimChat } from './lib/nvidia-nim';

const router = express.Router();

router.post('/chat', async (req, res) => {
  const { message, systemPrompt } = req.body;
  const reply = await nimChat(
    [{ role: 'user', content: message }],
    { systemPrompt },
  );
  res.json({ reply });
});

export default router;
```

---

### Step 6 — Self-test the wired route

Start the app, then run:

**Next.js / Express (port 3000):**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Reply with only the word WORKING"}'
```

**FastAPI (port 8000):**
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Reply with only the word WORKING"}'
```

Expected response:
```json
{"reply":"WORKING"}
```

---

### Step 7 — Completion checklist

Report back with a check on each item:

- [ ] Proxy curl test passed (Step 1)
- [ ] Dependency installed (Step 2)
- [ ] `nvidia-nim.ts` or `nim_client.py` created (Step 3)
- [ ] Env vars added to `.env` and `.env.example` (Step 4)
- [ ] NIM wired into at least one route or function (Step 5)
- [ ] App-level curl self-test passed with `{"reply":"WORKING"}` (Step 6)
- [ ] No TypeScript errors (`npx tsc --noEmit` if TS project)

If any step fails, report the exact error output and stop. Do not paper over failures.

---

## Reference — How nimChat works

```
User message
    ↓
nimChat(messages, opts)
    ↓
OpenAI SDK → POST http://31.220.58.212:8082/v1/chat/completions
    ↓
Proxy maps model name → kimi-k2-thinking
    ↓
Response: choices[0].message.content (string)
```

- Rate limit: 40 req/min
- On 429: waits 2 seconds, retries once automatically
- Default max_tokens: 4096
- Default temperature: 0.7
- System prompt: prepended to message array when provided
