# Stub Inventory — AKASHPORTFOLIO

**Triage date:** 2026-06-21  
**Scanner:** `scripts/audit-stubs.mjs` (fixed — was 364 false positives, now 23 accurate findings)  
**Root cause of original 364 count:** case-insensitive scan matched Spanish "todo/todos" and JSX `placeholder=` attributes

---

## False positive fix summary

| Pattern | Original count | Real count | Root cause |
|---------|---------------|------------|------------|
| TODO | 93 | 1 | Spanish "todo/todos" in UI strings and .md files |
| placeholder | 143 | 3 | HTML/JSX `placeholder=` attributes + form field schema objects |
| fallback | 89 | 0 | Legitimate graceful degradation code |
| stub | 25 | 14 | Mostly env-gated degradation stubs (correct behavior) |
| mock | 13 | 5 | Mostly offline/unconfigured fallbacks |
| fake success | 1 | 0 | Anti-pattern guardrail comment ("never fake success") |
| **TOTAL** | **364** | **23** | |

---

## CRITICAL — 2 findings (production API paths, need resolution)

| File | Line | Issue | Fix needed |
|------|------|-------|-----------|
| `src/app/api/vapi/tools/route.ts` | 130 | Returns stub analytics to VAPI tool calls — external callers receive fake data | Wire to `dashboard-data.ts` |
| `src/app/api/pomelli/analyze/route.ts` | 82 | Returns `_mock: true` response when Pomelli service is offline | Accept as intentional degradation OR return explicit 503 |

**Priority:** `vapi/tools/route.ts:130` is the more urgent of the two — it silently serves fake analytics to external VAPI integrations with no indication they're receiving stub data. The pomelli case is arguable as intentional offline behavior (the `_mock: true` flag does signal the degradation to callers).

---

## INFORMATIONAL — 21 findings (graceful degradation, env-gated, or roadmap)

### Env-gated graceful degradation (healthy — activate by setting env vars)

| File | Trigger | What to set |
|------|---------|-------------|
| `src/lib/litellm-gateway.ts` (×4) | `stub()` called when budget exceeded or all providers fail | Set LLM provider keys + budget in `.env` |
| `src/lib/minimax.ts` (×3) | `mockResponse()` when `MINIMAX_API_KEY` absent | Set `MINIMAX_API_KEY` + `MINIMAX_TEAM_ID` |
| `src/lib/supabase-client.ts` (×2) | No-op stub client when `SUPABASE_URL`/`SUPABASE_ANON_KEY` absent | Set Supabase env vars |
| `src/lib/voice-tool-bridge.ts` | Falls through to stub when tool registry unavailable | Configure tool registry |

### Roadmap stubs (feature not yet wired to real API)

| File | Lines | Status |
|------|-------|--------|
| `src/lib/remotion-skill.ts` | 50, 57, 83, 151 | Full STUB MODE — video generation returns fake job IDs, simulates 5s completion. Needs `RUNWAY_API_KEY` or `REMOTION_API_KEY` |
| `src/lib/research-cycle.ts` | 230 | Search stub — will use HERALD/BrightData when available |
| `src/lib/git-manager.ts` | 29 | `// Placeholder for real API logic` |
| `src/app/proyecto/new/page.tsx` | 75 | `// TODO: In production, POST to /api/projects/create` — form submits nowhere |

### Dev/demo stubs (expected in current stage)

| File | Line | Note |
|------|------|------|
| `src/app/api/pomelli/analyze/route.ts` | 55, 58 | Offline mock comments — acceptable for dev |
| `src/app/api/voice/route.ts` | 38 | Mock lip-sync generation |

---

## Recommended next actions (priority order)

1. **Fix `vapi/tools/route.ts:130`** — wire stub analytics to real `dashboard-data.ts`. This is the only item silently serving fake data to an external integration.
2. **Wire `proyecto/new/page.tsx`** — POST to `/api/projects/create` when ready. Currently form validation runs but data goes nowhere.
3. **Decide on `remotion-skill.ts`** — if video generation is not in current sprint, add a clear user-facing "Video coming soon" response instead of silently returning fake job IDs.
4. **Set env vars** for all env-gated stubs — litellm, minimax, supabase, hermes. These aren't code problems, they're configuration.
5. **Wire `research-cycle.ts` search** to HERALD/BrightData when available.

---

## What does NOT need fixing

- All `litellm-gateway.ts` `stub()` calls — this is a correct cost-guard and circuit-breaker pattern
- `supabase-client.ts` no-op — correct behavior when Supabase is unconfigured
- `mercury-voice.ts` fallback — correct voice provider failover chain
- `hermes-client.ts` — "never fake success" is an anti-pattern guardrail, not a stub
- Any `.md` file content — not code
- Any `placeholder=` JSX/HTML attributes — not code stubs
- Spanish "todo/todos" in UI strings — not TODO markers
