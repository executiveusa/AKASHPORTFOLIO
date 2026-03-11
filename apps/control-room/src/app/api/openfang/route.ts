/**
 * /api/openfang — OpenFang Agent OS Proxy
 *
 * Bridges Next.js / Synthia agents to the OpenFang daemon (localhost:4200).
 * All Synthia agents can call this endpoint from their system prompts via Bash/fetch.
 *
 * GET  /api/openfang               → daemon status + list of deployed Hands
 * GET  /api/openfang?hand=<id>     → specific Hand details / last run results
 * POST /api/openfang { mode: "deploy_hand" }    → deploy a new Hand instance
 * POST /api/openfang { mode: "trigger" }        → trigger a Hand run immediately
 * POST /api/openfang { mode: "send_channel" }   → send via WhatsApp/Telegram/Slack/…
 * POST /api/openfang { mode: "query_memory" }   → search agent vector memory
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getOpenFangStatus,
  listHands,
  deployHand,
  triggerHand,
  sendChannel,
  queryMemory,
  type HandType,
  type HandConfig,
  type ChannelPlatform,
} from '@/lib/openfang';

export const runtime = 'nodejs';

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const handId = searchParams.get('hand');

  const status = await getOpenFangStatus();

  if (!status.running) {
    return NextResponse.json({
      installed: status.installed,
      running: false,
      installCommand: status.installCommand,
      message: 'OpenFang daemon is not running. Install and start it to enable autonomous agent capabilities.',
    });
  }

  if (handId) {
    // Return details for a specific Hand
    const hands = await listHands();
    const hand = hands.find(h => h.id === handId || h.name === handId || h.type === handId);
    if (!hand) {
      return NextResponse.json({ error: `Hand "${handId}" not found` }, { status: 404 });
    }
    return NextResponse.json({ hand });
  }

  // Full status: daemon info + all deployed Hands
  const hands = await listHands();
  return NextResponse.json({
    status,
    hands,
    summary: {
      total: hands.length,
      running: hands.filter(h => h.status === 'running').length,
      scheduled: hands.filter(h => h.status === 'scheduled').length,
    },
    availableHands: [
      { type: 'clip',       description: 'Video: YouTube → vertical short + captions + voiceover',    agent: 'Lapina TikTok' },
      { type: 'lead',       description: 'Daily ICP prospect discovery + scoring',                     agent: 'Clandestino' },
      { type: 'collector',  description: 'OSINT monitoring, change detection, knowledge graphs',       agent: 'Morpho' },
      { type: 'predictor',  description: 'Superforecasting engine with calibrated reasoning',          agent: 'Council + Morpho' },
      { type: 'researcher', description: 'Deep autonomous research with source credibility scoring',   agent: 'All agents' },
      { type: 'twitter',    description: 'Autonomous social posting with mandatory approval gates',    agent: 'Lapina sub-agents' },
      { type: 'browser',    description: 'Web automation: competitor research, lead capture',          agent: 'Indigo' },
    ],
    channels: ['whatsapp', 'telegram', 'discord', 'slack', 'email', 'signal', 'matrix', 'teams', '32+ more'],
  });
}

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const mode = (body.mode as string) ?? 'trigger';

  // ── deploy_hand ─────────────────────────────────────────────────────────────
  if (mode === 'deploy_hand') {
    // POST { mode: "deploy_hand", handType: "lead", name: "Clandestino Lead Scanner", schedule?: "0 9 * * 1-5", params?: {...} }
    const { handType, name, schedule, params, llmProvider } = body as {
      handType: HandType;
      name: string;
      schedule?: string;
      params?: Record<string, unknown>;
      llmProvider?: string;
    };
    if (!handType || !name) {
      return NextResponse.json({ error: 'handType and name are required' }, { status: 400 });
    }
    const config: HandConfig = { name, schedule, params, llmProvider };
    const hand = await deployHand(handType, config);
    if (!hand) {
      return NextResponse.json({ error: 'Failed to deploy Hand — is OpenFang running?' }, { status: 502 });
    }
    return NextResponse.json({ mode, hand }, { status: 201 });
  }

  // ── trigger ─────────────────────────────────────────────────────────────────
  if (mode === 'trigger') {
    // POST { mode: "trigger", handId: "abc123", input?: { url: "...", icp: {...} } }
    const { handId, input } = body as {
      handId: string;
      input?: Record<string, unknown>;
    };
    if (!handId) {
      return NextResponse.json({ error: 'handId is required' }, { status: 400 });
    }
    const result = await triggerHand(handId, input);
    return NextResponse.json({ mode, result }, { status: result.success ? 200 : 502 });
  }

  // ── send_channel ─────────────────────────────────────────────────────────────
  if (mode === 'send_channel') {
    /**
     * POST {
     *   mode: "send_channel",
     *   platform: "whatsapp",
     *   to: "+521XXXXXXXXXX",
     *   message: "Ivette, hay un lead calificado esperando tu revisión…",
     *   subject?: "Lead Alert — Clandestino",   // email only
     *   attachments?: ["/tmp/report.pdf"]        // file paths
     * }
     *
     * IVETTE APPROVAL LOOP:
     *   Use this to deliver approval requests directly to Ivette's phone.
     *   The agent sends the request, Ivette replies, the agent reads the reply via GET /api/openfang?hand=<id>.
     */
    const { platform, to, message, subject, attachments } = body as {
      platform: ChannelPlatform;
      to: string;
      message: string;
      subject?: string;
      attachments?: string[];
    };
    if (!platform || !to || !message) {
      return NextResponse.json({ error: 'platform, to, and message are required' }, { status: 400 });
    }
    const result = await sendChannel(platform, to, message, { subject, attachments });
    return NextResponse.json({ mode, result }, { status: result.success ? 200 : 502 });
  }

  // ── query_memory ─────────────────────────────────────────────────────────────
  if (mode === 'query_memory') {
    // POST { mode: "query_memory", agentId: "lead-hand-abc", query: "leads contacted last week", topK?: 5 }
    const { agentId, query, topK } = body as {
      agentId: string;
      query: string;
      topK?: number;
    };
    if (!agentId || !query) {
      return NextResponse.json({ error: 'agentId and query are required' }, { status: 400 });
    }
    const result = await queryMemory(agentId, query, topK);
    return NextResponse.json({ mode, result });
  }

  return NextResponse.json(
    { error: `Unknown mode "${mode}". Valid modes: deploy_hand | trigger | send_channel | query_memory` },
    { status: 400 }
  );
}
