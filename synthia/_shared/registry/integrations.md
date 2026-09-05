# Integrations available to the build agent (names, not secrets)

- Rime AI — REST `users.rime.ai/v1/rime-tts`, WS `users-ws.rime.ai/ws3`, MCP `mcp.rime.ai`. Env `RIME_API_TOKEN`.
- Infisical — env `INFISICAL_TOKEN`, org id in `secrets-client.ts`. Source of all runtime secrets; sync to Vercel.
- Supabase — existing project; migrations in `supabase/migrations`, plus lib SQL files to consolidate.
- OpenRouter / Anthropic / LiteLLM — via `litellm-gateway.ts` TASK_TIER_MAP.
- Stripe, Creem, MercadoPago, PayPal, Coinbase Commerce — payment rails present in code, partially wired.
- GitHub (`executiveusa/AKASHPORTFOLIO`), Vercel (prj_gxvQdKNFxWIkEb37UsFqfyoOoThA), Cloudflare, Resend, Notion (canonical project tracking), Firecrawl, Webflow, Supabase MCP.
- Agent Zero / OpenFang / Dify — self-hosted runtimes, optional; never required by a slice.
- NCA toolkit — media API for RUN-006 (Docker `stephengpope/no-code-architects-toolkit`).
