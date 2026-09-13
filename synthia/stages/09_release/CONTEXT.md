# 09_release — ship with proof and a way back

One job: release the verified slice to preview then production with runtime evidence.

## Inputs
- Working: `GATES.md`, `GAUNTLET.md`, `ROLLBACK.md`
- Reference: `../../_shared/standards/release.md`

## Process
1. Preview deploy (Vercel). Re-run smoke oracles against the preview URL. → `PREVIEW VERIFIED`.
2. Present the approval packet: what changes, proof links, rollback command, spend impact.
3. On owner approval: promote. Re-run oracles against the production revision. → `PRODUCTION VERIFIED`.
4. Write `RECEIPT.md`.

## Outputs
- `RECEIPT.md`, `STATE.md` → `next_stage: 10_learn`

## Human check
Owner approves production release. Recorded verbatim in `APPROVAL.md`.
