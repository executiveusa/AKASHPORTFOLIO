# ◈ EMERALD TABLETS™ — Superpower: Video Watch (Tablet IX Extension)
> Installed: 2026-05-07
> Authority: Tablet IX — EMERALD SEAL™
> Skill source: https://github.com/bradautomates/claude-video (MIT License)

---

## Superpower: VIDEO_WATCH

Any SYNTHIA™ Sphere agent can now analyze YouTube and yt-dlp-supported video URLs.

### Sphere Ownership

| Sphere | Use Case |
|--------|----------|
| **DRA. CULTURA** | Viral content analysis, hook structure, competitor content |
| **CAZADORA** | Competitor demos, pitch videos, sales content |
| **ING. TEKNOS** | Technical tutorials, architecture talks, code demos |
| **MORPHO** | Daily brief video summarization |
| **SYNTHIA** | Strategic business videos, investor pitches |
| **ALEX** | Market research, LATAM trend videos |

### Usage

```typescript
import { watchVideo, videoPresets } from '@/lib/skills/video-watch';

// Direct call
const result = await watchVideo({
  url: 'https://youtube.com/watch?v=...',
  question: '¿Qué hace viral este video?',
  sphereId: 'dra-cultura',
});

// Presets
await videoPresets.contentAnalysis(url);    // DRA. CULTURA
await videoPresets.competitorResearch(url); // CAZADORA
await videoPresets.technicalReview(url);    // ING. TEKNOS (1024px res)
await videoPresets.summarize(url);          // MORPHO
```

### API

```
POST /api/video/watch
{
  "url": "https://youtube.com/watch?v=...",
  "question": "¿Cuál es el hook?",
  "sphereId": "dra-cultura",
  "startTime": "0:00",
  "endTime": "0:30"
}
```

### Environment

| Variable | Purpose | Required |
|----------|---------|----------|
| `GROQ_API_KEY` | Whisper transcription (preferred) | Recommended |
| `OPENAI_API_KEY` | Whisper fallback | Optional |
| `NEXT_PUBLIC_SYNTHIA_BACKEND_URL` | Routes to VPS on Vercel | Required on Vercel |

### Server Setup (VPS/Railway — NOT Vercel)

```bash
apt install yt-dlp ffmpeg python3   # Ubuntu
# or: brew install yt-dlp ffmpeg    # macOS

git clone https://github.com/bradautomates/claude-video.git \
  apps/control-room/src/lib/skills/claude-video
```

### Tablet Compliance

- **Tablet I**: Sphere describes what it sees; Ivette decides what to do ✅
- **Tablet III**: Results ingested as vibe_nodes (kind: 'fact') with source URL ✅
- **Tablet IV**: Zero-touch — sphere downloads, processes, reports without handholding ✅
- **Tablet VII**: URLs validated before yt-dlp. Audio only to Groq/OpenAI API. Keys in env only ✅
