# Production Readiness Deep Dive — AKASHPORTFOLIO
Date: 2026-05-05 (UTC)

## Executive Snapshot
- Repo is a monorepo with **three primary apps**: `apps/web` (Cooper-facing site), `apps/control-room` (Synthia orchestration backend + UI), and `apps/onboarding-flipbook` (Rust/Tauri utility app).
- Frontend constraint honored: **do not modify Cooper site landing experience**; production work should focus on backend and operations for Synthia.
- Git state shows **one active local branch (`work`) and no additional local/remote branches configured**, so there is no direct evidence of open/unmerged PR branches inside this clone.
- Core risk: many backend pathways currently run in **stub/mock fallback** mode pending environment secrets and external service wiring.

## What appears complete and working

### 1) Cooper website (`apps/web`)
- Standalone frontend portfolio-style web app with Vite and full visual/animation documentation.
- Contains own `package.json` and README; appears independently runnable and likely already stable for client-facing content.
- Strategic guidance: freeze UX/code except security/dependency patches.

### 2) Synthia Control Room shell (`apps/control-room`)
- Next.js + TypeScript structure is present with significant API surface and agent architecture docs.
- Documented as staging/production-ready in internal docs, including health/dashboard/synthia endpoints, and multi-agent orchestration abstractions.
- Agent operating model is very explicit (Sphere OS + Vibe Graph + La Vigilante enforcement).

### 3) Agent catalog and identity assets
- Strong inventory exists across:
  - `apps/control-room/src/agents/spheres/*` (9 sphere agents)
  - `apps/control-room/agents/*.md` (11 documented role agents for Kupuri media ops)
  - `packages/synthia-core/companies/*/agents/*` (company-specific agent specs)
- This is not “made up from scratch only” — there are explicit references to external protocols/frameworks (Ralphy, OpenCLI, jcodemunch, etc.) plus custom internal persona systems.

## What is not production-ready yet

### 1) Backend integrations are partially stubbed
Evidence in code/comments indicates fallback modes are active when secrets/services are missing:
- LLM gateway has explicit `stub` provider paths and cost guards.
- Supabase client includes no-op safe stubs when env keys absent.
- MiniMax and Remotion bridge include mock/stub behavior.
- Several API routes (newsletter, daily brief, project creation, vapi tools, pomelli analyze) include TODO/mock notes.

### 2) Build confidence gap
- Docs claim “ready,” but same docs and code mention unresolved TypeScript/build config and integration follow-ups.
- No automated evidence captured in this audit of full green CI across monorepo apps.

### 3) Repo hygiene / scope risk
- `apps/control-room/openclaw-logic/synthia-3.0-backend/` contains large vendored or imported ecosystems (`Synthia-3.0-opensource`, skills packs, etc.) with many unrelated TODO/stub references.
- This can block shipping velocity unless release scope is narrowed to the deployable Synthia backend.

## Agent inventory & quality assessment

## Count summary
- **Sphere agents (core council): 9**
  - alex, cazadora, consejo, dr-economia, dra-cultura, forjadora, ing-teknos, seductora, synthia
- **Control-room documented operator agents: 11**
  - clandestino, fany, fany-instagram, fany-linkedin, fany-tiktok, indigo, ivette-voice, merlina, morpho, ralphy, synthia-prime
- **Company-agent specs in `packages/synthia-core`: 13 total**
  - Kupuri media: 10
  - Akash engine: 3

## Are these forked vs custom?
- **Hybrid architecture**:
  - Built on top of real external patterns/tools (Ralphy loop, OpenCLI-RS skill, jcodemunch, MCP-style workflows).
  - Core personas, mission files, and orchestration conventions are custom to this repo/company.
- About named agents asked in your prompt:
  - **Hermes** appears as part of documented design pipeline orchestration language.
  - **Pi agent** is not clearly present as an implemented agent directory/spec in the inspected locations.

## “What PRs are waiting?”
- In this clone, `git branch -a` shows only local branch `work`; no remote-tracking branches are present.
- Therefore, this audit cannot confirm pending GitHub PRs from local git metadata alone.
- To complete that check tonight: run GitHub API/CLI against the repo remote and list `open` PRs by base branch.

## Production release strategy (tonight) — backend-first for Synthia

## Phase 0 (60–90 min): hard scope lock
1. Freeze Cooper frontend (`apps/web`) except urgent security fix.
2. Define deploy target as **Synthia backend APIs + required control endpoints only**.
3. Exclude nonessential vendored folders from runtime build context where possible.

## Phase 1 (2–3 hrs): remove stubs from critical path
1. LLM path: choose primary provider (OpenRouter/Anthropic), set secrets, disable stub fallback for production env.
2. Data path: configure Supabase credentials and validate writes/reads for agents, vibe nodes, telemetry.
3. Comms path: either fully wire WhatsApp/TikTok credentials or feature-flag those routes OFF tonight.
4. Remotion/video: keep behind feature flag if not fully provisioned.

## Phase 2 (90 min): release quality gate
1. Monorepo selective install/build for `apps/control-room` and API smoke tests.
2. Run endpoint health contract checks:
   - `/api/health`
   - `/api/dashboard`
   - `/api/synthia` (non-stub response expected)
   - `/api/vibe` ingest/read
3. Validate rate limiting and cost-guard behavior with real provider keys.

## Phase 3 (60 min): deploy & observe
1. Deploy backend to staging/prod environment (Vercel/VPS whichever is active path).
2. Run post-deploy smoke tests and log telemetry event ingestion.
3. Create go/no-go checklist:
   - no mock/stub in critical user journey
   - 200-level on core endpoints
   - secrets loaded
   - alerting enabled

## Phase 4 (post-launch, next 24–72h)
1. Migrate “TODO/mock” endpoints to production integrations in priority order:
   - newsletter subscription
   - project creation API
   - daily brief live providers
2. Add CI workflow matrix for `apps/control-room` + minimal e2e for key APIs.
3. Prune/archive non-runtime imported bundles under openclaw-logic to reduce cognitive and build noise.

## Critical blockers to resolve before saying “production-ready tonight”
- Any core endpoint returning stub responses in prod mode.
- Missing secrets for selected LLM provider or Supabase.
- No external PR visibility process (if team needs PR-based release approval).
- Lack of one-click rollback plan.

## Recommended command checklist for release captain
1. `git branch -a`
2. `npm --prefix apps/control-room ci`
3. `npm --prefix apps/control-room run build`
4. `npm --prefix apps/control-room run lint` (if available)
5. Smoke test script/curl against deployed URLs.

## Triple-check update (2026-05-05, UTC)

### What was re-checked
1. Repo inventory pass across top-level and extension distribution.
2. Frontend production build for `apps/web`.
3. Control Room production build for `apps/control-room`.
4. Internal link existence check for `apps/web/index.html`.

### Findings
- `apps/web` builds successfully with Vite.
- `apps/control-room` build currently fails in this environment for two reasons:
  - Google Fonts fetch errors (`Playfair Display`, `Space Grotesk`) during Next.js build.
  - Turbopack NFT tracing warning from dynamic filesystem usage path (`next.config.ts` via `src/lib/os-tools.ts` and `/api/synthia` route).
- Internal link check on `apps/web/index.html` shows missing local targets:
  - `/about`
  - `/work`
  - `/blog`
  - `/onboarding`

### Conclusion
The app is **not yet 100% production-ready** as-is. The highest-priority fixes before release are:
1. Resolve Control Room build blockers (fonts + tracing issue).
2. Fix or route-map broken internal frontend links listed above.
3. Re-run production builds and deploy smoke tests before go-live.
