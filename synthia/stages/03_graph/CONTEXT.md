# 03_graph — shape the work

One job: convert ARCHITECTURE into an admitted task graph of independently verifiable nodes.

## Inputs
- Working: `ARCHITECTURE.md`, `BASELINE.md`
- Reference: `../../_shared/standards/graph-rules.md`, `../../_shared/schemas/task-node.yaml`

## Process
1. One node = one verifiable output with one owner, declared `reads/writes/owns`.
2. Edges only where a node truly reads another's output.
3. Prefer one vertical slice (council → voice → visuals) before fan-out.
4. Human-gate irreversible edges: schema migration on prod, deleting routes, deploy, spend.
5. Admit: no ownership collisions in parallel groups, no unbounded spawn, no node outside lock scope.

## Outputs
- `GRAPH.md` (Mermaid + node table), `STATE.md` → `next_stage: 04_spec`

## Human check
Only edges crossing a human gate.
