# Integration probe — 2026-09-05 (from Infisical: HERMES/prod ∪ Synthia 3.0/prod; values never logged)
Probe = one cheap authenticated GET per provider from this sandbox. 502 = sandbox egress proxy (host not reachable from here), not necessarily a bad key.

**UPDATE 13:40 — core LLM keys FIXED.** Owner regenerated OPEN_ROUTER_API into HERMES/dev; verified OK ($20 limit, 0 used) together with working ANTHROPIC_API_KEY + OPENAI_API_KEY from HERMES/dev. All three synced by the build agent into Synthia 3.0 dev/staging/prod and HERMES prod/staging (values never logged). Original probe: **OK 18 · FAIL 39 · MISSING 6.** Stripe, Vercel, Rime, Mercury2, Runway, HeyGen, DeepSeek, Moonshot, Venice, Airtable, Apify, AgentMail, Tailscale, Trigger, Kie are live.

| secret | status | note |
|---|---|---|
| `AGENT_MAIL_API` | OK |  |
| `AIRTABLE_API_TOKEN` | OK |  |
| `ANTHROPIC_API_KEY` | FAIL 401 | DEAD — 401 on /v1/models. Core LLM key. Regenerate at console.anthropic.com → Infisical. |
| `APIFY_API_KEY` | OK |  |
| `CLOUDFLARE_API_TOKEN` | FAIL 401 | 401 — token invalid/revoked |
| `COMPOSIO_API_TOKEN` | FAIL 502 | 502 via sandbox egress — unreachable from here, retest from Vercel |
| `COOLIFY_API_TOKEN+URL` | FAIL 502 | COOLIFY_URL is the placeholder your-coolify-instance.com |
| `CREEM_API_TOKEN` | FAIL 403 | 403 (webhook still works with its own signing secret) |
| `DEEPSEEK_API_KEY` | OK |  |
| `ELEVEN_LABS_API` | FAIL 401 | DEAD — 401 (irrelevant after Rime). |
| `FAL_AI_API` | FAIL 404 | 404 — endpoint guess; verify |
| `FIRECRAWL_API_TOKEN` | FAIL 401 | DEAD — 401 (daily-brief depends on it). |
| `GEMINI_API_KEY` | MISSING | MISSING in prod (HERMES/dev has it?) — add |
| `GH_PAT` | FAIL 401 | DEAD — 401 (classic ghp_, likely expired). Blocks GitHub MCP writes. |
| `GLM_API_KEY` | FAIL 401 | DEAD — 401 |
| `GOOGLE_AI_STUDIO_KEY` | MISSING | present in HERMES but 400/absent in Synthia prod probe — verify |
| `GOOGLE_API_KEY` | FAIL 400 | Not a Gemini key; Maps geocode returned 200 (body not inspected) — treat as Maps key |
| `GOOGLE_API_KEY_ALT` | FAIL 400 | same as GOOGLE_API_KEY |
| `GROQ_API_KEY` | FAIL 403 | 403 |
| `HEY_GEN_API` | OK |  |
| `HOSTINGER_API_TOKEN` | FAIL 403 | 403 |
| `HUGGINGFACE_API_KEY` | FAIL 401 | DEAD — 401 |
| `HUGGINGFACE_TOKEN` | FAIL 401 | DEAD — 401 |
| `INCEPTION_LABS_API_KEY` | MISSING | missing in Synthia 3.0 (MERCURY2 tokens OK) |
| `INCEPTION_MERCURY2_API_TOKEN` | OK |  |
| `KIE_API_TOKEN` | OK |  |
| `LITELLM_MASTER_KEY+BASE_URL` | FAIL ERR:URLError | BASE_URL=localhost:8000 — placeholder, not a deployment |
| `MERCURY2_API_TOKEN` | OK |  |
| `MINIMAX_API_KEY` | FAIL 404 | 401 on /v1/models |
| `MOONSHOT_AI_API` | OK |  |
| `NANO_BANANA_API_KEY` | FAIL 400 | Not Gemini (400); Maps 200 — mislabeled |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY+URL` | FAIL 502 | 502 — same as above |
| `NOTION_API_TOKEN` | FAIL 401 | DEAD — 401. Notion is canonical tracker; fix first. |
| `OMNIROUTE_API_KEY+BASE_URL` | FAIL ERR:URLError | unreachable base URL |
| `OPENAI_API_KEY` | FAIL 401 | DEAD — 401 |
| `OPENAI_API_KEY_ALT` | FAIL 401 | DEAD — 401 |
| `OPEN_ROUTER_API` | FAIL 401 | DEAD — 401 (sk-or-v1, 73 chars). litellm-gateway primary path is dark. |
| `OPUS_CLIP_API` | FAIL 403 | 403 — endpoint guess; verify |
| `ORGO_API_KEY` | FAIL 405 | 405 — endpoint guess |
| `PRINTFUL_API_KEY` | MISSING | missing in Synthia 3.0 prod (staging has it) |
| `PRINTIFY_KEY` | FAIL 403 | 403 |
| `REPLICATE_API_KEY` | FAIL 401 | DEAD — 401 |
| `REPLICATE_API_TOKEN` | MISSING | missing in Synthia 3.0 |
| `RESEND_API_TOKEN` | FAIL 403 | 403 on /domains and /api-keys — restricted-scope key (send-only?) or revoked |
| `RIME_API_TOKEN (chat temp)` | OK |  |
| `RTRVR_API_KEY` | FAIL 404 | 404 — endpoint guess |
| `RUNWAY_API_KEY` | OK |  |
| `STABILITY_API_KEY` | FAIL 403 | 403 |
| `STRIPE_PRIVATE` | OK |  |
| `STRIPE_SECRET_KEY` | OK |  |
| `SUPABASE_ACCESS_TOKEN` | FAIL 403 | 403 (management API) |
| `SUPABASE_SERVICE_ROLE_KEY+URL` | FAIL 502 | 502 via sandbox egress on both projects (sbbuxnyv…, kbphngxq…) — likely egress block OR paused projects; retest from Vercel |
| `TAILSCALE_API_KEY` | OK |  |
| `TELEGRAM_BOT_TOKEN` | FAIL ERR:InvalidURL | 403 after strip — value malformed/revoked |
| `TOGETHER_API_KEY` | MISSING | missing in Synthia 3.0 |
| `TRIGGER_SECRET_KEY` | OK |  |
| `TWILIO_ACCOUNT_SID+SECRET` | FAIL 401 | 401 — SECRET may be auth token vs API key secret |
| `UPSTASH_CONTEXT7_API` | FAIL 401 | 401 — verify endpoint/plan |
| `VAPI_PRIVATE_KEY` | FAIL 403 | 403 |
| `VENICE_API_KEY` | OK |  |
| `VERCEL_API_KEY` | OK |  |
| `VERCEL_API_TOKEN` | OK |  |
| `VERCEL_TOKEN` | FAIL 403 | 403 — stale; VERCEL_API_TOKEN + VERCEL_API_KEY are OK |

## Actions (RUN-002 N-secrets)
1. ~~Regenerate ANTHROPIC_API_KEY, OPEN_ROUTER_API~~ DONE 13:40. Still dead: GH_PAT (fine-grained), NOTION_API_TOKEN, FIRECRAWL_API_TOKEN → write to Infisical Synthia 3.0 (all envs). Re-run this probe (`scripts/probe-secrets.py`).
2. Delete dead/duplicate keys: ELEVEN_LABS_API (after Rime), OPENAI_API_KEY_ALT, VERCEL_TOKEN, REPLICATE_API_KEY, HUGGINGFACE_*; rename NANO_BANANA_API_KEY→GOOGLE_MAPS_API_KEY.
3. Replace placeholders: LITELLM_BASE_URL (localhost), COOLIFY_URL (your-coolify-instance.com), OMNIROUTE_BASE_URL.
4. RIME_API_TOKEN added to Synthia 3.0 dev/staging/prod today (temp token; rotate after RUN-001 PRODUCTION VERIFIED).
5. Wire `secrets-client.ts` to pull from Infisical at build (Infisical CLI `infisical run --env=prod`) or Vercel sync; every provider adapter reads env by the names above; app boots with a `/api/health/secrets` route that repeats this probe (names+status only) — that is gate G16.
6. Verify Supabase projects are not paused (502 from sandbox on both URLs); if paused, resume — everything depends on it.