# ─── SYNTHIA / Kupuri Media — self-host Dockerfile (Coolify / VPS) ───────────
# Builds the control-room Next.js app as a standalone server for 24/7 agent runtime.
# Use this on Coolify: point the project at this repo + branch, set env vars from
# Cosmos_Vault.env, and Coolify builds + deploys this image with a real process
# (not serverless) so sphere agents stay warm and cron jobs run reliably.

# ─── Build stage ─────────────────────────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app

# Copy workspace manifests first for layer caching
COPY package.json package-lock.json ./
COPY apps/control-room/package.json ./apps/control-room/package.json
COPY packages/synthia-core/package.json ./packages/synthia-core/package.json
COPY apps/web/package.json ./apps/web/package.json

# Install all deps (legacy-peer-deps matches vercel.json)
RUN npm install --legacy-peer-deps

# Copy the rest of the source
COPY . .

# Build only the control-room (skip the flipbook — needs Rust/wasm-pack)
ENV SKIP_FLIPBOOK=1
ENV NEXT_TELEMETRY_DISABLED=1
RUN node scripts/build-all.mjs

# ─── Runtime stage ───────────────────────────────────────────────────────────
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy the standalone Next.js output + static assets
# Next standalone build produces .next/standalone and .next/static
COPY --from=builder /app/apps/control-room/.next/standalone ./
COPY --from=builder /app/apps/control-room/.next/static ./apps/control-room/.next/static
COPY --from=builder /app/apps/control-room/public ./apps/control-room/public

# Supabase migrations (run once on deploy via entrypoint or manually)
COPY --from=builder /app/apps/control-room/supabase/migrations ./supabase/migrations

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

USER nextjs
EXPOSE 3000

# The standalone server.js is at server.js in the standalone root
CMD ["node", "apps/control-room/server.js"]
