# Open questions → owner (updated 2026-09-05 13:xx)
RESOLVED: name SYNTHIA™ · territory A Observatorio · bars chosen (voice ElevenLabs demo, visuals Siri glow, OS = Hyperagent docs) · Rime for voice · secrets rotate after build.
1. ~~Dead core LLM keys~~ RESOLVED 13:40 — new OpenRouter key verified, synced to Synthia 3.0 + HERMES all envs. Policy: free models default, paid via switcher (LLM_ALLOW_PAID=true to allow paid tiers for council).
2. Supabase both project URLs return 502 from the sandbox — confirm projects are not paused.
3. GH_PAT (401) and NOTION_API_TOKEN (401) dead — needed for repo writes and the canonical tracker.
4. Placeholders in Infisical: LITELLM_BASE_URL=localhost:8000, COOLIFY_URL=your-coolify-instance.com — supply real hosts or delete.
5. Second live Mexican voice: `thea`/`rosalie` on coda via REST (~4 s) or WS streaming? (default: WS)
6. Commit `synthia/` to branch `synthia/icm-workspace` — approved verbally ("yes i will have you build it"); pushing on next turn unless you object.
