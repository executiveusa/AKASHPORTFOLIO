# Synthia Control Room — Infra Blueprint

PATCH_002_SYNTHIA_CONTROL_ROOM_PRODUCTION

## Architecture

```
Internet → Traefik (80/443) → [ForwardAuth: oauth2-proxy]
                              → Dify (dify.<domain>)
                              → Langfuse (langfuse.<domain>)
                              → Open WebUI (chat.<domain>)

oauth2-proxy → Keycloak (OIDC) → Google (identity provider)
Keycloak ← Postgres
Langfuse ← Postgres
Dify ← Postgres + Redis
control-room (Next.js) ← Postgres (Supabase or direct)
```

## Prerequisites

1. Domain pointed to your server
2. Docker + Docker Compose v2

## Setup

```bash
cd infra
cp .env.example .env
nano .env          # Fill ALL values
touch traefik/acme.json && chmod 600 traefik/acme.json
docker compose up -d
```

## Keycloak Setup (first time)

1. Open http://YOUR_SERVER:8080 (temp port exposed)
2. Login with KEYCLOAK_ADMIN / KEYCLOAK_ADMIN_PASSWORD
3. Create realm: `synthia`
4. Add Google as Identity Provider (Social → Google)
   - Use GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET from your Google Cloud project
5. Create client `oauth2-proxy`:
   - Client Protocol: openid-connect
   - Access Type: confidential
   - Valid Redirect URIs: https://auth.<domain>/oauth2/callback
   - Copy client secret to OAUTH2_PROXY_CLIENT_SECRET
6. Remove the keycloak `ports:` mapping from docker-compose.yml after setup

## Dify Full Deployment Note

The `dify-api` service in docker-compose.yml is a minimal stub for routing reference.
For full Dify self-hosting (includes worker, sandbox, nginx, weaviate, etc.),
clone the official dify repo separately:

```bash
git clone https://github.com/langgenius/dify.git infra/vendor/dify
cd infra/vendor/dify/docker
cp .env.example .env  # Fill with your postgres/redis from this stack
# Update .env to point DB_HOST=host.docker.internal or use external DB
docker compose up -d
```

Set `DIFY_BASE_URL` in `apps/control-room/.env` to the dify service URL.

## Langfuse Full Deployment Note

The Langfuse service in docker-compose.yml uses the official `langfuse/langfuse:latest` image.
See https://langfuse.com/self-hosting/deployment/docker-compose for the latest configuration options.

## Google Auth Flow

1. User navigates to protected URL (e.g. dify.yourdomain.com)
2. Traefik ForwardAuth → oauth2-proxy → not authenticated
3. oauth2-proxy redirects to Keycloak login page
4. Keycloak shows "Login with Google" button
5. User authorizes via Google OAuth
6. Keycloak issues OIDC token → oauth2-proxy validates → sets cookie
7. Subsequent requests pass ForwardAuth check
8. X-Auth-Request-Email header passed to backend services

## control-room auth

The Next.js control-room uses NextAuth v5 with Google provider directly (not via Keycloak/oauth2-proxy).
Set NEXTAUTH_URL, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET in apps/control-room/.env.
