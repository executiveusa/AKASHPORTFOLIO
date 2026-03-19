# higgsfield-kling.md — Video Generation Skill
# Kupuri Media™ / Synthia Studio

---

## Overview

Two video generation APIs power Synthia Studio's visual content engine:

| Provider | Strength | Best For |
|----------|----------|----------|
| **Higgsfield** | Cinematic quality, motion control | World backgrounds, sphere avatars |
| **Kling** | Image-to-video, creative effects | Client content, pitch videos |

Both are available as MCP tools in `tools/mcp-higgsfield/` and `tools/mcp-kling/`.

---

## 10 Strategic Applications

1. **Meeting World Backgrounds** — Auto-generate cinematic video loops of each location (Kiosco, Zócalo, Xochimilco, Vallarta) for Three.js world backdrops
2. **Sphere Avatar Videos** — Each sphere gets a looping 3-second identity video in their color signature
3. **Client Pitch Videos** — CAZADORA requests Kling to create bespoke prospect videos on-the-fly
4. **A/B Visual Testing** — Generate 2 variants of a world, feed metrics to pauli-auto-research
5. **Nightly World Refresh** — Cron job renders new world ambiance each night (seasonal, time-based)
6. **Council Video Summary** — Post-meeting Higgsfield clip synthesizing key decisions
7. **Cultural Content for DRA. CULTURA** — On-demand social content for clients via Kling image-to-video
8. **Architecture Reveals** — Blender renders exported as GLB, then Higgsfield adds motion/atmosphere
9. **Multi-LLM Visual Context** — Rendered world frames sent to vision-capable LLMs for meeting context
10. **World-as-a-Service** — Complete branded video + 3D world package deployed to private client URL

---

## Prompt Engineering Rules (taste-skill)

### Higgsfield
```
[quality prefix] cinematic, 4K, architectural photography style
[location anchor] [real location description]
[time/light] [lighting descriptor]
[mood] [atmosphere without clichés]
[exclude] no people, no text, no watermarks, no lens flares
```

### Kling
```
[subject] [action verb] [environment]
[camera] [dolly/orbit/crane/handheld]
[style] photorealistic, [era/period if relevant]
[quality] sharp focus, natural lighting
```

---

## MCP Tool Reference

### Higgsfield
- `higgsfield_generate_video` — text/image → video
- `higgsfield_add_motion` — add motion to image
- `higgsfield_animate_scene` — location ID → cinematic scene
- `higgsfield_sphere_avatar` — sphere ID → avatar video
- `higgsfield_get_job_status` — poll job

### Kling
- `kling_text_to_video` — text → video
- `kling_image_to_video` — image + prompt → video
- `kling_video_effects` — apply effect to image
- `kling_world_flythrough` — location → fly-through
- `kling_get_task_status` — poll task

---

## Auth

- **Higgsfield:** JWT signed with `HIGGSFIELD_API_KEY_ID` + `HIGGSFIELD_API_KEY_SECRET`
- **Kling:** Bearer token `KLING_API_KEY`
- Both in `.env.local` (gitignored)

---

*Maintained by: ING. TEKNOS™ + DRA. CULTURA™ — Kupuri Media™*
