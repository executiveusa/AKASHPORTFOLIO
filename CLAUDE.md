# CLAUDE.md — Kupuri Media™ / SYNTHIA™ Workspace Root

> This file is the entry point for ALL AI agents working in this repository.
> **MANDATORY BOOTSTRAP SEQUENCE** — execute in order before touching any code.

---

## ★ AGENT BOOTSTRAP SEQUENCE (Read This First, Every Time)

```
STEP 1 → Read .emerald-tablets-tm/PRIME_DIRECTIVE.md  (9 laws, mandatory)
STEP 2 → Load .agents/skills/frontend-design-meta/SKILL.md  (UI work)
STEP 3 → Load .agents/skills/mcp2cli/SKILL.md  (lazy MCP graph, never load all)
STEP 4 → Load .claude/skills/agentic-sop/SKILL.md  (Ralphy Loop protocol)
STEP 5 → Check apps/control-room/.impeccable.md  (design memory, evolves)
STEP 6 → Run: get_errors on apps/control-room/  (fix all before new code)
STEP 7 → For any file >500 lines: apply jcodemunch split before adding code
STEP 8 → Check emerald-tablets/superpowers/FRONTEND_DESIGN_SYSTEM.md
STEP 9 → ACK: "ZTE-PERSONA-v2.0 ACKNOWLEDGED | Agent: <name> | Role: <role>"
STEP 10 → For ANY new UI/design work: use POST /api/design/dispatch — never design from scratch inline
```

**Zero-Touch Engineering Protocol v2.0** — Ship → Test → Fix → Commit → Deploy → Verify → Notify

---

## Prime Directive

All agents operating in this workspace are governed by the **EMERALD TABLETS™**:

```
.emerald-tablets-tm/PRIME_DIRECTIVE.md
```

Read and internalize all 9 tablets before beginning work.

---

## Project Architecture (Index — DO NOT SCAN, READ THIS)

```
kupuri-media-cdmx/
├── apps/control-room/          # Next.js 15 App Router — MAIN APP (Vercel)
│   ├── src/app/                # 18+ pages (dashboard, spheres, theater, cockpit, alex, skills...)
│   ├── src/app/api/            # 131 routes — ALL BACKEND (watcher, telemetry, swarm,
│   │                           #   herald, spheres, income, revenue, mail, social, blog,
│   │                           #   health, cron, council, voice, vibe, agent-zero...)
│   ├── src/lib/                # 50+ lib files (herald, vibe-graph, synthia-api, litellm...)
│   ├── src/agents/             # alex/, fantasmas/, la-vigilante/, spheres/
│   ├── src/components/         # InviteGate, Footer, Breadcrumb, Theater components
│   └── .vercel/                # Connected: prj_gxvQdKNFxWIkEb37UsFqfyoOoThA
├── apps/web/                   # Static landing page (Vite)
├── apps/onboarding-flipbook/   # Onboarding UI
├── backend/                    # Rust Axum — future VPS backend (NOT used for MVP)
├── packages/synthia-core/      # Shared packages (9 sphere agents, morpho, ralphy...)
├── memory/                     # Project memory (CDMX, mission, history)
├── emerald-tablets/            # Law system — superpowers/ now populated
│   └── superpowers/FRONTEND_DESIGN_SYSTEM.md  # Tablet VI: Law of Refinement
├── .agents/skills/             # Skill graph (lazy load via mcp2cli)
│   ├── frontend-design-meta/   # Master UI meta-skill
│   ├── mcp2cli/                # MCP → CLI lazy bridge
│   ├── uncodixfy/              # Anti-AI-UI law
│   ├── agentic-sop/ (→.claude) # Ralphy Loop
│   └── ...20+ more skills
└── .emerald-tablets-tm/        # PRIME_DIRECTIVE.md (canonical)
```

**There are 131 API routes** — the Next.js API layer IS the backend. No separate server needed for MVP.

---

## Key Entry Points

| What | Where |
|------|-------|
| Agent framework | `agents.md` |
| Sphere OS | `apps/control-room/src/shared/sphere-state.ts` |
| HERALD tool topology | `apps/control-room/src/lib/herald/` |
| DB schema (run once) | `apps/control-room/src/lib/herald-schema.sql` |
| Cockpit UI | `apps/control-room/src/app/cockpit/` |
| Backend API routes | `apps/control-room/src/app/api/` (131 routes) |
| **Design dispatch** | `POST /api/design/dispatch` → Synthia Design Studio |
| **Design Studio** | `github.com/executiveusa/synthia-superdesign` |
| Task tracker | `.beads/issues.jsonl` (via `bd` CLI) |
| Memory | `memory/memory.md` |
| Design memory | `apps/control-room/.impeccable.md` |
| Skills graph | `.agents/skills/` (use mcp2cli to load lazily) |

---

## Quick Commands

```bash
# Dev server
cd apps/control-room && npm run dev

# Type check (must be 0 errors before commit)
cd apps/control-room && npx tsc --noEmit

# Task list
bd list

# Build (must pass before deploy)
cd apps/control-room && npm run build

# Smoke test (after build)
curl http://localhost:3000/api/health
curl -X POST http://localhost:3000/api/herald/dispatch \
  -H "Content-Type: application/json" \
  -d '{"intent":"quiero crear contenido","agent_id":"synthia"}'
```

---

## MCP Server Graph (Lazy — use mcp2cli bridge, never load all)

| Server | Capability | Load when |
|--------|-----------|-----------|
| `mcp_gitkraken_*` | Git operations | Branch/commit/PR work |
| `mcp_io_github_chr_*` | Chrome automation | Browser testing |
| `mcp_microsoft_pla_*` | Playwright | E2E tests |
| `mcp_higgsfield_*` | Video AI | Content generation |
| `mcp_worlds_*` | 3D worlds | Theater/sphere visuals |
| `supabase-mcp` | Database | Schema/query work |

**Rule**: Call `mcp2cli discover` first. Load only what the current task needs.

---

## Active Sprint

**ZTE-20260330-FINAL** — SYNTHIA 3.0 — 9 Screens Complete

Sprint board: `.beads/issues.jsonl`

---

## Planning & Design Protocol (Added 2026-03-30)

### Session Start — Always Run First
```bash
git fetch origin && git log --oneline -3
git branch -a | grep "claude/"
find apps/control-room/src -name "*.tsx" -o -name "*.ts" | xargs wc -l 2>/dev/null | sort -rn | head -10
```
Cherry-pick needed work from branches BEFORE writing new code.
jcodemunch any file >500 lines BEFORE editing it.
Context budget: 45k tokens per session.

### Screen Spec Format
Every new page/feature gets this spec before code:
- Route, Krug law (user knows X in N seconds), data sources, new APIs needed
- Design tokens from `.impeccable.md` ONLY — no generic shadcn defaults

### Anti-Hype Test
"What does Ivette do differently tomorrow because of this?"
If the answer is nothing external → don't build it.

### 9-Screen Target State (built 2026-03-30)
| Screen | Route | Status |
|--------|-------|--------|
| Dashboard | `/dashboard` | ✓ Built |
| El Panorama | `/panorama` | ✓ Built |
| Gastos | `/panorama/gastos` | ✓ Built |
| Tareas | `/cockpit/tasks` | ✓ Pre-existing |
| Chat Hermes | `/chat` | ✓ Built |
| Cockpit | `/cockpit` | ✓ Extended |
| Integraciones | `/integraciones` | ✓ Built |
| Casos | `/casos` | ✓ Built |
| Nuevo Proyecto | `/panorama/proyecto/nuevo` | ✓ Built |

Full specs: `ops/reports/WORKFLOW_MANIFEST.md`

---

*Root truth: `.emerald-tablets-tm/PRIME_DIRECTIVE.md`*
