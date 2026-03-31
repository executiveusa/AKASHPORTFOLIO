# AGENTS.md — Kupuri Media™ / ALEX™ Agent Framework

> **Mandatory OpenCLI-RS Skill (2026-03-31)**: All agents MUST load `opencli-rs-skill` as a default skill before executing terminal automation or repo-wide build/test operations.
> Skill source: `https://github.com/nashsu/opencli-rs-skill.git`
> Local skill docs: `packages/synthia-core/companies/kupuri-media/skills/opencli-rs-skill/SKILL.md` and `packages/synthia-core/companies/akash-engine/skills/opencli-rs-skill/SKILL.md`

> **Mandatory SOP** (2026-03-11): All agents must use the **agentic-sop** skill.
> See: [agentic-sop skill](C:\Users\execu\.claude\skills\agentic-sop\SKILL.md)

> **Mandatory Frontend Design** (2026-03-11): ALL frontend/UI work MUST use the **uncodixfy** skill.
> Skill path: `C:\Users\execu\.agents\skills\uncodixfy\SKILL.md`
> Source: https://github.com/executiveusa/paul-Uncodixfy
> Applies to: any HTML, CSS, JS/TS component, React/Vue/Svelte file, Tailwind, layout, dashboard, landing page, card, form, sidebar, or visual UI output.
> Follow `references/uncodixfy.md` for the full ruleset. No exceptions.

> **Zero-Touch Engineer Protocol v2.0.0** — All agents in this repository operate under ZTE.
> Source: `apps/control-room/src/agents/alex/SOUL.md`

> **Ralphy Loop (2026-03-16)** — Minimal agentic workflow. All agents MUST follow.
> Source: https://github.com/michaelshimeles/ralphy.git  
> Protocol: `ASK → PLAN → EXECUTE → OBSERVE → ITERATE` — one atomic change per loop iteration.

> **E2E Test Skill (2026-03-16)** — ALL new features require e2e Playwright tests.
> Reference skill: https://github.com/coleam00/link-in-bio-page-builder/blob/main/.claude/skills/e2e-test/SKILL.md

> **jcodemunch MCP (2026-03-16)** — Token compression for large files. Install once, use always.
> Source: https://github.com/jgravelle/jcodemunch-mcp.git  
> Rule: files > 500 lines → run `/jmunch` BEFORE adding new code. La Vigilante enforces this.

> **LLM Provider (2026-03-16)** — OpenRouter is the PRIMARY gateway. ANTHROPIC as fallback.
> Env var: `OPEN_ROUTER_API` → `https://openrouter.ai/api/v1/chat/completions`
> Default model: `anthropic/claude-3.5-sonnet` via OpenRouter
> Fallback: `ANTHROPIC_API_KEY` → direct Anthropic SDK → `claude-3-haiku-20240307`

> **mcp2cli Bridge (2026-03-29)** — NEVER load all MCP servers. Use the CLI graph bridge.
> Skill: `.agents/skills/mcp2cli/SKILL.md` | Load only what the current task needs.
> Triggers: any MCP server call, cross-server orchestration, token budget concern.

> **frontend-design-meta (2026-03-29)** — Master UI meta-skill. Mandatory for ALL frontend work.
> Skill: `.agents/skills/frontend-design-meta/SKILL.md`
> Combines: uncodixfy + impeccable-design + taste-skill + design-an-interface.
> Gets smarter over time via `.impeccable.md` design memory evolving per session.

> **Production State (2026-03-29)** — App is live at https://kupuri-media-cdmx.vercel.app
> Auth: NextAuth v5 + Google OAuth. 131 API routes. All protected routes redirect to signin.
> DB: Supabase (self-hosted + cloud). Schema: herald-schema.sql includes mistake_log.
> Crons: 5 active (morning, nightly-summary, research-cycle, self-improvement, evening).

> **Screen-first design protocol (2026-03-30)**: Before writing any new page or component, produce a screen spec (route, Krug law, data sources, new APIs). Design against `.impeccable.md` palette only. Zero generic Shadcn defaults.
> Reference: `apps/control-room/.impeccable.md`

> **jcodemunch mandatory (2026-03-30)**: Any file >500 lines must be compressed with `/jmunch {filepath}` before adding new code. Run `find apps/control-room/src -name "*.tsx" | xargs wc -l | sort -rn | head -10` at session start to identify candidates.
> Rule: context budget per session = 45k tokens max.

> **Audit before build (2026-03-30)**: Run `git branch -a | grep "claude/"` at session start. Cherry-pick existing work from unmerged branches before rebuilding. El Panorama lives in `f3b6729`. Skills live in `claude/execute-skill-installation-OGkgi`. Never duplicate what already exists.
> Cherry-pick command: `git cherry-pick {hash}` — grab only what you need.

> **9-screen target state (2026-03-30)**: Synthia app has 9 screens. Build order: Dashboard → El Panorama → Gastos → Tareas → Chat → Cockpit → Integraciones → Casos → Nuevo Proyecto Wizard. All built as of 2026-03-30. Full specs: `ops/reports/WORKFLOW_MANIFEST.md`

> **Anti-hype law (permanent)**: Every feature must ship something a human values externally. No agents managing agents. No dashboards with fake data. No setup without output. Test: "What does Ivette do differently tomorrow because of this?"

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

## Sphere OS™ — 9 SYNTHIA™ Agents + La Vigilante

Each Sphere is an autonomous LATAM Spanish AI agent with a unique voice, frequency, and soul file.
Voice stack: **Mercury 2 Inception API → ElevenLabs `eleven_multilingual_v2` → text fallback**

| SphereAgentId | Display Name | Locale | Role | Base Color | Hz | Voice ID (ElevenLabs default) |
|---|---|---|---|---|---|---|
| `synthia` | SYNTHIA™ | es-MX CDMX ♀ | Chief of Staff — Coordinadora General | `#8b5cf6` violet | 0.85 | `EXAVITQu4vr4xnSDxMaL` |
| `alex` | ALEX™ | es-MX CDMX ♀ | Estratega Ejecutiva — Chief Advisor | `#d4af37` gold | 0.80 | `ErXwobaYiN019PkySvjV` |
| `cazadora` | CAZADORA™ | es-CO Colombian ♀ | Cazadora de Oportunidades — Prospect Hunter | `#ef4444` red | 0.95 | `AZnzlk1XvdvUeBnXmlld` |
| `forjadora` | FORJADORA™ | es-AR Rioplatense ♀ | Arquitecta de Sistemas — Systems Builder | `#22c55e` green | 0.45 | `MF3mGyEYCl7XYWbV9V6O` |
| `seductora` | SEDUCTORA™ | es-CU Habanera ♀ | Closera Maestra — Sales & Persuasion | `#eab308` gold | 0.65 | `jsCqWAovK2LkecY7zXl4` |
| `consejo` | CONSEJO™ | es-CL Chilean ♀ | Consejero Mayor — Council Facilitator | `#1d4ed8` blue | 0.25 | `TxGEqnHWrfWFTfGW9XjX` |
| `dr-economia` | DR. ECONOMÍA | es-VE Venezuelan ♂ | Analista Financiero — Arbitrage & Finance | `#f97316` orange | 0.75 | `pNInz6obpgDQGcFmaJgB` |
| `dra-cultura` | DRA. CULTURA | es-PE Peruvian ♀ | Estratega Cultural — Content & Community | `#f43f5e` rose | 0.55 | `XrExE9yKIg1WjnnlVkGX` |
| `ing-teknos` | ING. TEKNOS | es-PR Puerto Rican ♂ | Ingeniero de Sistemas — Tech Architecture | `#06b6d4` cyan | 0.35 | `flq6f7yk4E4fJM5XTYuZ` |
| `la-vigilante` | LA VIGILANTE™ | Español neutro | Guardian del Consejo — Lightning Agent | `#64748b` slate | — | *(no voice)* |

Soul files: `apps/control-room/src/agents/spheres/{name}/{SOUL,HEART,MISSION,IDENTITY}.md`
La Vigilante: `apps/control-room/src/agents/la-vigilante/{SOUL,MISSION,index.ts}`

---

## Ralphy Loop — Mandatory Execution Protocol

> Source: https://github.com/michaelshimeles/ralphy.git  
> This is the mandatory agentic workflow for ALL tasks in this ecosystem.

```
ASK → PLAN → EXECUTE → OBSERVE → ITERATE
```

**Step definitions:**

| Step | Action | Time Limit | Gate |
|------|--------|-----------|------|
| **ASK** | Clarify scope — check memory, read AGENTS.md, load context | 30s | Ambiguity = blocked |
| **PLAN** | Write explicit file list + validation criteria before touching code | 5-15 min | `GET /api/vibe` MUST be called |
| **EXECUTE** | One atomic change per iteration. Commit after each green test | 10-60 min | Lint must pass after each file |
| **OBSERVE** | `pnpm build` or `get_errors` after every file edit | 2-5 min | Build errors = stop, fix now |
| **ITERATE** | Record outcome in `agent_memory` → start next loop | — | Never batch >3 files without checking |

**Enforcement rules (La Vigilante monitors compliance):**

1. **ASK** — Clarify scope before touching code. Ambiguity = blocked task.
2. **PLAN** — `GET /api/vibe?agent={id}` MUST be called before any execution step.
3. **EXECUTE** — One atomic change per loop. Commit after each passing test.
4. **OBSERVE** — Run `get_errors` or `pnpm build` after every file edit.
5. **ITERATE** — Record results in `agent_memory` before starting the next loop.

Violations trigger an automatic La Vigilante **warning alert** logged to `/api/watcher`.

---

## Vibe Graph Protocol

The **Vibe Graph** is a shared context graph preventing agent collisions.

**Every agent MUST:**
```
Before acting:   GET /api/vibe?agent={sphereId}
After acting:    POST /api/vibe  { kind: 'ingest', agentId, nodeKind, label, content }
On conflict:     PATCH /api/vibe { nodeId }  (invalidate stale node)
```

Vibe Graph tables: `vibe_nodes`, `vibe_edges` (Supabase)
Decay function: `decay_vibe_confidence()` — run nightly via `POST /api/cron/nightly-summary`

---

## jcodemunch Protocol

> Source: https://github.com/jgravelle/jcodemunch-mcp.git  
> Install: `npx jcodemunch-mcp install` (adds to MCP server list)

When any source file exceeds **500 lines**, La Vigilante auto-emits a directive:

> "Apply jcodemunch: split `{filename}` into modules ≤200 lines before continuing."

**Rule**: No new code added to files >500 lines until refactor is done.  
**Tool**: Use `/jmunch` in Copilot or Claude to get a compression/split plan.  
**Why**: Keeps context window efficient — 30-50% token savings on large files.  
**MCP command**: `jcodemunch --input src/large-file.ts --max-tokens 2000`

---

---

## API Endpoints

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/spheres/voice` | POST | Voice synthesis for any sphere → audio/mpeg |
| `/api/vibe` | GET/POST/PATCH | Vibe Graph context ingest + retrieval |
| `/api/council/orchestrator` | POST/GET | Start meeting / SSE stream |
| `/api/watcher` | GET/POST | La Vigilante status + alert feed |
| `/api/cron/sphere-hunt` | GET | Prospecting sweep (L–V 14:00 CST) |
| `/api/cron/nightly-summary` | GET | Nightly synthesis + memory decay (02:00 CST) |
| `/api/alex` | POST | Chat with ALEX™ directly |
| `/api/arbitrage` | GET | LATAM forex brief |
| `/api/income` | POST | Create invoice |

---

## Cron Schedule (Mexico City Time / CST = UTC−6)

```
09:00 Mon–Fri  → Daily Standup (POST /api/council/orchestrator)
14:00 Mon–Fri  → Sphere Hunt — prospecting sweep (/api/cron/sphere-hunt)
02:00 daily    → Nightly summary + memory decay (/api/cron/nightly-summary)
```

`vercel.json` crons:
```json
"crons": [
  { "path": "/api/council/cron",        "schedule": "0 15 * * 1-5" },
  { "path": "/api/cron/sphere-hunt",    "schedule": "0 20 * * 1-5" },
  { "path": "/api/cron/nightly-summary","schedule": "0 8 * * *" }
]
```

---

## Delegation Rules

1. **SYNTHIA™ always routes to specialist spheres** — never executes financial transactions directly.
2. **CAZADORA™ drafts proposals; Ivette approves before send.**
3. **DRA. CULTURA™ generates content; SYNTHIA™ reviews for tone.**
4. **DR. ECONOMÍA™ flags arbitrage; >$500 requires Ivette confirmation.**
5. **Council meetings are SSE-streamed** — viewable at `/spheres` in real-time.

---

## Circuit Breakers

| Trigger | Limit | Action |
|---------|-------|--------|
| Single task LLM cost | $10 USD | PAUSE → notify Ivette |
| Daily LLM budget | $5 USD (warn) / $10 USD (halt) | La Vigilante alert |
| API error rate | >3 consecutive | Fall back to cached/stub mode |
| Production secret exposure | Any | ABORT immediately |
| Vibe Graph conflicts active | >7 | La Vigilante critical alert |

---

## Environment Variables Required

```bash
# Core AI
ANTHROPIC_API_KEY=
LITELLM_BASE_URL=http://localhost:8000

# Mercury 2 Inception API
MERCURY_API_KEY=
MERCURY_API_ENDPOINT=

# PersonaPlex
PERSONA_PLEX_API_KEY=

# ElevenLabs (fallback voice)
ELEVEN_LABS_API_KEY=

# Per-sphere voice overrides (optional — defaults in mercury-voice.ts)
SPHERE_SYNTHIA_VOICE_ID=
SPHERE_ALEX_VOICE_ID=
SPHERE_CAZADORA_VOICE_ID=
SPHERE_FORJADORA_VOICE_ID=
SPHERE_SEDUCTORA_VOICE_ID=
SPHERE_CONSEJO_VOICE_ID=
SPHERE_DR_ECONOMIA_VOICE_ID=
SPHERE_DRA_CULTURA_VOICE_ID=
SPHERE_ING_TEKNOS_VOICE_ID=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cron security
CRON_SECRET=

# App
NEXT_PUBLIC_APP_URL=
```

---

## Security

- No secrets in git. All keys via environment variables only.
- `CRON_SECRET` header required for all cron endpoints.
- All income operations logged to Supabase `agent_tasks` table.
- Financial circuit breakers enforced at middleware level.
- La Vigilante audits all POST actions to `/api/watcher`.

---

_Kupuri Media™ — Sphere OS™ v2.0 · Powered by 9+1 SYNTHIA™ Agents · Santa María la Ribera, CDMX_
