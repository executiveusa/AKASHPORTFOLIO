# Gauntlet bar for the OS: Hyperagent (docs.hyperagent.com) — "same and better"
Bar is fetchable (public docs + live app), comparable (agent OS for operators), relevant. Critic compares SYNTHIA screen-by-screen against Hyperagent's equivalent and against these capabilities. "Better" is defined per row.

| Hyperagent capability | SYNTHIA today | SYNTHIA target (run) | how we beat it |
|---|---|---|---|
| Named agents w/ config, model, tools, knowledge, invocations | 9 hardcoded spheres, personas in code | spheres table + per-sphere config UI (RUN-003) | spheres have *voice + culture + budget*, not just prompts |
| Multi-model catalog, reasoning effort | litellm TASK_TIER_MAP (dead keys) | Teknos model policy + router (RUN-002) | per-task tier is automatic, cost-visible per sphere |
| Sub-agent delegation | council-engine stages | council + herald dispatch (RUN-001/005) | anonymized 3-stage council with dissent, not just fan-out |
| Knowledge: skills, memories, rubrics, suggestions queue, auto-learning | skills-registry static; agent_memory; no rubrics | agentskills.io SKILL.md; memory recall; rubrics = GATES/Collins (RUN-005/008) | rubric = the Collins/voice score baked into every release |
| Live mode + schedules + approval gates + read-only defaults | crons; approvals table; no gates | La Vigilante gate + budget ledger + captain-hold (RUN-005) | approvals are *spoken* and one-tap; hard budget stops |
| Artifacts: docs, tables, webpages, slides, media, library, versions | assets/threads tables; no library UX | Library = Biblioteca (RUN-003) | every memo is an artifact with voice narration |
| Channels: Slack, email, Telegram, webhook | WhatsApp adapter, webhooks | unified gateway (RUN-005/007) | WhatsApp-first for LATAM |
| Command Center: active ops, cost, score trends | cockpit (mostly mock) | Observatorio = command center (RUN-001/003) | you *read the sky*; 4 readouts, not 40 cards |
| MCP: consume servers; expose agent as MCP server | mcp2cli graph; no exposure | `/api/mcp` exposing SYNTHIA tools (RUN-005) | SYNTHIA becomes a tool for Claude Code and Hermes |
| Browser + code execution | Agent Zero/OpenFang offline | skrun/sandcastle on VPS (RUN-006) | — parity |
| Data & security: OAuth scopes, allowlists, secrets | proxy.ts dead; 31 open routes | RUN-002 | Infisical-backed, probed nightly (G16) |
| Import from other platforms | — | later | — |

## 10 UX principles from Hyperagent to meet or beat (evidenced in their docs)
1 connect ≠ enable · 2 presets first, fine-tune second · 3 safe-by-default unattended · 4 suggestions wait; destructive needs a prior step · 5 artifacts save themselves · 6 delivery ≠ permission · 7 trust per doorway · 8 the thread is the record · 9 no blank forms (conversational config) · 10 empty is a legible state ("Todo en calma").
SYNTHIA adds: 11 voice-first status (you can hear the state) · 12 one governing metaphor per surface · 13 zero idle motion · 14 Spanish first, culturally reviewed by a sphere.

## Gauntlet procedure (08_gauntlet for OS surfaces)
Critic fetches hyperagent.com/docs + screenshots of the live app's equivalent screen (Command Center, agent config, library, approvals), places SYNTHIA's screenshot beside it blind, asks: *which would a Kupuri operator understand and trust faster?* Score Collins web card + this parity table. Floors: no row "worse" without an owner-approved reason; usability ≥ 8.5; clutter count (interactive elements on the meeting screen) ≤ 60% of Hyperagent's equivalent.
