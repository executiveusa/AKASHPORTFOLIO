# Synthia 3.0 Phase 2-7 Execution Roadmap
**Status**: Autonomous overnight build (Ralphy loop + e2e tests)
**Start**: 2026-03-08 22:00
**Target**: All phases complete by morning

---

## PHASE 2: Theater & Agent Orchestration (8 API Routes + 3D)
**Duration**: 1 night | **Commits**: 4-6

### 2.1: 3D Theater Route `/theater`
- Three.js canvas scene initialization
- VRM avatar loading (fallback: colored sphere)
- SSE real-time council meeting stream
- Bilingual UI (ES/EN)
- **Commit**: feat: Theater route with Three.js + VRM avatars

### 2.2: LLM Council API `/api/council`
- POST: Initiate multi-agent meeting
- GET: Fetch active council state
- PUT: Update agent opinions
- **Commit**: feat: LLM Council orchestration API

### 2.3: Agent Mail System `/api/agent-mail`
- POST: Send messages between agents
- GET: Fetch agent inbox
- DELETE: Archive messages
- **Commit**: feat: Agent communication system

### 2.4: PersonaPlex Voice `/api/voice`
- Text-to-speech synthesis (ElevenLabs API)
- Avatar lip-sync data generation
- Real-time streaming
- **Commit**: feat: PersonaPlex voice + avatar sync

### 2.5: Observable Meetings `/api/meetings`
- Store meeting transcripts (Supabase)
- Real-time SSE updates
- Decision logging with rationale
- **Commit**: feat: Meeting observation & logging

### 2.6: Agent State `/api/state`
- GET: Current agent personas + memory
- POST: Update agent context
- **Commit**: feat: Persistent agent state endpoints

### 2.7: Token Streaming `/api/stream`
- Claude API token-by-token streaming
- Rate limiting (100 req/min)
- **Commit**: feat: Token streaming with rate limits

### 2.8: Webhook Integration `/api/webhooks`
- WhatsApp message ingestion
- TikTok comment ingestion
- Trigger Council meetings
- **Commit**: feat: Social media webhook handlers

**E2E Tests Phase 2**:
```
- Theater route loads ✓
- Three.js renders ✓
- VRM avatar fallback works ✓
- SSE connection established ✓
- Bilingual toggle works ✓
- API routes respond (200 status) ✓
```

---

## PHASE 3: Community Integration
**Duration**: 6 hours | **Commits**: 2

### 3.1: WhatsApp Adapter
- Twilio SDK integration
- Message routing to Synthia
- Response broadcasting
- **Commit**: feat: WhatsApp community bridge

### 3.2: TikTok Adapter
- Comment crawler (live stream)
- Sentiment analysis pre-filter
- Council decision broadcasting to comments
- **Commit**: feat: TikTok live engagement

---

## PHASE 4: Voice & Avatar Synchronization
**Duration**: 6 hours | **Commits**: 2

### 4.1: ElevenLabs Integration
- API key validation
- Streaming synthesis
- Caching (Redis or Supabase bucket)

### 4.2: VRM Lip-Sync
- Phoneme-to-mouth-shape mapping
- Avatar animation timeline
- Real-time sync with audio
- **Commit**: feat: Real-time avatar voice sync

---

## PHASE 5: Agent Autonomy & Decision Making
**Duration**: 6 hours | **Commits**: 2

### 5.1: Autonomous Agent Loop
- Background job (Supabase scheduler)
- Agent vs Council decision trees
- Interrupt mechanism (user approval)

### 5.2: Observable Decision Ledger
- Store decisions + reasoning
- Public API: `/api/decisions/public`
- Dashboard visualization
- **Commit**: feat: Agent autonomy with observable decisions

---

## PHASE 6: CDMX Beta Launch & Metrics
**Duration**: 4 hours | **Commits**: 2

### 6.1: Beta User Onboarding
- WhatsApp bot signup flow
- TikTok live auto-discovery
- Invite code system (existing)

### 6.2: Telemetry & Analytics
- Event tracking (meetings, decisions, sentiment)
- Dashboard metrics
- **Commit**: feat: CDMX beta launch + analytics

---

## PHASE 7+: Scale & Product Features
**TBD** (Gather feedback from beta launch)

---

## Daily Commit Schedule

| Time | Phase | Status |
|------|-------|--------|
| 22:00-02:00 | Phase 2 | 🚀 Building |
| 02:00-03:00 | Phase 3 | 🔧 Integrating |
| 03:00-04:00 | Phase 4 | 🎤 Voice |
| 04:00-05:00 | Phase 5 | 🤖 Autonomy |
| 05:00-06:00 | Phase 6 | 🚀 Launch |
| 06:00+ | Test & Polish | ✅ QA |

---

## Ralphy Loop Execution

1. **Ask** (implicit): Build phases 2-7 with token savings
2. **Plan** (this doc)
3. **Execute** (start Phase 2)
4. **Observe** (e2e tests + build logs)
5. **Iterate** (fix failures, commit, move to next phase)

**Key Rule**: Ship before perfecting. Move fast.

---

## Token Savings Strategy

- Use jcodemunch-mcp for large file reviews
- Compress context between phases
- Reuse API patterns (scaffold from Phase 2.1)
- Skip detailed comments; rely on commit messages

**Expected savings**: 40-50% token reduction on 24-hour build
