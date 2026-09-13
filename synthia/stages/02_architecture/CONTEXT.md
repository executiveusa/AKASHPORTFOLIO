# 02_architecture — choose the shape

One job: decide the target architecture for this run and the visual territory, with tradeoffs written down.

## Inputs
- Working: `BASELINE.md`, `PROJECT-LOCK.md`, `BAR.md`
- Reference: `../../_shared/design/voice-architecture.md`, `council-bus-and-graphics.md`, `visual-territories.md`
- Reference: `../../_shared/doctrine/heart-and-soul.md`, `collins-level.md`, `autonomy-guardrails.md`

## Process
1. Restate the essential path (Enter → Act → Review → Complete → Recover) for this run's user.
2. Choose provider chain, state owner (one boss per truth), event bus, and where each fact lives.
3. Apply the subtraction test to every proposed surface. Delete islands (`/api/voice` fake, `/api/theater/stream` stub) rather than fixing them.
4. Present the three visual territories; recommend one; do not merge them.
5. Write ADRs as short numbered decisions with the alternative rejected.

## Outputs
- `ARCHITECTURE.md` (ADRs, component map, data ownership table)
- `STATE.md` → `next_stage: 03_graph`

## Human check
Owner selects the visual territory (Collins Gate Four). Everything else proceeds.
