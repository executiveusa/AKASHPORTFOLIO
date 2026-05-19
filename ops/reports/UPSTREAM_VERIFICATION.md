# Upstream Verification — PATCH_002

Verified: 2026-05-19

## Browser access status
BLOCKED_BY_BROWSER_ACCESS — no live browser control available in this environment.
All upstream URL checks are marked BLOCKED_BY_BROWSER_ACCESS per instructions.

## Deployed state checks
- https://akashportfolio-control-room.vercel.app/landing — BLOCKED_BY_BROWSER_ACCESS
- Dashboard/cockpit redirect target — BLOCKED_BY_BROWSER_ACCESS
- Sign-in domain check — BLOCKED_BY_BROWSER_ACCESS

## Upstream Documentation URLs

| URL | Result | Notes |
|---|---|---|
| https://docs.dify.ai/en/self-host/quick-start/docker-compose | BLOCKED_BY_BROWSER_ACCESS | |
| https://docs.dify.ai/en/self-host/configuration/environments | BLOCKED_BY_BROWSER_ACCESS | |
| https://docs.dify.ai/en/use-dify/publish/developing-with-apis | BLOCKED_BY_BROWSER_ACCESS | |
| https://docs.dify.ai/api-reference/workflows/run-workflow-by-id | BLOCKED_BY_BROWSER_ACCESS | |
| https://docs.dify.ai/en/use-dify/monitor/integrations/integrate-langfuse | BLOCKED_BY_BROWSER_ACCESS | |
| https://langfuse.com/self-hosting | BLOCKED_BY_BROWSER_ACCESS | |
| https://langfuse.com/self-hosting/deployment/docker-compose | BLOCKED_BY_BROWSER_ACCESS | |
| https://langfuse.com/docs/observability/sdk/overview | BLOCKED_BY_BROWSER_ACCESS | |
| https://langfuse.com/docs/observability/sdk/instrumentation | BLOCKED_BY_BROWSER_ACCESS | |
| https://langfuse.com/docs/observability/sdk/troubleshooting-and-faq | BLOCKED_BY_BROWSER_ACCESS | |
| https://docs.openwebui.com/ | BLOCKED_BY_BROWSER_ACCESS | |
| https://docs.openwebui.com/getting-started/quick-start/ | BLOCKED_BY_BROWSER_ACCESS | |
| https://www.keycloak.org/docs/latest/server_admin/index.html | BLOCKED_BY_BROWSER_ACCESS | |
| https://www.keycloak.org/securing-apps/oidc-layers | BLOCKED_BY_BROWSER_ACCESS | |
| https://oauth2-proxy.github.io/oauth2-proxy/installation | BLOCKED_BY_BROWSER_ACCESS | |
| https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview/ | BLOCKED_BY_BROWSER_ACCESS | |
| https://oauth2-proxy.github.io/oauth2-proxy/configuration/providers/openid_connect/ | BLOCKED_BY_BROWSER_ACCESS | |
| https://oauth2-proxy.github.io/oauth2-proxy/configuration/providers/keycloak_oidc/ | BLOCKED_BY_BROWSER_ACCESS | |
| https://oauth2-proxy.github.io/oauth2-proxy/configuration/session_storage/ | BLOCKED_BY_BROWSER_ACCESS | |
| https://doc.traefik.io/traefik/setup/docker/ | BLOCKED_BY_BROWSER_ACCESS | |
| https://doc.traefik.io/traefik/providers/docker/ | BLOCKED_BY_BROWSER_ACCESS | |
| https://doc.traefik.io/traefik/providers/file/ | BLOCKED_BY_BROWSER_ACCESS | |
| https://doc.traefik.io/traefik/middlewares/http/forwardauth/ | BLOCKED_BY_BROWSER_ACCESS | |
| https://a2a-protocol.org/latest/ | BLOCKED_BY_BROWSER_ACCESS | |
| https://github.com/a2aproject/A2A | BLOCKED_BY_BROWSER_ACCESS | |

## Infra Design Notes (based on known-good official sources)

The infra blueprint in `infra/docker-compose.yml` is based on official documentation patterns for each service:
- **Dify**: docker-compose based self-hosting, API port 3000, uses `langgenius/dify-api` and `langgenius/dify-web`
- **Langfuse**: `langfuse/langfuse:latest`, requires NEXTAUTH_SECRET, DATABASE_URL
- **Open WebUI**: `ghcr.io/open-webui/open-webui:main`
- **Keycloak**: `quay.io/keycloak/keycloak:latest`
- **oauth2-proxy**: `quay.io/oauth2-proxy/oauth2-proxy:latest`
- **Traefik**: `traefik:v3.1` with ForwardAuth middleware
