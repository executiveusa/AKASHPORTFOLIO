/**
 * HERALD Semantic Router
 *
 * Routes agent intents to the right tool using pgvector similarity.
 * Does NOT flood the LLM with tool schemas.
 * Sends only the CLI signature (compressed intent) to the agent.
 *
 * Donella Meadows: The router is a BALANCING feedback loop.
 * Bad routes → low quality scores → lower selection probability → better routes chosen.
 * This is the self-correcting mechanism of the system.
 */

import { supabaseClient } from '@/lib/supabase-client';
import { getAllTools, type ExecutorKind, type ToolRegistration } from './tool-registry';
import type { SphereAgentId } from '@/shared/council-events';

export interface ToolRoute {
  tool_id: string;
  tool_name: string;
  executor_kind: ExecutorKind;
  executor_config: Record<string, unknown>;
  cli_signature: string;
  confidence: number;
  fallback_available: boolean;
}

export interface RouteResult {
  success: boolean;
  output?: unknown;
  error?: string;
  latency_ms: number;
  tool_id: string;
}

// ---- Embed intent for semantic search ----

async function embedIntent(intent: string): Promise<number[] | null> {
  try {
    const litellmUrl = process.env.LITELLM_BASE_URL ?? 'http://localhost:4000';
    const res = await fetch(`${litellmUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LITELLM_MASTER_KEY ?? 'sk-placeholder'}`,
      },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: intent }),
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json() as { data?: Array<{ embedding: number[] }> };
    return data.data?.[0]?.embedding ?? null;
  } catch {
    return null; // Fall back to keyword routing
  }
}

// ---- Keyword-based fallback routing ----

function keywordRoute(intent: string, tools: ToolRegistration[]): ToolRegistration | null {
  const lower = intent.toLowerCase();

  const keywordMap: [RegExp, string[]][] = [
    [/post|publish|instagram|tiktok|tweet|linkedin/, ['social_media', 'content_publishing']],
    [/analyt|metric|report|traffic|conversion/, ['analytics', 'reporting']],
    [/email|newsletter|send.*mail/, ['email', 'email_marketing']],
    [/video|edit.*video|caption/, ['video_editing']],
    [/image|photo|design|banner/, ['image_editing', 'design']],
    [/seo|keyword|rank|backlink/, ['seo']],
    [/deploy|build|ship|release/, ['deployment']],
    [/code|debug|github|commit/, ['code']],
    [/payment|invoice|billing|stripe/, ['payments']],
    [/diagram|flowchart|architecture/, ['diagrams']],
    [/presentation|deck|slide/, ['presentations']],
    [/note|notion|document|wiki/, ['knowledge_base']],
    [/crm|lead|prospect|contact/, ['crm', 'lead_generation']],
    [/calendar|schedule|appointment/, ['scheduling']],
    [/podcast|audio|voice/, ['audio_editing', 'podcast']],
  ];

  for (const [regex, caps] of keywordMap) {
    if (regex.test(lower)) {
      const match = tools.find(t =>
        caps.some(c => t.capabilities.includes(c)) &&
        t.health_status !== 'offline'
      );
      if (match) return match;
    }
  }

  return tools.filter(t => t.health_status !== 'offline')[0] ?? null;
}

// ---- Main route function ----

export async function routeIntent(
  intent: string,
  agentId: SphereAgentId,
  options?: {
    executor_filter?: ExecutorKind;
    session_id?: string;
    min_quality?: number;
  }
): Promise<ToolRoute | null> {
  const startMs = Date.now();
  let selectedTool: ToolRegistration | null = null;
  let confidence = 0;

  // Try semantic routing first
  const embedding = await embedIntent(intent);

  if (embedding) {
    try {
      const { data, error } = await supabaseClient.rpc('search_tools_by_intent', {
        intent_embedding: embedding,
        executor_filter: options?.executor_filter ?? null,
        min_quality: options?.min_quality ?? 0.3,
        result_count: 5,
      });

      if (!error && data && (data as unknown[]).length > 0) {
        const rows = data as Array<{
          tool_id: string;
          tool_name: string;
          executor_kind: string;
          cli_signature: string;
          quality_score: number;
          similarity: number;
        }>;
        const best = rows[0];
        confidence = best.similarity;

        const { data: fullTool } = await supabaseClient
          .from('tool_registrations')
          .select('*')
          .eq('tool_id', best.tool_id)
          .single();

        selectedTool = fullTool as ToolRegistration | null;
      }
    } catch (err) {
      console.warn('[herald/router] Vector search failed, falling back to keyword:', err);
    }
  }

  // Fallback to keyword routing
  if (!selectedTool) {
    const allTools = await getAllTools(
      options?.executor_filter ? { executor_kind: options.executor_filter } : undefined
    );
    selectedTool = keywordRoute(intent, allTools);
    confidence = selectedTool ? 0.4 : 0;
  }

  if (!selectedTool) return null;

  // Log the route decision (observable, feeds quality scores)
  logRouteDecision({
    intent,
    tool_id: selectedTool.tool_id,
    similarity_score: confidence,
    executor_used: selectedTool.executor_kind,
    agent_id: agentId,
    session_id: options?.session_id,
    latency_ms: Date.now() - startMs,
  }).catch(err => console.warn('[herald/router] Route log failed:', err));

  return {
    tool_id: selectedTool.tool_id,
    tool_name: selectedTool.tool_name,
    executor_kind: selectedTool.executor_kind,
    executor_config: selectedTool.executor_config,
    cli_signature: selectedTool.cli_signature,
    confidence,
    fallback_available: false,
  };
}

// ---- Execute a routed tool ----

export async function executeRoute(
  route: ToolRoute,
  args: Record<string, unknown>,
  agentId: SphereAgentId
): Promise<RouteResult> {
  const startMs = Date.now();

  try {
    let output: unknown;

    switch (route.executor_kind) {
      case 'cli_script':
        output = await executeCLIScript(route, args);
        break;
      case 'cli_anything':
        output = await executeCLIAnything(route, args);
        break;
      case 'mcp_server':
        output = await executeMCPServer(route, args);
        break;
      case 'postiz':
        output = await executePostiz(route, args);
        break;
      case 'http_api':
        output = await executeHTTPAPI(route, args);
        break;
      default:
        throw new Error(`Unsupported executor kind: ${route.executor_kind}`);
    }

    const latency_ms = Date.now() - startMs;

    // Update quality score (reinforcing feedback loop)
    supabaseClient
      .rpc('update_tool_quality_score', {
        p_tool_id: route.tool_id,
        p_success: true,
        p_latency_ms: latency_ms,
      })
      .catch(() => { /* non-critical */ });

    return { success: true, output, latency_ms, tool_id: route.tool_id };
  } catch (err) {
    const latency_ms = Date.now() - startMs;
    const error = (err as Error).message;

    supabaseClient
      .rpc('update_tool_quality_score', {
        p_tool_id: route.tool_id,
        p_success: false,
        p_latency_ms: latency_ms,
      })
      .catch(() => { /* non-critical */ });

    return { success: false, error, latency_ms, tool_id: route.tool_id };
  }
}

// ---- Executor implementations ----

async function executeCLIScript(route: ToolRoute, args: Record<string, unknown>): Promise<unknown> {
  const { execFile } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(execFile);

  const filePath = route.executor_config.file_path as string;
  const argArray = Object.entries(args).flatMap(([k, v]) => [`--${k}`, String(v)]);

  const { stdout } = await execAsync('node', [filePath, ...argArray], { timeout: 30000 });
  try { return JSON.parse(stdout); } catch { return stdout; }
}

async function executeCLIAnything(route: ToolRoute, args: Record<string, unknown>): Promise<unknown> {
  const endpoint = (route.executor_config.api_endpoint as string) ?? '/api/cli';
  const controlRoomBase = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const res = await fetch(`${controlRoomBase}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tool: route.executor_config.cli_binary, args }),
  });

  if (!res.ok) throw new Error(`CLI-Anything API error: ${res.status}`);
  return res.json();
}

async function executeMCPServer(route: ToolRoute, args: Record<string, unknown>): Promise<unknown> {
  const { url, headers } = route.executor_config;
  const mcpToolName = route.executor_config.mcp_tool_name as string;

  if (!url) throw new Error('MCP server URL not configured');

  const res = await fetch(String(url), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...((headers as Record<string, string>) ?? {}),
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: crypto.randomUUID(),
      method: 'tools/call',
      params: { name: mcpToolName, arguments: args },
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) throw new Error(`MCP server error: ${res.status}`);
  const data = await res.json() as { result?: unknown };
  return data.result ?? data;
}

async function executePostiz(route: ToolRoute, args: Record<string, unknown>): Promise<unknown> {
  const apiBase = (route.executor_config.api_base as string) ?? 'http://localhost:3000';
  const apiKey = process.env.POSTIZ_API_KEY;

  if (!apiKey) throw new Error('POSTIZ_API_KEY not set');

  const res = await fetch(`${apiBase}/api/v1/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(args),
  });

  if (!res.ok) throw new Error(`Postiz API error: ${res.status}`);
  return res.json();
}

async function executeHTTPAPI(route: ToolRoute, args: Record<string, unknown>): Promise<unknown> {
  const { base_url, method = 'POST', path_template } = route.executor_config;
  const url = `${base_url}${path_template ?? ''}`;

  const res = await fetch(String(url), {
    method: String(method),
    headers: { 'Content-Type': 'application/json' },
    body: method !== 'GET' ? JSON.stringify(args) : undefined,
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) throw new Error(`HTTP API error: ${res.status}`);
  return res.json();
}

// ---- Route logging ----

async function logRouteDecision(log: {
  intent: string;
  tool_id: string;
  similarity_score: number;
  executor_used: string;
  agent_id: string;
  session_id?: string;
  latency_ms: number;
}): Promise<void> {
  await supabaseClient.from('herald_route_log').insert([{
    id: crypto.randomUUID(),
    ...log,
    success: null,
    created_at: new Date().toISOString(),
  }]);
}

// ---- Get compressed tool list for LLM context injection ----
// TOKEN-EFFICIENT representation: only CLI signatures, not full schemas

export async function getToolMenuForAgent(
  agentId: SphereAgentId,
  capabilities?: string[]
): Promise<string> {
  const tools = await getAllTools(
    capabilities?.[0] ? { capability: capabilities[0] } : undefined
  );

  const relevant = tools
    .filter(t => t.health_status !== 'offline')
    .sort((a, b) => b.quality_score - a.quality_score)
    .slice(0, 20);

  if (relevant.length === 0) return '';

  const lines = [
    `=== AVAILABLE TOOLS for ${agentId} ===`,
    ...relevant.map(
      t => `  ${t.cli_signature}  [${t.executor_kind}] q=${t.quality_score.toFixed(2)}`
    ),
    `=== To use a tool: POST /api/herald/execute { tool_id, args, agent_id } ===`,
  ];

  return lines.join('\n');
}
