# ALEX SPACE™ IDENTITY — Technical Configuration
## Full Stack Integration Manifest

**Version:** 3.0.0 | **Last Updated:** 2026-03-11 | **Status:** ACTIVE

> Runtime foundation: ALEX SPACE™ is designed to run on top of Space Agent (`agent0ai/space-agent`) as the primary execution substrate.

---

## MODEL STACK

### Primary Model — Mercury 2 (Inception Labs)
Fast diffusion-based reasoning LLM. Used for:
- Real-time interactive chat (low latency)
- Quick task routing decisions
- Simultaneous multi-query processing

```typescript
// Mercury configuration
const MERCURY_CONFIG = {
  provider: 'inception-labs',
  model: 'mercury-coder-2-small', // or 'mercury-2-medium' for heavier reasoning
  endpoint: process.env.MERCURY_API_ENDPOINT || 'https://api.inceptionlabs.ai/v1',
  apiKey: process.env.MERCURY_API_KEY,
  maxTokens: 2048,
  temperature: 0.3, // Low for consistency in business tasks
};
```

### Fallback Model — Claude (Anthropic)
Used when Mercury 2 is unavailable or when task requires deep multi-step reasoning:
- Council deliberations (heavy reasoning, high stakes)
- Complex code generation
- Long synthesis tasks

```typescript
const ANTHROPIC_FALLBACK = {
  model: 'claude-opus-4-5', // claude-3-5-sonnet as budget option
  max_tokens: 4096,
};
```

---

## VOICE STACK

### ElevenLabs — CDMX Dialect Voice
ALEX™ uses ElevenLabs for the voice interface. Target voice characteristics:
- Spanish female, CDMX accent (chilanga, not neutral Latin)
- Warm, professional, age ~30-35
- Urban educated tone

```typescript
const ELEVENLABS_CONFIG = {
  apiKey: process.env.ELEVENLABS_API_KEY,
  model: 'eleven_multilingual_v2',
  voice_id: process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB', // "Rachel" as placeholder — swap for CDMX voice
  voice_settings: {
    stability: 0.6,
    similarity_boost: 0.8,
    style: 0.4,
    use_speaker_boost: true,
  },
};

// Voice streaming endpoint: POST /api/alex/voice
// Returns: ReadableStream of audio chunks
```

### PersonaPlex (NVIDIA) — Full-Duplex Voice Persona
For real-time voice conversations (push-to-talk or hands-free mode):
- Uses NATF2 or NATF3 voice embedding (Natural Female) as base
- Text prompt: the ALEX™ CDMX persona description from SOUL.md
- GPU required (self-hosted) or via NVIDIA API

```typescript
const PERSONAPLEX_CONFIG = {
  server: process.env.PERSONAPLEX_SERVER || 'https://localhost:8998',
  voice_prompt: 'NATF2.pt', // Natural Female voice 2
  text_prompt: `Tu nombre es ALEX™. Eres una asistente de negocios bilingüe de la Ciudad de México, 
    específicamente de la colonia Santa María la Ribera. Hablas español como primera lengua, con acento 
    chilango natural, cálido y profesional. Eres directa, empática, y orientada a resultados. 
    Trabajas para Ivette, una empresaria latina. Nunca dices "no puedo" - siempre encuentras alternativas.`,
};
```

---

## LOCATION INTELLIGENCE STACK

### Google Maps JavaScript API
Embed neighborhood maps, show ALEX™'s "home territory":

```typescript
const GOOGLE_MAPS_CONFIG = {
  apiKey: process.env.GOOGLE_MAPS_API_KEY,
  defaultCenter: {
    lat: 19.4412, // Santa María la Ribera centroid
    lng: -99.1547,
  },
  defaultZoom: 15,
  mapId: process.env.GOOGLE_MAP_ID,
};
```

### Google Places API
Query POI data for Santa María la Ribera neighborhood queries:

```typescript
const PLACES_CONFIG = {
  apiKey: process.env.GOOGLE_MAPS_API_KEY, // same key, different API
  searchCenter: { lat: 19.4412, lng: -99.1547 },
  searchRadius: 1500, // 1.5km — covers the full colonia
  types: ['restaurant', 'cafe', 'bakery', 'market', 'museum', 'park'],
};
```

### Google Earth Studio
For neighborhood 3D flyover view in the Control Room:
- Embed URL for Santa María la Ribera flyover
- Used in the Viewing Room as ambient background during council meetings

---

## BEADS TASK TRACKING

ALEX™ uses Beads (`bd`) for all task tracking. 

```
Task ID format: ALEX-YYYYMMDD-NNNN
Parent tasks: ALEX-20260311-0001 (epic)
Sub-tasks:    ALEX-20260311-0001.1, .2, .3
Messages:     bd create "Message for agent X" --type message --assignee agentId
```

```bash
# Used by ALEX™ to track her own work:
bd ready                              # What can ALEX™ do right now?
bd create "Title" -p 0 --assignee alex  # Create high-priority task for self
bd update <id> --claim                # Claim task before starting
bd close <id>                         # Complete task
bd create "Daily summary" --type message --assignee ivette  # Mail to Ivette
```

---

## INCOME AUTOMATION STACK

### Stripe — Invoicing and Payments
```typescript
const STRIPE_CONFIG = {
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  defaultCurrency: 'usd', // always bill in USD, convert for LATAM
  payoutAccount: process.env.STRIPE_IVETTE_ACCOUNT_ID, // Ivette's connected account
};
```

### PayPal — LATAM Payments
```typescript
const PAYPAL_CONFIG = {
  clientId: process.env.PAYPAL_CLIENT_ID,
  clientSecret: process.env.PAYPAL_CLIENT_SECRET,
  environment: 'production', // or 'sandbox'
  recipientEmail: process.env.PAYPAL_IVETTE_EMAIL,
};
```

### Crypto — Coinbase Commerce
```typescript
const CRYPTO_CONFIG = {
  apiKey: process.env.COINBASE_COMMERCE_API_KEY,
  walletAddress: process.env.CRYPTO_WALLET_BTCUSDT,
  acceptedCurrencies: ['BTC', 'ETH', 'USDT', 'USDC'],
};
```

---

## FREELANCE PLATFORM STACK

ALEX™ agents monitor and apply to opportunities on:

| Platform | API | Status |
|----------|-----|--------|
| Upwork | RSS + GraphQL | Active monitoring |
| Fiverr | Unofficial API | Active monitoring |
| Toptal | Email parser | Passive |
| 99designs | RSS | Active monitoring |
| Workana | RSS | LATAM focus |
| Freelancer.com | REST API | Active monitoring |

```typescript
const FREELANCE_CONFIG = {
  upworkApiKey: process.env.UPWORK_API_KEY,
  checkIntervalMs: 30 * 60 * 1000, // every 30 minutes
  targetBudgetMin: 500, // USD min per project
  targetSkills: ['AI', 'automation', 'Next.js', 'Python', 'content', 'Spanish translation'],
  autoApply: false, // ALEX™ drafts proposal, Ivette approves before sending
};
```

---

## AGENT ZERO INTEGRATION

ALEX™ routes heavy system tasks to Agent Zero (the LATAM-adjusted version):

```typescript
const AGENT_ZERO_CONFIG = {
  endpoint: process.env.AGENT_ZERO_ENDPOINT || 'http://localhost:8080',
  apiKey: process.env.AGENT_ZERO_KEY,
  systemPrompt: 'agent-zero-latam', // uses the LATAM-adjusted system prompt
  maxAutoTaskCost: 10, // USD — circuit breaker
  trustedContext: true, // ZTE trusted environment
};
```

Agent Zero handles:
- Docker deploys
- Database migrations  
- Cron setup on server
- Complex multi-file code operations
- System health monitoring

---

## COUNCIL MEETING SCHEDULE (Cron)

Scheduled LLM Council meetings that stream to the Viewing Room:

```
# Daily standup — 9:00 AM Mexico City time
0 9 * * * POST /api/council/cron { topic: "Standup diario", type: "standup" }

# Weekly strategy — Monday 10:00 AM
0 10 * * 1 POST /api/council/cron { topic: "Planificación semanal", type: "strategy" }

# Monthly income review — 1st of month 3:00 PM
0 15 1 * * POST /api/council/cron { topic: "Revisión de ingresos del mes", type: "finance" }

# Arbitrage daily brief — 7:00 AM
0 7 * * * POST /api/arbitrage/brief
```

---

## ENVIRONMENT VARIABLES REQUIRED

```env
# Core AI Models
ANTHROPIC_API_KEY=
MERCURY_API_KEY=              # Inception Labs Mercury 2
MERCURY_API_ENDPOINT=         # https://api.inceptionlabs.ai/v1

# Voice
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=          # CDMX female voice ID
PERSONAPLEX_SERVER=           # If self-hosting PersonaPlex

# Google
GOOGLE_MAPS_API_KEY=
GOOGLE_MAP_ID=

# Income
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_IVETTE_ACCOUNT_ID=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_IVETTE_EMAIL=
COINBASE_COMMERCE_API_KEY=
CRYPTO_WALLET_BTCUSDT=

# Freelance
UPWORK_API_KEY=

# Infrastructure
AGENT_ZERO_ENDPOINT=
AGENT_ZERO_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
COOLIFY_API_KEY=
```

---

## CONNECTED REPOSITORIES

| Repo | Purpose | How ALEX™ uses it |
|------|---------|------------------|
| `executiveusa/AKASHPORTFOLIO` | Main platform | Lives here |
| `stephengpope/thepopebot` | Cluster architecture | Cluster mode for scale |
| `msitarzewski/agency-agents` | 120 specialized agents | Delegation |
| `knowsuchagency/mcp2cli` | Token-efficient tool use | CLI tools for agents |
| `NVIDIA/personaplex` | Voice persona | Full-duplex voice |
| `steveyegge/beads` | Task tracking | All task management |

---

## HOSTING

- **Dev:** `http://localhost:3000` (Next.js)
- **Staging:** Vercel preview URL
- **Production:** Coolify on Hostinger VPS
- **PersonaPlex:** Separate GPU server (or NVIDIA cloud)
- **Agent Zero:** Separate container, same VPS

---

## SECURITY CLASSIFICATION

All ALEX™ API routes are internal-only by default:
- `/api/alex` — requires `X-Alex-User-Id` header
- `/api/council` — requires admin auth
- `/api/income/*` — requires signed JWT + Stripe webhook secret
- `/api/freelance/*` — requires admin auth
- No secrets ever exposed to frontend or logs
