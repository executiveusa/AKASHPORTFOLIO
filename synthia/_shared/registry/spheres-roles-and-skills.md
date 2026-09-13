# Sphere roles (hardened, non-overlapping) + skill assignments — 2026-09-05

Rule: one sphere owns one *question*. Overlaps are resolved by the question, not the topic.

| sphere | owns the question | NOT this | native skills (skills-registry.ts, fixed) | external skills/repos to install (from owner list) |
|---|---|---|---|---|
| **SYNTHIA** | *What is happening, who acts next, and did it get done?* — orchestration, council facilitation, memory/context, handoffs | strategy opinions, execution of tasks | daily-brief-generator, crisis-response-script | gauntlet-loop, claude-handoff, beads (task memory), paperclip (org/budget/heartbeats — pattern), A2A protocol, ralphy (bounded PRD loop runner), dictionary-of-ai-coding (vocab), NousResearch/hermes-agent (harness reference; bridge already in `lib/hermes/`) |
| **ALEX** | *What do we do this week and is it on track?* — execution PM, sprints, operator's inbox/calendar, support triage | long-horizon strategy (Consejo), building systems (Forjadora) | whatsapp-auto-reply, faq-auto-responder, refund-dispute-response, calendar-booking, meeting-notes-to-actions (moved from Forjadora) | i-have-adhd (action-first briefs), Agent-Reach (read-only social/inbox reach), OpenSpec (turn asks into specs before Forjadora builds) |
| **CAZADORA** | *Who should we sell to and what do we know about them?* — prospecting, lead qualification, market & competitor intelligence | writing persuasion copy (Seductora), tech/trend analysis (Teknos) | lead-qualifier, follow-up-automation, competitor-analysis, customer-persona-builder, market-research-brief (moved from Teknos) | perplexity MCP, Agent-Reach, claude-video (competitor video analysis), Apify (live key), Apollo/HubSpot herald CLIs |
| **SEDUCTORA** | *What do we say so they buy?* — positioning, paid + organic conversion copy, landing pages, brand narrative, media production | prospect research (Cazadora), cultural/editorial content (Dra. Cultura) | email-sequence-es, sales-proposal-generator, price-objection-handler, ad-copy-facebook-instagram, partnership-proposal, upsell-crosssell-script, supplier-negotiation, brand-voice-guide (moved from Dra. Cultura) | humanizer, no_ai_slop_writing_rules, claude-seo, impeccable, emilkowalski/skills, ihlamury/design-skills, cinematic-site-components, hyperframes-helper, scroll-world, GSAP, relume MCP, postiz (self-hosted scheduling), agent-media, opus-skills, content-ideas, NCA toolkit (RUN-006) |
| **DRA. CULTURA** | *Is this true to Mexico/LATAM and to who we are?* — cultural semiotics, editorial content, community, language review of everything es-MX/es-ES/es-PR | ads and conversion copy (Seductora) | content-calendar-generator, instagram-caption-es, tiktok-script-writer, linkedin-thought-leadership, blog-post-seo-mexico, hashtag-researcher-mexico, email-newsletter-es, youtube-script, podcast-outline, press-release-es, satisfaction-survey (moved from Consejo), 3 video demos | book-to-skill (turn brand/culture references into skills), vivliostyle (flipbook + print), marker (PDF→md ingestion), pauli-blog (parked until RUN-006) |
| **CONSEJO** | *Should we, and what happens if we do?* — 90-day+ strategy, ethics, decision framing, multi-model second opinions | weekly execution (Alex), money math (Dr. Economía) | 90-day-business-plan, pitch-deck-builder, latam-expansion-brief, grant-finder-mx | karpathy/llm-council (multi-model vote for high-stakes memos), skills-for-humanity (structured reasoning), kanwas (decision canvas) |
| **DR. ECONOMÍA** | *Can we afford it and what's the return?* — budgets, ledger, pricing, FX/arbitrage, cost of models & tools | approving spend (La Vigilante gates it) | invoice-generator, expense-categorizer, weekly-revenue-report, cash-flow-forecast | awesome-free-llm-apis, whichllm, free-claude-code (dev-cost), Stripe (live key) |
| **FORJADORA** | *How do we build it right?* — systems design, code, data, quality of what we ship | choosing vendors/stack (Teknos), reviewing others' code as gatekeeper (La Vigilante) | task-delegation, project-status-report, sop-writer, hiring-job-description-es, employee-onboarding | mattpocock/skills, paulsuperpowers, agent-rules-books, ponytail, unlazy, OpenSpec, context7, jcodemunch-mcp, ast-grep-mcp, graphify / Understand-Anything, opensrc, browser-harness, chonkie, docx, uigen, pretext, claude-code-harness, agentic_coding_flywheel_setup, dox, e2e-test skill |
| **ING. TEKNOS** | *Which technology, at what cost, at what risk?* — stack/vendor selection, infra, gateways, security posture, effort estimates | writing the code (Forjadora) | google-trends-brief-mx, industry-news-digest, ai-strategy-smb-es | synthia-gateway, claude-code-router, mcp2cli, supabase-mcp, ext-apps (MCP UI), skrun, sandcastle, open-agents, OpenHarness, absurd (durable workflows on Postgres), qdrant, atomic, e2a (agent email), InsForge (evaluate), rtk + caveman (token budget), awesome-ai-gateways, Tailscale/Vercel/Cloudflare (live keys) |
| **LA VIGILANTE** | *Is it safe, true, compliant, and proven?* — approvals, audits, QA, security, evidence, observability | building or fixing (hands back to Forjadora) | — (gatekeeper; consumes GATES.md) | adamsreview, greptileai/skills (greploop), stage-cli, e2e-test, langfuse (tracing/evals), hivemind, vibe_cockpit, claude-code-hooks-observability, full-stack-wiring-audit, Collins six-reviewer council |

## Moves that remove overlap (apply in skills-registry.ts SPHERE_BY_SKILL)
- meeting-notes-to-actions: forjadora → **alex** (execution, not systems)
- market-research-brief: ing-teknos → **cazadora** (market intel is one owner)
- brand-voice-guide: dra-cultura → **seductora** (voice = positioning); Dra. Cultura *reviews* it
- satisfaction-survey: consejo → **dra-cultura** (community listening)
- google-trends-brief-mx stays teknos only for tech trends; consumer trends → cazadora (split the skill in two ids)
- Forjadora vs Teknos: Teknos decides *what*; Forjadora builds *it*. Teknos never opens a PR; Forjadora never picks a vendor.
- Cazadora vs Seductora: Cazadora ends at a qualified lead + dossier; Seductora starts there.
- Alex vs Consejo: Alex = ≤ 30 days; Consejo = ≥ 90 days; the gap is a Council meeting.
- La Vigilante never fixes; she files. Every fix routes to the owner.

## Orchestrator (SYNTHIA) skill set — as it exists today
Native: council facilitation (council-engine 3-stage), context injection (vibe-graph `buildEcosystemSummary`, agent-memory), semantic tool routing (HERALD, currently keyword-only), daily brief, crisis script, dispatch to Agent Zero/OpenFang (offline), herald CLI catalog (15 marketing CLIs, 13 MCP servers, 9 cli-anything desktop tools, Postiz), Hermes bridge (`lib/hermes/*`: threads, memory, skills registry seed of 15, subagents, scheduler, tool policy), paperclip skill (create/assign tasks, goal tree, budget), opencli-rs skill, land-the-plane (review→PR→CI→merge).
Missing vs Hermes/Hyperagent: self-improving skill loop, cross-session FTS memory with recall, user model, unified messaging gateway, live-mode watcher with approval gates, rubric/eval loop, artifact library, MCP-server exposure of SYNTHIA herself.

## Hermes upstream — pull? **Yes, six things, as patterns + the existing bridge**
1. Skill loop (auto-create/refine skills from completed runs) → RUN-008.
2. FTS5 session search + LLM recall → RUN-005 memory.
3. Multi-platform gateway (Telegram/WhatsApp/Slack/Email in one process) → RUN-005/007; pairs with e2a for authenticated email.
4. `agentskills.io` SKILL.md standard → adopt for all sphere skills now (RUN-002) so Hermes/Hyperagent/Claude skills are portable.
5. Model hot-swap (`hermes model`) → expose as `/api/models` + Teknos policy.
6. `hermes doctor` → becomes `/api/health/secrets` + probe (G16).
Do NOT import Hermes as the runtime (Python, TUI, six terminal backends — wrong shape for Vercel). Keep `lib/hermes/` as the bridge to a Hermes instance on the Coolify VPS for long-running tasks. Use NousResearch/hermes-agent as source; the pauli-hermes-agent fork only if it carries Pauli-specific research endpoints the bridge already calls (`/research/*`).

## Parked (not useful to this OS now)
get-shit-done (archived), opencode-cloud, comimi, files.md, Agents-A1, stateright, fungible, space-agent, Real-ESRGAN, VisionClaw, poc-realtime-ai-assistant, native-feel-skill, gemma-skills, DreamCraft3D, airllm, awesome-deepseek-agent, my-podcast, html-in-canvas (watch), ytx design-ui-ux (reading list), pauli-taste-skill + pauli-Uncodixfy (superseded by impeccable; keep the *rules* merged into heart-and-soul).
