# Codex Instructions

## Locked frontend policy
- `apps/web` is locked for visual/frontend edits.
- Only compatibility/deploy/build references may change when strictly required.

## Setup
- `npm install`
- `npm run audit:stubs`
- `npm run audit:routes`
- `npm run build:web`
- `npm run build:control`
- `npm run typecheck:control`
- `npm run lint:control`
- `npm run verify`

## Security rules
- No fake "done" stubs for production behavior.
- Every risky API route must include auth/role guard.
- Dangerous tools must stay disabled unless explicitly enabled by env.
- Keep secrets redacted in API responses.

## Guard requirements
- Canonical auth import: `@/auth`
- Use: `requireUser`, `requireAdmin`, `requireOperatorOrAdmin`, `requireCron`, `requireWebhookSignature`.

## Reporting
- Report all remaining stubs/mocks and unguarded high-risk routes.
- If internet is unavailable, mark upstream verification entries as `BLOCKED_BY_CODEX_WEB_ACCESS`.
