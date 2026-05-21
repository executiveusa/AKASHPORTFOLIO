# To-Do Before Production — Synthia 3.0 HyperAgent

Last updated: 2026-05-21
Agent: patch/004-005-synthia-hyperagent-hermes-rebuild
Branch: patch/004-005-synthia-hyperagent-hermes-rebuild

---

## CRITICAL — Must ship before first user

### 1. Database migrations
Run these SQL files on the production Supabase instance (in order):

```
apps/control-room/supabase/migrations/003_synthia_hyperagent_hermes.sql
apps/control-room/supabase/migrations/004_synthia_rls.sql
```

These create 9 new tables:
- synthia_threads, synthia_messages, synthia_assets
- synthia_agents, synthia_projects, synthia_memory
- synthia_team_members, synthia_integrations, synthia_skills

Without these, every API route returns 500.

### 2. Environment variables on Vercel
Add to the `akashportfolio-control-room` Vercel project:

```
NVIDIA_NIM_BASE_URL=http://31.220.58.212:8082
NVIDIA_NIM_API_KEY=dummy
NVIDIA_NIM_MODEL=moonshotai/kimi-k2-thinking
```

NOTE: The NVIDIA NIM proxy is rate-limited at 40 req/min. Add exponential
backoff logic to all LLM calls (already present in nimChat helper).

### 3. Hermes integration (OPTIONAL for MVP)
If Hermes backend is available, set:
```
HERMES_BASE_URL=<your hermes instance>
HERMES_API_KEY=<secret>
HERMES_WORKSPACE_ROOT=<path>
HERMES_SAFE_MODE=true
```
All 7 Hermes adapter files are in apps/control-room/src/lib/hermes/.
The system degrades gracefully when HERMES_BASE_URL is unset.

### 4. Type check — fix before deploy
```bash
cd apps/control-room && npx tsc --noEmit
```
Known issues:
- council/orchestrator/route.ts has UTF-8 encoding corruption in comments (cosmetic, not blocking)
- Some lib files may have missing type exports — check after DB migration

### 5. Auth guard on /api/migrate
The /api/migrate route now has both requireAdmin() AND the legacy verifyCronSecret() check.
Before first deployment, pick one: either remove verifyCronSecret (rely on requireAdmin),
or keep both for defense-in-depth. Current state: both checks run (admin first).

---

## HIGH — Must complete in first sprint post-launch

### 6. ThreadComposer → /api/synthia/thread wiring
The ThreadComposer component (src/components/synthia/ThreadComposer.tsx) POSTs to
/api/synthia/thread which creates a thread record. After creation, it should redirect
to /thread/[id] automatically. Add router.push after successful POST.

Check: does ThreadComposer handle the ?prompt= and ?agent= URL params
that FeaturedSlugPage links to? If not, pre-populate the textarea from
useSearchParams() in the ThreadComposer.

### 7. AgentCreationWizard — Steps 2, 4, 5 are placeholder
Steps: Invocaciones (2), Skills (4), Conocimiento (5) show "próximamente".
These need real UI:
- Step 2 (Invocaciones): checkboxes for thread/voice/webhook/cron
- Step 4 (Skills): multi-select from /api/synthia/skills
- Step 5 (Conocimiento): file upload + text paste for context docs

### 8. Sidebar nav paths are top-level, AppShell has no layout.tsx
The Sidebar links to /threads, /agents, /projects, /learning, etc.
These pages use AppShell which includes Sidebar — but there is no
layout.tsx wrapping the HyperAgent routes. Each page renders its own
AppShell independently. This is fine but means navigation state (active
link highlighting) works correctly via usePathname(). Test on mobile:
the sidebar may need a hamburger collapse for <768px screens.

### 9. /api/synthia/featured route is missing
The FeaturedExamplesGrid links to /featured/[slug] pages.
The featured pages hardcode the 12 examples (no API call needed for MVP).
But there is no GET /api/synthia/featured route — if you need server-side
featured data (analytics, personalization), create it. For now skip.

### 10. BillingUsage — /api/synthia/billing tables
The billing API depends on budget_agent_daily table (already in migrations 001/002).
Verify columns: agent_id, date, total_tokens, total_cost_usd exist.

---

## MEDIUM — Nice to have for v1.0

### 11. Onboarding flipbook — WASM not compiled
The flipbook (apps/onboarding-flipbook/) has complete Rust/Bevy source but
the WASM binary is not compiled. Requires:
```bash
# On a machine with Rust + wasm-pack installed:
cd apps/onboarding-flipbook
wasm-pack build --target web --out-dir pkg
```
The stale URL (kupuri.vercel.app) has been fixed to akashportfolio-control-room.vercel.app.
Wire the compiled flipbook into the /onboarding page in control-room.

### 12. RecentThreads component timeout
The RecentThreads component fetches /api/synthia/thread?limit=5 on the home page.
If the DB tables don't exist yet (pre-migration), this throws a 500.
Add try/catch with empty-state fallback.

### 13. /synthia pages under /synthia/* — cleanup
During build, pages were scaffolded under BOTH /synthia/* AND top-level.
The /synthia/* dirs contain only empty directories — safe to delete.
Top-level /threads, /agents, etc. are the correct routes.
```bash
rm -rf apps/control-room/src/app/synthia/threads
rm -rf apps/control-room/src/app/synthia/thread
rm -rf apps/control-room/src/app/synthia/agents
rm -rf apps/control-room/src/app/synthia/library
rm -rf apps/control-room/src/app/synthia/learning
rm -rf apps/control-room/src/app/synthia/projects
rm -rf apps/control-room/src/app/synthia/teams
rm -rf apps/control-room/src/app/synthia/settings
rm -rf apps/control-room/src/app/synthia/featured
```

### 14. SubagentDispatchCard — subagent_jobs not returned by GET /thread/[id]
The ThreadDetail page reads meta.subagent_jobs but the GET /thread/[id] API
only returns thread + messages. Add subagent_jobs join to the query, or
create a separate GET /api/synthia/thread/[id]/jobs endpoint.

### 15. Mobile layout for AppShell/Sidebar
Sidebar is fixed 220px wide — on phones it will overflow.
Need responsive breakpoints: collapse sidebar to icon-only at <768px,
hamburger drawer at <480px.

### 16. Real-time thread updates (SSE / WebSocket)
Currently ThreadView polls via manual send only. For long-running agent tasks,
thread messages should stream in via SSE. Consider using Supabase Realtime
subscriptions on the synthia_messages table.

---

## LOW — Post-v1 polish

### 17. Council orchestrator UTF-8 encoding corruption
File: apps/control-room/src/app/api/council/orchestrator/route.ts
Comments contain garbled UTF-8 (Ã¢â‚¬â€ etc). Cosmetic only, not breaking.
Fix: re-save file with proper encoding.

### 18. AgentPicker search
Add search/filter to AgentPicker when agent count > 10.

### 19. Library page type filter
Currently shows all asset types from DB. If empty (no assets yet),
the filter only shows "Todos" with no other options. This is correct
behavior but may confuse users — add placeholder type options.

### 20. Featured examples → analytics
When a user clicks "Usar este ejemplo", track the event.
Add a POST /api/analytics/track call from the featured page.

---

## Security review — completed items

These were applied in this patch:
- [x] /api/migrate — requireAdmin() guard added
- [x] /api/swarm — requireAdmin() on GET + POST
- [x] /api/council/orchestrator — requireAdmin() on GET + POST
- [x] /api/synthia/route — requireOperatorOrAdmin()
- [x] /api/synthia/agent — requireOperatorOrAdmin()
- [x] /api/webhooks — requireWebhookSignature()
- [x] /api/vapi/tools — requireWebhookSignature()
- [x] /api/code-mode/status — requireUser()
- [x] /api/code-mode/toggle — requireOperatorOrAdmin()
- [x] All new /api/synthia/* routes — requireUser() minimum

Remaining unreviewed routes:
- Run: grep -r "export async function" apps/control-room/src/app/api/ | grep -v "requireUser\|requireAdmin\|requireOperator\|requireCron\|requireWebhook"
  Then cross-check against src/lib/auth/guards.ts for any missed protections.

---

## Known bugs (found during review)

1. /api/synthia/thread/[id] POST — if NIM proxy is unreachable (network policy),
   returns a graceful error message but does NOT update the thread status to 'paused'.
   Fix: add .update({ status: 'paused' }) on NIM failure.

2. IntegrationsGrid — optimistic toggle reverts on network error (correct behavior),
   but UX shows no toast/feedback on revert. Add error toast.

3. AgentCreationWizard — on POST /api/synthia/agents success, redirects to /agents.
   If Supabase returns 409 (duplicate name), the error is swallowed silently.
   Fix: display error in the wizard UI.
