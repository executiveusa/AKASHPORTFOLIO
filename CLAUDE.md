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

## Installed Skills Packs

### simota/agent-skills (.claude/skills/simota/)

**100 specialized dev agents** for autonomous code operations. Key capabilities:

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

*Skills installed: 2026-03-29 | ZTE-20260319-0001 | simota v1.0 + gstack v1.0*

*Root truth: `.emerald-tablets-tm/PRIME_DIRECTIVE.md`*
