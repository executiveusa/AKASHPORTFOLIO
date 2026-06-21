id: bead-0007
timestamp: 2026-06-21T00:00:00Z
actor: claude
phase: build-all-includes-flipbook
repo: AKASHPORTFOLIO
branch: claude/tender-thompson-to58n8
files_changed:
  - scripts/build-all.mjs
decision: Added build:flipbook step to scripts/build-all.mjs
reason: >
  Previous build-all.mjs only built apps/web and apps/control-room.
  apps/onboarding-flipbook was silently omitted.
  PRD requires all three apps to be included.
outcome: >
  build-all.mjs now runs build:web → build:control → build:flipbook in sequence.
  If Rust/wasm-pack are missing, a clear install message is printed instead of silent failure.
rollback_command: "git checkout scripts/build-all.mjs"
risks: CI environments without Rust/wasm-pack will fail the flipbook step — this is intentional (fail loudly)
next_action: bead-0008 flipbook build scripts
human_needed: false
