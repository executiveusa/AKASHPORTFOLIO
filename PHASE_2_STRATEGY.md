# STAGE 7 Phase 2 & Beyond — Synthia 3.0 Agent Orchestration

**Status**: Phase 1 (Brand System) ✅ COMPLETE | Phase 2 → Ready for next decision

---

## Strategic Direction: Ralphy + jcodemunch Pattern

### The Build Loops

**Ralphy Loop** (Minimal Agentic Pattern):
```
Ask → Plan → Execute → Observe → Iterate
↑________________← (feedback)
```

Apply to Phase 2:
1. **Ask**: "Build agent bridge APIs"
2. **Plan**: 8 API routes, mock responses first
3. **Execute**: Deploy to /api/llm-council, /api/agentmail, /api/voice/start, etc.
4. **Observe**: Integration tests, E2E tests in Theater
5. **Iterate**: Fix failures, loop back to Ask with feedback

### Token Compression

Use **jcodemunch-mcp** for multi-file exploration:
- `npm exec jcodemunch-mcp` (compresses large contexts)
- ~30-50% token savings on Phase 2 (8 routes + Theater + VRM components)
- Especially useful for integrating PersonaPlex (large voice model)

---

## Phase 2 Options (User Decision Required)

### **OPTION A: Full Agent Orchestration** (5-7 days)

Build the complete agent bridge layer:

#### Week 1: API Bridges
- `POST /api/llm-council` → LLM Council FastAPI (3-stage deliberation)
- `POST /api/agentmail` → Inter-agent messaging (Agent Mail protocol)
- `POST /api/voice/start` → PersonaPlex (real-time speech-to-speech)
- `POST /api/litellm` → Smart LLM routing (fast/balanced/powerful models)
- `POST /api/whatsapp` → ClawdBot gateway (Ivette messages → agents)
- `POST /api/telegram` → ClawdBot gateway (same)
- `POST /api/theater/session` → Start/stop council meetings
- `GET /api/theater/stream` → SSE real-time event stream

#### Week 2: 3D Council Chamber
- `apps/control-room/src/app/theater/page.tsx` (full-screen scene)
- `apps/control-room/src/components/CouncilChamber.tsx` (Three.js + VRM)
- `apps/control-room/src/components/AgentAvatar.tsx` (VRM with lip-sync)
- `apps/control-room/src/lib/theater-client.ts` (SSE + PersonaPlex bridge)
- VRM avatar assets (`/public/avatars/synthia.vrm`, etc.)
- Lip-sync morphing (A/I/U/E/O phonemes)

#### Deliverable
- Theater at `/theater` routes to 3D council chamber
- Agents meet autonomously, observable in real-time
- Ivette can interrupt, approve, or reject proposals
- E2E tests for each component

### **OPTION B: Deploy to VPS + CDMX Beta** (2-3 days)

Skip Phase 2, launch with current dashboard:

#### Day 1: Prepare
- Apply supabase-schema.sql to 31.220.58.212 PostgreSQL
- Configure .env for VPS (Supabase, Claude API, Vercel)
- Build Docker image: `docker build -t synthia-control-room:latest .`

#### Day 2: Deploy
- Push to Coolify (31.220.58.212:8000)
- Health check: `curl http://localhost:3001/api/health`
- Register domain (synthia-mexico.mx or similar)

#### Day 3: Launch Beta
- TikTok thread: "Synthia 3.0 — tu CEO invisible. Invita a 50 emprendedoras CDMX/PR"
- WhatsApp group: Kupuri Media Latina community (~200 members)
- Invite code: KUPURI2026
- Gather feedback: NPS, feature requests, pain points

#### Deliverable
- Live at https://synthia-mexico.mx (or AWS domain)
- 50-100 beta users on waitlist
- Real user feedback on current dashboard (no council chamber yet)
- Go/no-go decision for full Phase 2 build based on traction

---

## Token Budget: Phase 2 Option A

Using `jcodemunch-mcp` for context compression:

| Task | Est. Tokens | Compressed | Savings |
|---|---|---|---|
| Explore LLM Council repo | 8K | 4K | 50% |
| 8 API routes (scaffold) | 12K | 6K | 50% |
| Theater component (Three.js) | 10K | 5K | 50% |
| VRM integration (@pixiv) | 6K | 3K | 50% |
| Integration + testing | 8K | 4K | 50% |
| **TOTAL** | **44K** | **22K** | **50%** |

### Usage
```bash
# When exploring large repos
jcodemunch "[files to compress]" --output compressed.md

# In prompts
"Use jcodemunch on PersonaPlex repo, then integrate..."
```

---

## File Structure: Phase 2 Outcome

If Option A is chosen:

```
apps/control-room/
├── src/app/
│   ├── api/
│   │   ├── llm-council/route.ts ← NEW
│   │   ├── agentmail/route.ts ← NEW
│   │   ├── voice/start/route.ts ← NEW
│   │   ├── litellm/route.ts ← NEW
│   │   ├── whatsapp/route.ts ← NEW
│   │   ├── telegram/route.ts ← NEW
│   │   ├── theater/
│   │   │   ├── session/route.ts ← NEW
│   │   │   └── stream/route.ts ← NEW (SSE)
│   │   └── synthia/route.ts ← UPDATE (use LiteLLM)
│   ├── theater/
│   │   └── page.tsx ← NEW (full-screen 3D scene)
│   ├── dashboard/page.tsx ✅ (DONE)
│   ├── globals.css ✅ (DONE)
│   └── layout.tsx ✅ (DONE)
├── src/components/
│   ├── CouncilChamber.tsx ← NEW (Three.js scene)
│   ├── AgentAvatar.tsx ← NEW (VRM + lip-sync)
│   ├── CouncilTranscript.tsx ← NEW (live transcript)
│   ├── IvetteControls.tsx ← NEW (interrupt/approve/reject)
│   └── InviteGate.tsx ✅ (DONE)
├── src/lib/
│   ├── theater-client.ts ← NEW (SSE + PersonaPlex bridge)
│   ├── council-bridge.ts ← NEW (LLM Council client)
│   ├── messaging-gateway.ts ← NEW (ClawdBot bridge)
│   ├── agent-mail.ts ← NEW (inter-agent protocol)
│   └── persona-voices.ts ← NEW (agent voice assignments)
├── public/
│   ├── images/work-item-3.jpg ✅ (DONE)
│   └── avatars/
│       ├── synthia.vrm ← NEW
│       ├── claudecode.vrm ← NEW
│       ├── switchblade.vrm ← NEW
│       └── agent-zero.vrm ← NEW
└── .env.local (update with 8 new service URLs)
```

---

## Next Steps

**No action** until you choose:

- [ ] **Option A**: Build Phase 2 full orchestration (5-7 days) → Production-grade agent council
- [ ] **Option B**: Deploy to VPS + beta launch (2-3 days) → Validate product-market fit

Let me know which direction, and I'll:
1. Create detailed Phase 2 implementation plan (Ralphy loop)
2. Set up jcodemunch-mcp for token compression
3. Begin sprint with immediate deliverables (daily progress updates)

---

**Status**: Phase 1 ✅ | Awaiting Phase 2 direction
**Commit**: `5de6632` (Brand system complete)
**Next decision point**: Option A or Option B?
