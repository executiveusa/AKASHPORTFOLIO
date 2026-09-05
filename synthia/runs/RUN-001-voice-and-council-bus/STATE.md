# Run state — RUN-001 voice-and-council-bus
status: NOT READY (slice built, awaiting CHECK)
next_stage: 07_verify
mode: brownfield
revision: 987e690 (baseline audit) — rebind at intake with `git rev-parse HEAD`
bar_status: CHOSEN 2026-09-05 — voice: ElevenLabs Conversational AI es demo (north star: owner-recorded es-MX); visuals: Apple Intelligence Siri glow; OS: hyperagent.com/docs parity (standards/hyperagent-parity-bar.md)
lock_status: drafted-from-evidence
graph_status: admitted (N-1,N0,N1,N2,N3,N4,N5,N7,N8 built; N6 owner-gated)
spec_status: built-from-outline (BUILD-NOTES per node in BUILD-NOTES.md)
latest_verified_slice: none
production_verified: false

## Current blocker
None for LLM (keys live 13:40). Remaining: Supabase URLs unreachable from sandbox (verify not paused); GH_PAT/Notion dead.

## Single next action
CHECK: Vercel build of commit 8a9c2cb on synthia/icm-workspace → if READY run 07_verify (fresh subagent) then 08_gauntlet (critic brief).