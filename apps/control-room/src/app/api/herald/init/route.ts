/**
 * HERALD Init API
 * POST /api/herald/init — cold-start bootstrap: seeds all tool registrations
 *
 * Call once on deployment or when the tool registry is empty.
 * Safe to re-run (upsert on tool_id).
 */

import { NextResponse } from 'next/server';
import { bootstrapHeraldRegistry, ingestMCPServers } from '@/lib/herald/tool-registry';
import { convertAndRegisterMCPServer } from '@/lib/herald/mcp-cli-converter';

// Known remote MCP servers (checked during bootstrap)
// These endpoints are attempt-best-effort; failures don't block other registrations
const KNOWN_MCP_SERVERS: Record<string, Record<string, unknown>> = {
  'notion':           { url: 'https://mcp.notion.com/mcp',               type: 'url' },
  'cloudflare':       { url: 'https://bindings.mcp.cloudflare.com/sse',  type: 'url' },
  'vercel':           { url: 'https://mcp.vercel.com',                   type: 'url' },
  'stripe':           { url: 'https://mcp.stripe.com',                   type: 'url' },
  'gmail':            { url: 'https://gmail.mcp.claude.com/mcp',         type: 'url' },
  'google-calendar':  { url: 'https://gcal.mcp.claude.com/mcp',          type: 'url' },
  'figma':            { url: 'https://mcp.figma.com/mcp',                type: 'url' },
  'sentry':           { url: 'https://mcp.sentry.dev/mcp',               type: 'url' },
  'canva':            { url: 'https://mcp.canva.com/mcp',                type: 'url' },
  'invideo':          { url: 'https://mcp.invideo.io/sse',               type: 'url' },
  'paypal':           { url: 'https://mcp.paypal.com/mcp',               type: 'url' },
};

export async function POST() {
  const results: Record<string, unknown> = {};

  // 1. Bootstrap local tools (marketingskills CLIs, CLI-Anything, Postiz)
  const local = await bootstrapHeraldRegistry();
  results.local = local;

  // 2. Try remote MCP servers (timeout-safe, non-blocking on failure)
  for (const [name, config] of Object.entries(KNOWN_MCP_SERVERS)) {
    try {
      const count = await convertAndRegisterMCPServer(name, config);
      results[`mcp_${name}`] = count;
    } catch (err) {
      results[`mcp_${name}_error`] = (err as Error).message;
    }
  }

  // 3. Ingest locally configured MCP servers from .claude/settings.json
  const localMCP = await ingestMCPServers();
  results.local_mcp_config = localMCP;

  const total = Object.values(results).reduce((sum, v) => {
    if (typeof v === 'number') return (sum as number) + v;
    if (v === true) return (sum as number) + 1;
    return sum;
  }, 0) as number;

  return NextResponse.json({
    success: true,
    message: 'HERALD initialized',
    total_registered: total,
    results,
  });
}
