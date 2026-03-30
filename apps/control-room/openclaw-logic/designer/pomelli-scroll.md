# pomelli-scroll.md — Open-Pomelli Studio Skill
# Kupuri Media™ / Synthia Studio
# Source: https://github.com/SamurAIGPT/Open-Pomelli

---

## What is Pomelli?

Open-Pomelli is an AI-generated scrolling narrative generator — it creates long-form vertical scroll experiences from structured content. Synthia uses it to turn council meeting outputs, research findings, and brand stories into beautiful scrolling presentations.

## Core Use Cases in Synthia Studio

1. **Client Onboarding Scrolls** — CAZADORA sends prospects a scroll-narrative intro to Kupuri Media
2. **Council Summary Scrolls** — Post-meeting synthesis from SYNTHIA delivered as a scroll
3. **Research Reports** — pauli-auto-research findings rendered as interactive scrolls
4. **World Showcases** — 3D world reveal experiences for new clients

## Integration Points

- **Input:** Council meeting transcript → SYNTHIA → Pomelli scroll
- **Output:** URL-shareable scroll hosted on Vercel or Coolify VPS
- **Trigger:** `POST /api/pomelli/generate { meetingId, format: 'scroll' }`

## Design Rules (taste-skill applies)

- One main message per scroll section
- Use sphere color accents for section headers (sphere who said it)
- Background: `#09090b`, sections separated by minimal `1px` divider
- Typography: 40px headings, 18px body — larger than dashboard because reading mode
- No progress bars, no "you are X% through" — let the scroll breathe

## Skill Files

- `pomelli-scroll.md` — this file (overview)
- `pomelli-api.md` — API reference (add after cloning repo)

---

*Maintained by: DRA. CULTURA™ — Kupuri Media™*
