# OpenClaw AI OS: 30 Essential Skills Integration

> **Kevin Badi's OpenClaw Stack**: 30 agentic skills used across ALL client AI operating systems.
> Integration into AKASHPORTFOLIO Sphere OS per EMERALD TABLETS (Tablet III).

---

## OpenClaw Skill Breakdown (30 Total)

### Chapter 1: Knowledge Graph + RAG (1 skill)

**Git Nexus RAG Agent** → Maps entire OS as knowledge graph
- Indexes all skills, database tables, cron jobs, API services, agents
- Allows natural language queries: "Tell me all skills that do X"
- Weekly reindexing for freshness

**Maps to Sphere**: **Lens** (Investigation)
- Integrates with existing: `/Lens` → code-quality-metrics
- Adds: Knowledge graph querying + project topology discovery
- Triggers: "how does the system work", "what skills exist", "show me project structure"

**Registration in HERALD**:
```yaml
skill: git-nexus-rag
sphere: investigation
agent: lens
confidence: 0.96
triggers:
  - "tell me about the system"
  - "what skills exist"
  - "how does X work"
  - "project topology"
tools:
  - knowledge_graph_indexing
  - semantic_search
  - weekly_reindex_cron
```

---

### Chapter 2-3: Social Media + Lead Scraping (9 skills)

#### Content Automation (4 skills)
1. **Publish Long-Form** → Drop finished video → auto-upload to all platforms
2. **Publish Short-Form** → Bulk TikTok/Reels/Shorts distribution
3. **Publish Carousels** → Multi-slide content automation
4. **Publish Written Posts** → Text + story automation

**Maps to Sphere**: **Rally** (Orchestration) + **Builder** (Implementation)
- Parallel execution: all 4 publish workflows run concurrently
- Integrates with existing: `/Rally` → parallel-agents
- Triggers: "automate content distribution", "bulk upload"

#### Social Analytics (2 skills)
5. **Social Analytics (Post-level)** → Per-post performance tracking
6. **Social Analytics (Account-level)** → Platform growth + audience insights

**Maps to Sphere**: **Trace** (Investigation)
- Integrates with existing: `/Trace` → analyze-project (extends to social metrics)
- Triggers: "show content performance", "which posts are winning", "account growth"

#### Social Communications (3 skills)
7. **Comment Responder** → Auto-reply to comments (Instagram, Facebook, YouTube, LinkedIn, TikTok)
8. **Social Inbox Agent** → Full 2-way conversations on DM platforms
9. **Engagement Automation** → Like, follow, engagement tracking

**Maps to Sphere**: **Rally** (Orchestration) for concurrent response handling
- 24/7 webhook-triggered responses
- Uses Gemini API for personalization
- Stores conversation context for continuity

**Registration in HERALD**:
```yaml
skills:
  - publish-automation:
      sphere: orchestration
      agent: rally
      confidence: 0.92
      parallel_execution: true
      triggers: ["automate publishing", "bulk upload"]
      api: platform_apis

  - social-analytics:
      sphere: investigation
      agent: trace
      confidence: 0.89
      triggers: ["content performance", "account growth"]
      api: get_late_api, zerno_api

  - comment-responder:
      sphere: orchestration
      agent: rally
      confidence: 0.87
      webhook_triggered: true
      triggers: ["auto-reply", "comment automation"]
      api: gemini_api

  - social-inbox:
      sphere: orchestration
      agent: rally
      confidence: 0.88
      webhook_triggered: true
      triggers: ["dm automation", "conversation"]
      api: gemini_api
```

---

### Chapter 4: Lead Scraping (4 skills)

10. **Instagram Lead Scraper** → Extract usernames from likes/comments
11. **LinkedIn Lead Scraper** → Find professionals by keywords + location
12. **Google Maps Lead Scraper** → Business info (address, phone, website, ratings)
13. **Lead Enrichment** → Scrape business websites for contact details

**Maps to Sphere**: **Scout** (Investigation)
- Integrates with existing: `/Scout` → error-detective (extends to lead quality detection)
- Triggers: "find warm leads", "scrape engagement", "enrich prospects"
- API: Apify

**Registration in HERALD**:
```yaml
skills:
  - lead-scraping:
      sphere: investigation
      agent: scout
      confidence: 0.91
      parallel: true
      triggers:
        - "find leads"
        - "scrape engagement"
        - "enrich prospects"
      api: apify_api
      use_cases:
        - instagram_engagement_scraping
        - linkedin_professional_search
        - google_maps_business_discovery
        - website_contact_extraction
```

---

### Chapter 5: Cold Email (5 skills)

14-18. **Instantly.ai Email Suite** (5 workflows embedded)
- Lead import → campaign setup → sequencing → analytics → KPI optimization

**Sub-skills**:
- Push leads to Instantly
- Create campaigns
- Handle sequencing
- Track opens/replies/bounces
- Optimize via Andre Karpathy's AutoRL method

**Maps to Sphere**: **Nexus** (Orchestration)
- Pipeline orchestration: scrape → enrich → import → sequence → track → optimize
- Integrates with existing: `/Nexus` → workflow-orchestration-patterns
- Triggers: "setup cold email campaign", "optimize reply rate"
- API: Instantly.ai

**Registration in HERALD**:
```yaml
skill: cold-email-suite
sphere: orchestration
agent: nexus
confidence: 0.93
substeps: 5
steps:
  1: lead_import
  2: campaign_creation
  3: email_sequencing
  4: send_and_track
  5: kpi_optimization
triggers:
  - "setup email campaign"
  - "optimize conversion"
api: instantly_ai
adjacent_skills:
  - lead-scraping (input)
  - analytics-tracking (output)
```

---

### Chapter 6: Computer Use (3 skills)

19. **Instagram DM Automation** → Playwright-based DM sending (200/day limit, 10x daily runs)
20. **LinkedIn Connection Requests** → Scraped leads → automated requests + custom messages
21. **Facebook DM Automation** → Personal account → DM to business pages

**Maps to Sphere**: **Builder** (Implementation)
- Uses Playwright for browser automation
- Integrates with existing: `/Builder` → code-refactoring (extends to browser orchestration)
- Triggers: "automate outreach", "send dms at scale"
- Tools: Playwright, browser cookies

**Registration in HERALD**:
```yaml
skills:
  - dm-automation:
      sphere: implementation
      agent: builder
      confidence: 0.85
      tools:
        - playwright
        - session_cookies
      platform_specific:
        instagram: 200_limit_daily
        linkedin: custom_messages
        facebook: page_targeting
      triggers:
        - "automate dm outreach"
        - "send personalized messages"
```

---

### Chapter 7: Video Creation (9 skills)

#### Video Cloning (2 skills)
22. **Short-Form Clone** → Recreate any short video with agent persona
23. **Long-Form Clone** → Recreate any long video with agent persona

**Tech Stack**:
- OpenAI Whisper → word-level timestamps
- FFmpeg → video editing
- Face detection → preserve layout (talking head vs B-roll vs split screen)

**Maps to Sphere**: **Builder** (Implementation)
- Integrates with existing: `/Builder` → prompt-engineering (extends to video generation)
- Triggers: "clone video", "recreate with agent persona"
- Tools: Whisper, FFmpeg, face detection

#### Video Templates (4 skills)
24. **Story Generation** → Narrative video creation
25. **Carousel Generation** → Multi-slide story videos
26. **Short-Form Template** → TikTok/Reels standard format
27. **Infographic Template** → Data visualization

**Maps to Sphere**: **Canvas** (Design)
- Integrates with existing: `/Canvas` → radix-ui-design-system (extends to video design)
- Triggers: "generate carousel", "create story video"

#### Video Workflows (3 skills)
28. **Clap API Integration** → Chop long videos into viral shorts (auto-detects via transcription)
29. **Transcription-to-Text** → YouTube video → LinkedIn post (using Alex Hermozi's format)
30. **Video Analytics** → Track performance of recreated/generated content

**Maps to Sphere**: **Trace** (Investigation) + **Builder** (Implementation)
- Analytics → Trace
- Generation → Builder
- Triggers: "turn video into post", "extract viral clips"
- API: Clap API, Whisper, transcription services

**Registration in HERALD**:
```yaml
skills:
  - video-cloning:
      sphere: implementation
      agent: builder
      confidence: 0.94
      tools:
        - whisper
        - ffmpeg
        - face_detection
      triggers:
        - "clone video"
        - "recreate with persona"

  - video-generation:
      sphere: design
      agent: canvas
      confidence: 0.88
      templates: 4
      triggers:
        - "generate video"
        - "create carousel"

  - video-analytics:
      sphere: investigation
      agent: trace
      confidence: 0.86
      triggers:
        - "video performance"
        - "clip extraction"
      api: clap_api
```

---

## Full OpenClaw Integration Map

```
┌────────────────────────────────────────────────────────┐
│         OPENCLAW 30 SKILLS → SPHERE MAPPING            │
├────────────────────────────────────────────────────────┤
│                                                        │
│ 🔍 Investigation (Scout/Lens/Trace): 7 skills        │
│    ├─ Git Nexus RAG (Lens)                            │
│    ├─ Social Analytics (Trace)                        │
│    ├─ Lead Scraping (Scout) — 4 variants             │
│    ├─ Lead Enrichment (Scout)                         │
│    ├─ Video Analytics (Trace)                         │
│    └─ Performance Tracking (Trace)                    │
│                                                        │
│ 🎯 Orchestration (Nexus/Rally): 13 skills            │
│    ├─ Publish Automation (Rally) — 4 variants        │
│    ├─ Comment Responder (Rally)                      │
│    ├─ Social Inbox (Rally)                           │
│    ├─ Engagement Automation (Rally)                  │
│    ├─ Cold Email Suite (Nexus) — 5 workflows        │
│    └─ Content Scheduling (Nexus)                     │
│                                                        │
│ 🏗️  Implementation (Builder): 8 skills                │
│    ├─ DM Automation (Builder) — 3 variants           │
│    ├─ Video Cloning (Builder) — 2 variants          │
│    ├─ Transcription-to-Text (Builder)               │
│    └─ Browser Automation (Builder)                   │
│                                                        │
│ 🎨 Design (Canvas): 2 skills                         │
│    ├─ Video Templates (Canvas) — 4 variants         │
│    └─ Carousel/Story Generation (Canvas)            │
│                                                        │
└────────────────────────────────────────────────────────┘

Total OpenClaw Skills: 30 (mapped across 4 spheres)
Sphere Distribution:
  Investigation:  7 (Scout/Lens/Trace)
  Orchestration: 13 (Nexus/Rally)
  Implementation: 8 (Builder)
  Design:        2 (Canvas)

Average Confidence: 0.89
API Dependencies: 6
  - Platform APIs (Instagram, TikTok, LinkedIn, Facebook, YouTube)
  - Apify (lead scraping)
  - Instantly.ai (cold email)
  - Gemini API (comment responses)
  - OpenAI Whisper (transcription)
  - Clap API (video chopping)

Execution Model:
  - Webhook-triggered (real-time comments/DMs)
  - Cron-scheduled (daily publishing, email campaigns)
  - Async parallel (bulk operations)
```

---

## Integration Checklist

- [ ] Register 30 OpenClaw skills in HERALD (`skills-registry.ts`)
- [ ] Emit `vibe_node.spawn` for each skill on boot
- [ ] Create skill edges (publish → analytics, scraping → email, etc.)
- [ ] Test webhook triggers (comment responder, DM agent)
- [ ] Test cron triggers (daily publishing, email sequencing)
- [ ] Validate API key management (6 external APIs)
- [ ] Add OpenClaw skills to CLAUDE.md reference
- [ ] Update Sphere.md with OpenClaw capabilities
- [ ] Document webhook setup for social platforms
- [ ] Create runbooks for client deployment

---

## Next: Tech Stack Requirements

Per Kevin Badi's video:

**Required APIs** (3 main):
1. **Social Media Platforms** (Instagram, TikTok, LinkedIn, Facebook, YouTube)
   - Built-in APIs + Apify wrapper

2. **Scraping Platform** (Apify)
   - Lead generation ($15/month typical)
   - Website enrichment

3. **Cold Email** (Instantly.ai)
   - Campaign management ($30/month + credits)

**Open-Source Tools** (Free):
- OpenAI Whisper (transcription)
- FFmpeg (video editing)
- Playwright (browser automation)
- Remotion (video generation)

**Total Cost**: ~$45-50/month per client + Anthropic API calls

**Tech Stack for AKASHPORTFOLIO**:
- Webhook receiver (for real-time triggers)
- Cron scheduler (for batch operations)
- Session cookie management (for browser auth)
- Streaming response handler (for long operations)

---

## Operational Model

### Daily Operations
```
Cron: Daily @ 08:00 UTC
  1. Publish automation (4 parallel skills)
  2. Social analytics collection (2 concurrent)
  3. Email campaign tracking (Instantly.ai)
  4. Lead enrichment batch (Apify)

Webhook: Real-time (24/7)
  1. Comment responder (any platform)
  2. Social inbox (DM platforms)
  3. Lead enrichment completion
  4. Campaign metrics updates
```

### Client Dashboard
Each skill outputs to database → dashboard shows:
- Content published (4 platforms tracked)
- Engagement metrics (comments, DMs, replies)
- Lead quality + status
- Email campaign KPIs
- Video recreation success rate

---

## Zero-Touch Integration (Tablet IV)

Once registered in HERALD:
- Agents invoke skills autonomously
- No human handholding needed
- Spheres coordinate across 30 operations
- Weekly confidence decay updates priorities
- Circuit breakers stop runaway operations

**Example**: Scout finds leads (scraping) → Nexus orchestrates email campaign → Trace monitors performance → Rally auto-responds to replies.

---

*OpenClaw Integration for AKASHPORTFOLIO*
*30 Essential Skills → Sphere OS Council*
*Based on Kevin Badi's AI OS framework*
*Tablet III + Tablet IV*
