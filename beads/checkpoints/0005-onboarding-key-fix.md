id: bead-0005
timestamp: 2026-06-21T00:00:00Z
actor: claude
phase: onboarding-key-fix
repo: AKASHPORTFOLIO
branch: claude/tender-thompson-to58n8
files_changed:
  - apps/web/index.html
  - apps/onboarding-flipbook/index.html
  - apps/onboarding-flipbook/e2e/onboarding.spec.ts
decision: Standardized all onboarding localStorage keys to synthia_onboarding_seen
reason: >
  Three different keys were in use:
    - has_seen_onboarding (apps/web/index.html)
    - kupuri_onboarding_seen (apps/onboarding-flipbook/index.html CTA button handler)
    - kupuri_onboarding_seen (e2e/onboarding.spec.ts assertion)
  Canonical key per PRD: synthia_onboarding_seen
rollback_command: >
  git checkout apps/web/index.html
  apps/onboarding-flipbook/index.html
  apps/onboarding-flipbook/e2e/onboarding.spec.ts
risks: Existing users with old keys will re-see onboarding on next visit (one-time UX regression)
next_action: bead-0006 Windows route audit fix
human_needed: false
