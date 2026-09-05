# Security floor for every slice
- Every API route: a guard from `src/lib/auth/guards.ts` (`requireUser`, `requireOperatorOrAdmin`, `requireAdmin`, `requireCron`, `requireWebhookSignature`) or an explicit `// public: reason` comment.
- Every LLM-facing route: `checkRateLimit()` (Redis-backed once RUN-002 lands) and `sanitizeForLLM()` with es/pt injection verbs added.
- No secret in client bundles; audio/LLM/vendor calls proxied server-side. Env names documented in `registry/integrations.md`.
- Webhooks: real HMAC verification (Creem fix), replay protection.
- Logs: `redactForLogging()` on any payload containing user text.
- RCE surfaces (`/api/video/watch`, CLI proxies) gated `requireAdmin` + allowlist or deleted.
