# SYNTHIA™ — ICM workspace (Kupuri Media agentic OS)

This folder is the operating system's *build* brain. It routes one agent through the Loop Engineering lifecycle
(INTENT → BAR → LOCK → EVIDENCE → GRAPH → SPEC → SLICE → BUILD → VERIFY → GAUNTLET → RELEASE → LEARN)
against the product in `../apps/control-room`. Folders carry sequencing, files carry state. Read small; link, don't copy.

Product name: SYNTHIA™ (owner to confirm final public name — see `_shared/registry/open-questions.md`).

## Where things live

| Folder | What it holds |
|---|---|
| `CONTEXT.md` | lifecycle router: which stage is next and what it reads |
| `stages/NN_*/CONTEXT.md` | one contract per stage — read exactly one at a time |
| `_shared/doctrine/` | product/design law: heart-and-soul, collins-level, autonomy-guardrails |
| `_shared/standards/` | bar-and-gauntlet, evidence, graph rules, release words, security floor |
| `_shared/registry/` | the truth tables: spheres+voices, pages, routes, wiring bugs, markets, integrations |
| `_shared/design/` | the upgraded design: voice architecture, council bus + graphics, visual territories |
| `_shared/reference-impl/` | copy-ready reference code (Rime adapter, council bus). Not wired until a slice admits it |
| `_shared/schemas/` | YAML shapes for lock, node, gate, receipt |
| `_templates/RUN/` | blank run packet — new run = copy, never a blank page |
| `runs/` | live state. `runs/RUN-001-voice-and-council-bus/STATE.md` is where you are |
| `HANDOFF-PROMPT.md` | the single paste-ready prompt that drives everything here |

## Route by what just happened

| If | Go to | Stop at |
|---|---|---|
| fresh session | `runs/<active>/STATE.md` → the `next_stage` it names | that stage's human check |
| no active run | copy `_templates/RUN/` → `runs/RUN-00N-<slug>/`, then `stages/00_intake/CONTEXT.md` | owner picks the bar |
| asked "status" | scan `runs/*/STATE.md` + `GATES.md` | report; add nothing |
| asked to touch voice | `_shared/design/voice-architecture.md` + `_shared/registry/spheres.md` | — |
| asked to touch spheres/3D | `_shared/design/council-bus-and-graphics.md` | — |
| asked to touch a page/route | `_shared/registry/pages.md` / `routes.md` first | — |
| asked about roles/skills/which sphere | `_shared/registry/spheres-roles-and-skills.md` | — |
| asked about secrets/APIs | `_shared/registry/integrations-probe.md` + `scripts/probe-secrets.py` | never print values |
| first-run / onboarding / flipbook | `_shared/design/observatorio-and-first-run.md` | — |
| OS-level gauntlet | `_shared/standards/hyperagent-parity-bar.md` | — |

## Hard rules (priority order)
1. Owner authority: bar, irreversible actions, production release are human gates. Never self-approve.
2. Secrets never enter this folder, prompts, logs or commits. Env names only (`RIME_API_TOKEN`, `INFISICAL_TOKEN`).
3. Presence is not completion. Use only `NOT READY | READY FOR PREVIEW | PREVIEW VERIFIED | PRODUCTION VERIFIED`.
4. One writer per owned artifact. Parallelize only admitted independent nodes.
5. Spanish (es-MX) is the default language of the product and its voice; English is a switch, not a fallback.
