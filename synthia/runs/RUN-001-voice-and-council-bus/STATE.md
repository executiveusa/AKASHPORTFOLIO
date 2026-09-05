# Run state — RUN-001 voice-and-council-bus
status: NOT READY
next_stage: 00_intake
mode: brownfield
revision: 987e690 (baseline audit) — rebind at intake with `git rev-parse HEAD`
bar_status: CHOSEN 2026-09-05 — voice: ElevenLabs Conversational AI es demo (north star: owner-recorded es-MX); visuals: Apple Intelligence Siri glow; OS: hyperagent.com/docs parity (standards/hyperagent-parity-bar.md)
lock_status: drafted-from-evidence
graph_status: drafted
spec_status: outline
latest_verified_slice: none
production_verified: false

## Current blocker
None for LLM (keys live 13:40). Remaining: Supabase URLs unreachable from sandbox (verify not paused); GH_PAT/Notion dead.

## Single next action
N-1 (models: free-by-default + switcher) built 13:45, awaiting typecheck + owner review → push branch → 00_intake/01_discovery.
