id: bead-0008
timestamp: 2026-06-21T00:00:00Z
actor: claude
phase: flipbook-build-scripts
repo: AKASHPORTFOLIO
branch: claude/tender-thompson-to58n8
files_changed:
  - apps/onboarding-flipbook/package.json
decision: Added build:wasm and build scripts to apps/onboarding-flipbook/package.json
reason: >
  package.json had no build script — only test:e2e and serve.
  wasm-pack build --target web --out-dir out is the correct command for the Bevy cdylib target.
  index.html already references ./out/onboarding_flipbook.js at tryLoadWasm().
  vercel.json catch-all route serves out/ directory contents correctly.
outcome: >
  Running `npm run build` in apps/onboarding-flipbook will invoke wasm-pack
  and produce artifacts in apps/onboarding-flipbook/out/.
  index.html imports ./out/onboarding_flipbook.js — matches wasm-pack output.
  Bevy WASM build requires: rustup target add wasm32-unknown-unknown + cargo install wasm-pack
rollback_command: "git checkout apps/onboarding-flipbook/package.json"
risks: wasm-pack output may differ from expected filename if Cargo lib name differs — verify after first build
next_action: bead-0009 verification results
human_needed: false
