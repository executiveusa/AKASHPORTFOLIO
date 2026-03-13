# AGENTS.md — Kupuri Media™ / ALEX™ Agent Framework

> **Mandatory SOP** (2026-03-11): All agents must use the **agentic-sop** skill.
> See: [agentic-sop skill](C:\Users\execu\.claude\skills\agentic-sop\SKILL.md)

> **Mandatory Frontend Design** (2026-03-11): ALL frontend/UI work MUST use the **uncodixfy** skill.
> Skill path: `C:\Users\execu\.agents\skills\uncodixfy\SKILL.md`
> Source: https://github.com/executiveusa/paul-Uncodixfy
> Applies to: any HTML, CSS, JS/TS component, React/Vue/Svelte file, Tailwind, layout, dashboard, landing page, card, form, sidebar, or visual UI output.
> Follow `references/uncodixfy.md` for the full ruleset. No exceptions.

> **Zero-Touch Engineer Protocol v2.0.0** — All agents in this repository operate under ZTE.
> Source: `apps/control-room/src/agents/alex/SOUL.md`

---

## Standard Operating Procedure (Mandatory)

All agents working on complex/multi-step tasks **MUST** follow the **Agentic SOP**:

```
1. ASK       → Clarify requirements (30 sec)
2. PLAN      → Design minimal approach + explore codebase (5-15 min)
3. EXECUTE   → Write code incrementally, test (10-60 min)
4. OBSERVE   → Run tests/build, get feedback (2-5 min)
5. ITERATE   → Fix blockers, repeat (as needed)
```

### Core Patterns (REQUIRED)

| Pattern | Purpose | Reference |
|---------|---------|-----------|
| **Beads** | Persistent memory across sessions | `memory/MEMORY.md` |
| **jcodemunch** | Token compression (30-50% savings) | Use `/jmunch` for large codebases |
| **Ralphy Loop** | Minimal agentic workflow | Ask → Plan → Execute → Observe → Iterate |

**Key Principles**:
- ✅ Ship before perfecting
- ✅ Iterate based on feedback
- ✅ Test catches regressions
- ❌ NO analysis paralysis
- ❌ NO over-engineering

See **agentic-sop** skill for complete guide with references and scenarios.

---

## Prime Directive

```
WRITE → TEST → FIX → COMMIT → DEPLOY → VERIFY → NOTIFY
```

Every autonomous action follows this 7-stage loop with no human intervention required unless a circuit breaker fires.

---

## Circuit Breakers

| Trigger | Limit | Action |
|---------|-------|--------|
| Single task cost | $10 USD | PAUSE → notify Ivette |
| Daily spend | $50 USD | HALT all agents |
| API error rate | >3 consecutive | Fall back to cached/stub mode |
| Production secret exposure | Any | ABORT immediately |

---

## Agent Roster

| ID | Name | Role | Model |
|----|------|------|-------|
| `alex-chief` | ALEX™ | Chief of Staff — Coordinadora General | Mercury 2 → Claude fallback |
| `advisor-economic` | Dr. Economía | Arbitrage & financial analysis | Claude |
| `advisor-cultural` | Dra. Cultura | Content strategy & CDMX community | Claude |
| `advisor-tech` | Ing. Teknos | Systems architecture & automation | Claude |
| `advisor-social` | Lic. Social | Freelance relations & clients | Claude |
| `freelance-hunter` | Cazadora | Scans Upwork/Workana/Fiverr, drafts proposals | Claude |
| `income-clerk` | Contadora | Stripe/PayPal/Crypto invoicing & payments | - |
| `arbitrage-scout` | Scout | LATAM forex monitoring & arbitrage signals | - |
| `blog-scribe` | Escriba | SEO blog posts in Spanish + English | Claude |
| `cron-scheduler` | Cronos | Triggers council meetings on schedule | - |

---

## Delegation Rules

1. **ALEX™ always routes to specialists** — never executes financial transactions directly.  
2. **Freelance proposals require Ivette approval** before submission — `freelance-hunter` drafts, Ivette sends.  
3. **Blog posts** are drafted by `blog-scribe`, reviewed by ALEX™, and require at least 1 pass of SEO scoring before publish.  
4. **Council meetings** are recorded and visible in the Viewing Room at `/` — Ivette can watch in real-time.  
5. **Income automation** caps at $500/auto-invoice; above that requires confirmation.

---

## Tool Permissions

| Agent | Stripe | PayPal | Crypto | Google Maps | ElevenLabs | Git Push |
|-------|--------|--------|--------|-------------|------------|----------|
| alex-chief | read | read | read | ✅ | ✅ | ❌ |
| income-clerk | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| freelance-hunter | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| blog-scribe | ❌ | ❌ | ❌ | ✅ | ❌ | draft only |

---

## Endpoints

| Route | Purpose |
|-------|---------|
| `POST /api/alex` | Chat with ALEX™ |
| `POST /api/alex/voice` | ElevenLabs voice synthesis |
| `GET  /api/arbitrage` | LATAM forex brief |
| `POST /api/income` | Create invoice (Stripe/PayPal/Crypto) |
| `GET  /api/council` | Active council meetings |
| `POST /api/council/cron` | Trigger scheduled meeting |
| `GET  /api/agent-mail` | Agent mailbox |

---

## Cron Schedule (Mexico City Time / CST)

```
09:00 Mon–Fri  → Daily Standup (POST /api/council/cron)
10:00 Monday   → Weekly Strategy Session
15:00 1st/mo   → Monthly Finance Review
*/30 * * * *   → Freelance platform scan (Upwork + Workana)
00:00 daily    → Arbitrage brief generation
```

Add to `vercel.json`:
```json
"crons": [
  { "path": "/api/council/cron", "schedule": "0 15 * * 1-5" },
  { "path": "/api/council/cron", "schedule": "0 16 * * 1" },
  { "path": "/api/council/cron", "schedule": "0 21 1 * *" }
]
```

---

## Environment Variables Required

```bash
# Core AI
ANTHROPIC_API_KEY=
MERCURY_API_KEY=
MERCURY_API_ENDPOINT=

# Voice
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=

# Maps
GOOGLE_MAPS_API_KEY=

# Income
STRIPE_SECRET_KEY=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
COINBASE_COMMERCE_API_KEY=

# Forex
EXCHANGERATE_API_KEY=

# Infrastructure
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
CRON_SECRET=
NEXT_PUBLIC_APP_URL=
```

---

## Security

- No secrets in git. All keys via environment variables only.
- `CRON_SECRET` required for all cron endpoints.
- All income operations logged to Supabase `agent_tasks` table.
- Financial circuit breakers enforced at middleware level.

---

_Kupuri Media™ — Powered by ALEX™ v3.0 · Santa María la Ribera, CDMX_
