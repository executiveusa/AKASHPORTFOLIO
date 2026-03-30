# FRONTEND DESIGN SYSTEM
## Emerald Tablet — Superpower VI: The Law of Refinement

> Installed: 2026-03-28
> Authority: Kupuri Media™ Sphere OS™ v2.0
> Governed by: La Vigilante, SYNTHIA™, uncodixfy, impeccable-design

---

## THE LAW

> "That which is built without taste is built twice.
> That which is built without intention is built forever wrong.
> That which is refined becomes a vessel for intelligence."

All frontend output in this system must pass through the Design Law before it reaches a user.
No component ships without answering: **Who sees this? What do they need to feel? What do they need to do?**

---

## SKILL GRAPH — Frontend Design Powers

This is the **lazy graph** of frontend design skills. They are not all loaded at once.
The agent selects the minimum required node for each task.

```
FRONTEND DESIGN GRAPH
─────────────────────────────────────────────────────────
LAYER 0 — ALWAYS ACTIVE
  └── uncodixfy           → Anti-AI-default enforcement (wall)

LAYER 1 — DESIGN FOUNDATION (load when building UI)
  ├── frontend-design-meta → Combined workflow (this system)
  ├── impeccable-design/frontend-design → Aesthetic direction
  └── taste-skill/taste-skill → Feel, motion, density settings

LAYER 2 — REFINEMENT (load when polishing existing UI)
  ├── impeccable-design/audit     → Quality scan + report
  ├── impeccable-design/normalize → Fix inconsistencies
  ├── impeccable-design/polish    → Surface-level refinement
  └── taste-skill/redesign-skill  → Upgrade existing projects

LAYER 3 — SPECIALIZATION (load only when specifically needed)
  ├── taste-skill/soft-skill       → Luxury, premium feel
  ├── taste-skill/minimalist-skill → Editorial, Notion-style
  ├── taste-skill/output-skill     → Force complete implementation
  ├── mattpocock/design-an-interface → Multiple design variants
  └── impeccable-design/delight    → Microinteractions, joy

LAYER 4 — ENFORCEMENT (auto-runs post-ship)
  └── La Vigilante audit           → Checks LAW compliance
─────────────────────────────────────────────────────────
```

---

## ACTIVATION PROTOCOL

When a task involves frontend output, the agent MUST:

```
1. LOAD uncodixfy (Layer 0) — always
2. LOAD frontend-design-meta — for any new component or page
3. CHECK .impeccable.md — project design memory
4. SET taste settings (variance / motion / density)
5. DESIGN IT TWICE — generate 2 directions, pick winner
6. BUILD — following the 10 Design Laws
7. AUDIT — run Layer 2 if time permits
8. UPDATE .impeccable.md — record what worked
```

---

## PROJECT DESIGN MEMORY

`.impeccable.md` lives at `c:\kupuri-media-cdmx\apps\control-room\.impeccable.md`

Format:
```
## [YYYY-MM-DD] Component: [name]
- Direction: COCKPIT / COUNCIL / LANDING / TERMINAL
- Taste: variance:[n] / motion:[n] / density:[n]
- Worked: [what was good]
- Avoid: [what failed]
- Notes: [anything future agents should know]
```

---

## VIBE GRAPH INTEGRATION

After major UI work, emit a Vibe Graph node so all agents know the visual state:

```bash
curl -X POST /api/vibe \
  -H "Content-Type: application/json" \
  -d '{
    "kind": "ingest",
    "agentId": "forjadora",
    "nodeKind": "ui_component",
    "label": "[component-name]",
    "content": "Direction: COCKPIT | Taste: 3/2/8 | Status: shipped"
  }'
```

---

## BANNED PATTERNS REGISTRY

These are permanently banned across all Kupuri Media UI. La Vigilante flags any match.

| Pattern | Why banned | Alternative |
|---------|-----------|-------------|
| `backdrop-blur` + `bg-white/10` | Glassmorphism | Solid bg + border |
| `rounded-full` on containers | Pill overload | `rounded-xl` max |
| `bg-gradient-to-*` on backgrounds | Gradient abuse | Solid color |
| `bg-linear-to-*` on hero text | Gradient text | Flat color |
| `shadow-glow` or colored shadows | Neon/glow | `shadow-sm` max |
| `animate-bounce` | Distracting | `transition-opacity` |
| `scale(1.05)` on card hover | Transform on cards | Background color change |
| `text-xs uppercase tracking-widest` headings | Eyebrow label | Real heading hierarchy |
| KPI card grid as dashboard default | AI dashboard cliché | Table/list/timeline |
| Hero section inside `/dashboard` | Marketing in product | Content-first layout |
| `#7c3aed` glow on dark bg | AI color palette | Flat violet + neutral |

---

## SKILL REGISTRY (all available, lazy-loaded)

| Skill | Path | Status | Load when |
|-------|------|--------|-----------|
| uncodixfy | `.agents/skills/uncodixfy/SKILL.md` | 🟢 ACTIVE | Always |
| frontend-design-meta | `.agents/skills/frontend-design-meta/SKILL.md` | 🟢 CREATED | Building UI |
| impeccable-design/frontend-design | `.agents/skills/impeccable-design/source/skills/frontend-design/SKILL.md` | 🟢 AVAILABLE | Deep design work |
| impeccable-design/audit | `.agents/skills/impeccable-design/source/skills/audit/SKILL.md` | 🟢 AVAILABLE | QA / review |
| impeccable-design/polish | `.agents/skills/impeccable-design/source/skills/polish/SKILL.md` | 🟢 AVAILABLE | Surface polish |
| impeccable-design/normalize | `.agents/skills/impeccable-design/source/skills/normalize/SKILL.md` | 🟢 AVAILABLE | Fix existing |
| taste-skill/taste-skill | `.agents/skills/taste-skill/taste-skill/SKILL.md` | 🟢 AVAILABLE | Feel/motion |
| taste-skill/redesign-skill | `.agents/skills/taste-skill/redesign-skill/SKILL.md` | 🟢 AVAILABLE | Upgrade existing |
| taste-skill/soft-skill | `.agents/skills/taste-skill/soft-skill/SKILL.md` | 🟢 AVAILABLE | Premium feel |
| taste-skill/minimalist-skill | `.agents/skills/taste-skill/minimalist-skill/SKILL.md` | 🟢 AVAILABLE | Editorial minimal |
| taste-skill/output-skill | `.agents/skills/taste-skill/output-skill/SKILL.md` | 🟢 AVAILABLE | Force completion |
| mattpocock/design-an-interface | `.agents/skills/mattpocock-skills/design-an-interface/SKILL.md` | 🟢 AVAILABLE | Multi-variant design |
| mcp2cli | `.agents/skills/mcp2cli/SKILL.md` | 🟢 CREATED | MCP bridge |

---

## MCP-TO-CLI INTEGRATION

For design tools that live in MCP servers (e.g., screenshot for design review):

```bash
# Screenshot current UI for design review (lazy load — chrome MCP only)
uvx mcp2cli --mcp-stdio "npx mcp-chrome-bridge" \
  screenshot --url "https://dashboard-agent-swarm-eight.vercel.app/cockpit" \
  --output "./playwright-screenshots/cockpit-review.png"

# Then load image for visual audit
# mcp_io_github_chr_take_screenshot — available via built-in MCP (no mcp2cli needed)
```

Rule: If a built-in VS Code MCP tool covers it, use that.
Only summon mcp2cli for servers NOT natively connected.

---

*Emerald Tablet VI — Sealed 2026-03-28 — Kupuri Media™*
*Compiled by: GitHub Copilot / Claude Sonnet 4.6*
*Maintained by: La Vigilante*
