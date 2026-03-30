# CLAUDE.md — Kupuri Media™ / SYNTHIA™ Workspace Root

> This file is the entry point for all AI agents working in this repository.
> Read this FIRST before any other file.

## Prime Directive

All agents operating in this workspace are governed by the **EMERALD TABLETS™**:

```
.emerald-tablets-tm/PRIME_DIRECTIVE.md
```

Read and internalize all 9 tablets before beginning work.

---

## Key Entry Points

| What | Where |
|------|-------|
| Agent framework | `agents.md` |
| Sphere OS | `apps/control-room/src/shared/sphere-state.ts` |
| HERALD tool topology | `apps/control-room/src/lib/herald/` |
| DB schema (run once) | `apps/control-room/src/lib/herald-schema.sql` |
| Cockpit UI | `apps/control-room/src/app/cockpit/` |
| Backend (Rust) | `backend/src/` |
| Task tracker | `.beads/issues.jsonl` (via `bd` CLI) |
| Memory | `memory/memory.md` |

---

## Quick Commands

```bash
# Dev server
cd apps/control-room && npm run dev

# Type check
cd apps/control-room && npx tsc --noEmit

# Task list
bd list

# Build
cd apps/control-room && npm run build
```

---

## Active Sprint

**ZTE-20260319-0001** — HERALD Tool Topology + Full Phase Completion

Sprint board: `.beads/issues.jsonl`

---

## Installed Skills Packs (172 Total Active Skills)

### Quick Reference

```
Investigation:    7 antigravity + simota/scout/lens/trace
Orchestration:    6 antigravity + simota/nexus/titan/rally
Implementation:  13 antigravity + simota/builder/architect/schema
Security:         5 antigravity + simota/sentinel/canon/guardian
Design:           7 antigravity + simota/palette/canvas/vision
Testing:          5 antigravity + simota/judge/triage
────────────────────────────────
TOTAL:          38 (antigravity) + 105 (simota) + 29 (gstack) = 172
```

**Find skills by intent:** `/semantic-search` → describes what you need
**Full reference:** `.claude/skills/SKILLS_MANIFEST.md`

---

### simota/agent-skills (.claude/skills/simota/)

**105 specialized dev agents** for autonomous code operations. Key capabilities:

#### Investigation & Analysis
- **/Scout** — Bug investigation + root cause analysis
- **/Lens** — Codebase exploration ("Does X exist?", "How does Y flow?")
- **/Trace** — Behavioral/session data analysis, UX abandonment patterns
- **/Probe** — Code probing and dynamic introspection
- **/Researcher** — Deep research across docs and codebase

#### Orchestration & Planning
- **/Nexus** — Task orchestration, chains multiple agents
- **/Titan** — Product-level orchestration (what to build, priority ranking)
- **/Rally** — Multi-session parallel execution (4+ files, 2+ domains)
- **/Director** — Workflow direction and task sequencing
- **/Navigator** — Navigation across complex code flows

#### Implementation
- **/Builder** — Implementation execution and code generation
- **/Anvil** — Hardware/infrastructure patterns
- **/Scaffold** — Project structure generation
- **/Architect** — System architecture design
- **/Schema** — Database schema design and migrations

#### Security & Compliance
- **/Sentinel** — Security vulnerability detection (OWASP, injection, XSS)
- **/Canon** — Compliance checking (OWASP, WCAG, OpenAPI, PCI)
- **/Warden** — Access control and permission validation
- **/Breach** — Breach analysis and security incident response
- **/Guardian** — PR review strategy and code hardening

#### Design & Accessibility
- **/Palette** — Accessibility + design system fixes
- **/Canvas** — Visual design and component library
- **/Sketch** — UI/UX design patterns
- **/Vision** — Visual accessibility and color contrast
- **/Pixel** — Pixel-perfect implementation

#### Specialized Tools
- **/Ripple** — Impact analysis before changes (affects other modules?)
- **/Forge** — Generates project-specific skills from codebase patterns
- **/Realm** — Environment and configuration management
- **/Triage** — Bug triage and priority assessment

**Full documentation:** `.claude/skills/simota/_common/INTERACTION.md` (100+ agent profiles)

### garrytan/gstack (.claude/skills/gstack/)

**YC CEO dev workflow** — Product-first approach to building. Key commands:

#### Product & Planning
- **/office-hours** — Product reframe before building (use FIRST for new features)
- **/plan-ceo-review** — Find the 10-star product in the request
- **/plan-eng-review** — Lock architecture, data flow, edge cases before coding
- **/design-consultation** — Build design system, write DESIGN.md

#### Development & Release
- **/review** — Pre-ship PR review (required gate before merge)
- **/ship** — Test coverage audit + deploy verification
- **/qa** — Real browser QA, fixes bugs, re-verifies after fix
- **/qa-only** — Browser QA report only (no code changes)
- **/document-release** — Auto-update README, ARCHITECTURE.md, CLAUDE.md

#### Investigation & Debug
- **/investigate** — Systematic root cause debugging (10-step protocol)
- **/browse** — Web browsing (for gstack — use this, NOT Chrome MCP tools)

**Full documentation:** `.claude/skills/gstack/CLAUDE.md`

---

## Skills Usage Rules

1. **Web Browsing:** Always use `/browse` (gstack) for web tasks. NEVER use `mcp__claude-in-chrome__*` tools.
2. **New Features:** Run `/office-hours` (gstack) BEFORE starting any new feature.
3. **Pre-Merge:** Run `/review` (gstack) BEFORE every PR merge.
4. **Post-Deploy:** Run `/qa` (gstack) after every deploy.
5. **Parallel Work:** Use `/rally` (simota) when working across 4+ files or 2+ domains.
6. **Security:** Use `/sentinel` (simota) on all security-adjacent code.
7. **Accessibility:** Use `/palette` (simota) on all UI/design changes.

---

---

## Antigravity Awesome Skills Integration

**38 curated skills** from [antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills) registered in Sphere OS:

### By Sphere Role

- **Investigation**: error-detective, analyze-project, production-code-audit, code-quality-metrics
- **Orchestration**: workflow-orchestration-patterns, multi-agent-patterns, parallel-agents, architecture, brainstorming
- **Implementation**: architecture-decision-records, cqrs-implementation, event-sourcing-architect, ddd-*, c4-*, monorepo patterns
- **Security**: wcag-audit-patterns, memory-safety-patterns, error-handling-patterns
- **Design**: tailwind-design-system, radix-ui-design-system, hig-patterns, i18n-localization
- **Testing**: e2e-testing-patterns, testing-patterns, github-actions-templates

### Find Skills

```bash
# By sphere agent
/Scout      # error-detective, code-audit
/Lens       # code-quality, dependencies
/Nexus      # orchestration workflows
/Builder    # implementation patterns

# By semantic intent (RECOMMENDED)
/semantic-search
intent: [what you're trying to achieve]
context: [technical domain]
goal: [desired outcome]
```

### Full Inventory

See: `.claude/skills/SKILLS_MANIFEST.md` — complete reference with triggers, confidence scores, and HERALD integration.

---

## Semantic Search (Tablet VIII)

When you don't know the exact skill:

```bash
/semantic-search
intent: validate API types at compile time
domain: TypeScript + REST
goal: prevent runtime errors

# Returns top matches:
# ✅ [0.94] architecture-decision-records
# ✅ [0.88] prompt-engineering
# ✅ [0.82] testing-patterns
```

**How it works:**
- Semantic similarity matching (60%)
- Category match (25%)
- Recency weighting (15%)
- Weekly confidence decay (5%/day) per Tablet VIII

---

## Skills Summary

```
Skills Packs:
  simota/agent-skills:        105 agents (Scout, Lens, Nexus, Builder, Sentinel, etc.)
  garrytan/gstack:             29 skills (/office-hours, /review, /qa, /ship, /browse)
  antigravity-awesome-skills:  38 curated (error-detective, workflow-orch, e2e-testing, etc.)
  ────────────────────────────────────────────────────
  TOTAL:                       172 active skills

Sphere Assignment:
  Investigation (Scout/Lens/Trace):     7 antigravity + simota
  Orchestration (Nexus/Titan/Rally):   6 antigravity + simota
  Implementation (Builder/Architect):  13 antigravity + simota
  Security (Sentinel/Canon):            5 antigravity + simota
  Design (Palette/Canvas/Vision):       7 antigravity + simota
  Testing (Judge/Triage):               5 antigravity + simota

Decay Schedule: Weekly (Tablet VIII)
Confidence Decay: 5%/day
Registry: HERALD (.lib/herald/skills-registry.ts)
```

---

*Skills installed: 2026-03-29 | ZTE-20260319-0001 v2*
*Includes: simota (105) + gstack (29) + antigravity (38) = 172 total*
*Semantic search: enabled | Decay: weekly | Registry: HERALD*
*Root truth: `.emerald-tablets-tm/PRIME_DIRECTIVE.md` (Tablet III + VIII)*
