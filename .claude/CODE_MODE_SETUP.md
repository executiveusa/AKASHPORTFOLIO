# CODE_MODE Setup — FREE vs PAID

**Status**: Production Ready  
**Installed**: 2026-05-09  
**Version**: 1.0

---

## Quick Start

### PAID Mode (Default — Using Anthropic API)

```bash
# Set environment variable
export CODE_MODE=PAID
export ANTHROPIC_API_KEY=sk-ant-...

# Start the app
cd apps/control-room
npm run dev

# Verify mode
curl http://localhost:3000/api/code-mode/status
```

**Response:**
```json
{
  "mode": "PAID",
  "endpoint": "https://api.anthropic.com/v1",
  "available": true,
  "formatted": "💳 PAID (Anthropic)",
  "costEstimate": {
    "mode": "PAID",
    "costUSD": 0.0095,
    "estimatedLatencyMs": 450
  }
}
```

---

## FREE Mode Setup (Local Proxy)

### Step 1: Install free-claude-code proxy

```bash
# Run the installation script
bash scripts/install-free-claude-code.sh

# Or manual installation:
cd free-claude-code
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn python-dotenv aiohttp requests
```

### Step 2: Install a local model backend (choose one)

**Option A: Ollama (Recommended)**
```bash
# Download from https://ollama.ai
# Then pull a model:
ollama pull neural-chat-7b
ollama pull mistral
ollama serve  # Start Ollama on port 11434
```

**Option B: LM Studio**
```bash
# Download from https://lmstudio.ai
# - Open LM Studio
# - Load model (neural-chat-7b or mistral recommended)
# - Click "Start Server" (listens on http://localhost:1234)
```

**Option C: llama.cpp**
```bash
git clone https://github.com/ggerganov/llama.cpp.git
cd llama.cpp
make
# Download a model (e.g., mistral-7b-q4.gguf)
./main -m mistral-7b-q4.gguf --port 8081
```

### Step 3: Start the free-claude-code proxy

```bash
cd free-claude-code
./start-proxy.sh
# Proxy listens on http://localhost:8082
```

### Step 4: Enable FREE mode in the app

```bash
# Set environment variable
export CODE_MODE=FREE

# Start the app
cd apps/control-room
npm run dev

# Verify mode
curl http://localhost:3000/api/code-mode/status
```

**Response:**
```json
{
  "mode": "FREE",
  "endpoint": "http://localhost:8082",
  "available": true,
  "formatted": "🎉 FREE (Local Proxy)",
  "costEstimate": {
    "mode": "FREE",
    "costUSD": 0.0,
    "estimatedLatencyMs": 1200
  }
}
```

---

## Runtime Mode Switching

### Check Current Mode
```bash
curl http://localhost:3000/api/code-mode/status
```

### Switch to FREE Mode
```bash
curl -X POST http://localhost:3000/api/code-mode/toggle \
  -H "Content-Type: application/json" \
  -d '{"mode": "FREE"}'
```

### Switch to PAID Mode
```bash
curl -X POST http://localhost:3000/api/code-mode/toggle \
  -H "Content-Type: application/json" \
  -d '{"mode": "PAID"}'
```

### Auto-Toggle
```bash
curl -X POST http://localhost:3000/api/code-mode/toggle
```

---

## Configuration Files

### `.claude/code-mode.json`
Master configuration with performance baselines:
- Active mode selection
- Endpoint mappings
- Model fallback chains
- Latency/throughput metrics
- Cost estimates

**Edit to:**
- Change model mappings
- Configure fallback providers
- Adjust performance targets

### `.claude/agents.md`
Agent framework includes CODE_MODE requirements:
- Environment variable docs
- Backend requirements
- Integration points

---

## Performance Comparison

| Metric | PAID | FREE |
|--------|------|------|
| **Cost per M tokens** | $3 input / $15 output | $0 |
| **Latency** | ~450ms | ~1200ms |
| **Throughput** | 85 tokens/sec | 25 tokens/sec |
| **Availability** | 99.9% | 95% (depends on hardware) |
| **Max tokens** | 200k | 32k (depends on model) |
| **Tools support** | Full | Limited (depends on backend) |

**When to use PAID:**
- Complex reasoning tasks
- Time-sensitive operations
- Large token budgets
- Production deployments

**When to use FREE:**
- Development & testing
- Learning & experimentation
- Zero-budget environments
- Offline development

---

## Troubleshooting

### "FREE mode proxy unavailable"
```bash
# Check if free-claude-code is running
curl http://localhost:8082/health

# If not, start it:
cd free-claude-code
./start-proxy.sh
```

### "Ollama not responding"
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not, start it:
ollama serve

# Verify model is pulled:
ollama list
```

### "LM Studio server not found"
```bash
# Verify endpoint
curl http://localhost:1234/v1/models

# Ensure LM Studio is running and "Start Server" is clicked
```

### Falling back to PAID mode
The system automatically falls back from FREE to PAID if:
- Proxy is unavailable (503/500 error)
- Network error occurs
- Explicit fallback configured

Check logs:
```bash
# App logs (includes fallback messages)
npm run dev

# Proxy logs
cd free-claude-code
./start-proxy.sh
```

### "Socket timeout" errors
Increase timeout in `.claude/code-mode.json`:
```json
{
  "timeout": 10000
}
```

---

## Integration with Sphere Agents

All 9 agents respect CODE_MODE:

```typescript
// In any agent code:
import { getCodeModeClient } from '@/lib/code-mode-client';

const client = getCodeModeClient();
const status = await client.getStatus();

if (status.activeMode === 'FREE') {
  console.log('🎉 Running in zero-cost mode');
} else {
  console.log('💳 Using Anthropic API');
}
```

**Agents can switch modes mid-execution:**
```typescript
// Check budget, switch to FREE if needed
const estimate = client.getCostEstimate(inputTokens, outputTokens);
if (estimate.costUSD > BUDGET_LIMIT) {
  client.setMode('FREE');
}
```

---

## Environment Variables

### Activation
```bash
CODE_MODE=PAID          # Default
CODE_MODE=FREE          # Use local proxy
```

### PAID Mode Requirements
```bash
ANTHROPIC_API_KEY=sk-ant-...
```

### FREE Mode Requirements
At least one backend:
```bash
# Ollama
OLLAMA_ENDPOINT=http://localhost:11434

# LM Studio
LMSTUDIO_ENDPOINT=http://localhost:1234

# OpenRouter (fallback)
OPENROUTER_API_KEY=...
```

---

## Testing FREE Mode

### Unit Test
```bash
npm run test -- code-mode-client.test.ts
```

### Integration Test
```bash
# 1. Start proxy
cd free-claude-code && ./start-proxy.sh

# 2. Start app in FREE mode
CODE_MODE=FREE npm run dev

# 3. Test endpoint
curl http://localhost:3000/api/code-mode/status

# 4. Run E2E tests
npm run test:e2e
```

### Load Test (simulated)
```bash
# Generate 100 concurrent requests
for i in {1..100}; do
  curl http://localhost:3000/api/code-mode/status &
done
wait
```

---

## Production Deployment

### Vercel Deployment (PAID Mode)
```bash
# Set environment at Vercel dashboard:
vercel env add CODE_MODE PAID
vercel env add ANTHROPIC_API_KEY sk-ant-...

# Deploy
git push origin main
```

### Self-Hosted Deployment (FREE Mode)
```bash
# On server:
1. Install Ollama (or LM Studio)
2. Start Ollama/LM Studio
3. Clone and start free-claude-code proxy
4. Set CODE_MODE=FREE in .env
5. Start the Next.js app
```

---

## Monitoring

### Health Check Endpoint
```bash
curl http://localhost:3000/api/code-mode/status
```

**Expected response time:**
- PAID: < 1000ms
- FREE: < 3000ms

### Alerts (Production)
- If response time > 5000ms → log warning
- If cost estimate > daily budget → notify Ivette
- If fallback triggered → log incident

---

## Roadmap

- [ ] Auto-select mode based on task complexity
- [ ] Cost-aware agent routing
- [ ] Model performance profiling
- [ ] Hardware-aware defaults for FREE mode
- [ ] Multi-model ensembling (PAID + FREE)
- [ ] Cache layer (reduce token usage)

---

## References

- **free-claude-code**: https://github.com/Alishahryar1/free-claude-code
- **Ollama**: https://ollama.ai
- **LM Studio**: https://lmstudio.ai
- **AGENTS.md**: Agent framework and skills
- **CODE_MODE Client**: `.src/lib/code-mode-client.ts`

---

**Questions?** Check `.claude/agents.md` or the CODE_MODE client implementation.

*Ready to go FREE? Set CODE_MODE=FREE and let the agents work for $0.* 🎉
