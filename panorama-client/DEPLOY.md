# panorama-client — Vercel Deployment Guide

## Prerequisites

- Supabase project with RLS enabled (share with control-room or separate project)
- Environment variables from `.env.example`

## Step 1: Create Vercel Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the `executiveusa/akashportfolio` GitHub repo
3. **Set Root Directory** to: `panorama-client/apps/web`
4. Framework: Next.js (auto-detected)
5. Build command: `cd ../.. && pnpm build --filter=web` (from `vercel.json`)

## Step 2: Add Environment Variables

In Vercel project settings → Environment Variables, add all vars from `.env.example`:

| Variable | Required | Where to get it |
|----------|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✓ | Supabase project → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✓ | Supabase project → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | ✓ | Supabase project → Settings → API |
| `NEXT_PUBLIC_VAPI_PUBLIC_KEY` | ✓ | app.vapi.ai → Account |
| `ANTHROPIC_API_KEY` | ✓ | console.anthropic.com |
| `NEXT_PUBLIC_PANORAMA_API_URL` | Optional | Set when Rust API is deployed |
| `DEEPL_API_KEY` | Optional | deepl.com/pro-api |

## Step 3: Apply Supabase Migrations

The panorama-client needs its own schema (boards, columns, cards, phase_gates):

```bash
# From the panorama-client/services/panorama-api directory
supabase migration up --project-ref YOUR_PROJECT_REF
```

Or apply SQL files manually in Supabase dashboard → SQL Editor.

## Step 4: Deploy

Click **Deploy** in Vercel. Build takes ~2 minutes.

After deploy, the app will be available at:
- `https://panorama-client-YOUR_HASH.vercel.app`

Assign a custom domain: `panorama.kupuri.app`

## Step 5: Verify

- `/en/dashboard` — shows tenant dashboard
- `/en/kanban/{boardId}` — kanban board (needs a board in DB)
- `/en/kanban/{boardId}` with VoiceOrb — tap mic, say "mover X a revisión"

## What Works Without the Rust API

The following works with Supabase direct only (no Rust API needed):
- Board/column/card display
- Adding cards (Column component → Supabase insert)
- Phase gates and approval
- Real-time chat (Synthia chat pane)

The following requires `NEXT_PUBLIC_PANORAMA_API_URL` to be set:
- Drag-and-drop card moves (calls PATCH /api/v1/cards/{id}/move)
- Voice card moves
- WebSocket real-time sync (/ws/board/{boardId})

## Offline Queue

Card moves that fail (Rust API down) are queued in IndexedDB (`offline-queue`) and
replayed when the connection is restored. Users see a sync indicator in the board header.
