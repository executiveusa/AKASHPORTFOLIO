/**
 * HERALD Tool Registry
 *
 * Discovers, ingests, and maintains the tool topology map.
 * Tools are dual-stored:
 *   1. Supabase tool_registrations (execution metadata + quality scores)
 *   2. Vibe Graph vibe_nodes kind='resource' (ecosystem visibility for agents)
 *
 * Donella Meadows: This module manages the STOCK of known tools.
 * Ingestion is a flow IN. Deprecation/offline status is a flow OUT.
 * Quality score is a state variable with reinforcing feedback.
 */

import { supabaseClient } from '@/lib/supabase-client';
import { vibeIngest } from '@/lib/vibe-graph';
import * as fs from 'fs';
import * as path from 'path';

// ---- Types ----

export type ExecutorKind =
  | 'mcp_server'
  | 'cli_script'
  | 'cli_anything'
  | 'postiz'
  | 'composio'
  | 'rust_provider'
  | 'http_api';

export interface ToolRegistration {
  id: string;
  tool_id: string;
  tool_name: string;
  executor_kind: ExecutorKind;
  executor_config: Record<string, unknown>;
  capabilities: string[];
  cli_signature: string;
  input_schema?: Record<string, unknown>;
  output_schema?: Record<string, unknown>;
  auth_required: boolean;
  auth_env_key?: string;
  version: string;
  source_file?: string;
  health_status: 'healthy' | 'degraded' | 'offline' | 'unknown';
  quality_score: number;
  usage_count: number;
}

// ---- In-memory fallback ----
const inMemoryTools = new Map<string, ToolRegistration>();

// ---- Registration ----

export async function registerTool(
  tool: Omit<ToolRegistration, 'id' | 'health_status' | 'quality_score' | 'usage_count'>
): Promise<ToolRegistration> {
  const id = crypto.randomUUID();
  const registration: ToolRegistration = {
    ...tool,
    id,
    health_status: 'unknown',
    quality_score: 0.5,
    usage_count: 0,
  };

  try {
    const { error } = await supabaseClient
      .from('tool_registrations')
      .upsert(
        [{
          ...registration,
          registered_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }],
        { onConflict: 'tool_id' }
      );

    if (error) throw error;

    // Also register in Vibe Graph as resource node
    await vibeIngest({
      agentId: 'system',
      kind: 'resource',
      label: tool.tool_name,
      content: `${tool.cli_signature} | capabilities: ${tool.capabilities.join(', ')} | executor: ${tool.executor_kind}`,
      tags: ['tool', tool.executor_kind, ...tool.capabilities],
      metadata: { tool_id: tool.tool_id, executor_kind: tool.executor_kind },
    });
  } catch (err) {
    console.warn('[herald] Supabase unavailable, using in-memory:', (err as Error).message);
    inMemoryTools.set(tool.tool_id, registration);
  }

  return registration;
}

// ---- Discovery: Scan marketingskills CLIs ----

export async function ingestMarketingSkillsCLIs(): Promise<number> {
  const cliDir = path.join(
    process.cwd(),
    'apps/control-room/openclaw-logic/synthia-3.0-backend/skills.md/marketingskills-main/marketingskills-main/tools/clis'
  );

  if (!fs.existsSync(cliDir)) {
    console.warn('[herald] marketingskills CLI dir not found:', cliDir);
    return 0;
  }

  const files = fs.readdirSync(cliDir).filter(f => f.endsWith('.js'));
  let count = 0;

  for (const file of files) {
    const toolId = file.replace('.js', '');
    const filePath = path.join(cliDir, file);

    const source = fs.readFileSync(filePath, 'utf-8').slice(0, 1000);
    const capabilities = inferCapabilities(toolId, source);
    const cliSignature = inferCliSignature(toolId, source);

    await registerTool({
      tool_id: `marketingskills_${toolId.replace(/-/g, '_')}`,
      tool_name: toolIdToName(toolId),
      executor_kind: 'cli_script',
      executor_config: { file_path: filePath, runtime: 'node' },
      capabilities,
      cli_signature: cliSignature,
      auth_required: requiresAuth(source),
      auth_env_key: inferAuthEnvKey(toolId),
      version: '1.0.0',
      source_file: filePath,
    });
    count++;
  }

  console.log(`[herald] Ingested ${count} marketingskills CLIs`);
  return count;
}

// ---- Discovery: Scan MCP server config ----

export async function ingestMCPServers(mcpConfigPaths?: string[]): Promise<number> {
  const homeDir = process.env.HOME ?? process.env.USERPROFILE ?? '';
  const defaultPaths = [
    path.join(process.cwd(), '.claude/settings.json'),
    path.join(process.cwd(), 'apps/control-room/.claude/settings.json'),
    path.join(homeDir, '.claude/settings.json'),
  ];

  const paths = mcpConfigPaths ?? defaultPaths;
  let count = 0;

  for (const configPath of paths) {
    if (!fs.existsSync(configPath)) continue;

    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      const servers: Record<string, unknown> = config.mcpServers ?? config.mcp_servers ?? {};

      for (const [serverName, serverConfig] of Object.entries(servers)) {
        const cfg = serverConfig as Record<string, unknown>;
        const toolId = `mcp_${serverName.replace(/[^a-z0-9]/gi, '_')}`;

        await registerTool({
          tool_id: toolId,
          tool_name: serverName,
          executor_kind: 'mcp_server',
          executor_config: cfg,
          capabilities: inferMCPCapabilities(serverName),
          cli_signature: `${toolId} <tool_name> [args...]`,
          auth_required: !!(cfg.env),
          version: '1.0.0',
          source_file: configPath,
        });
        count++;
      }
    } catch (err) {
      console.warn(`[herald] Failed to parse MCP config at ${configPath}:`, err);
    }
  }

  console.log(`[herald] Ingested ${count} MCP servers`);
  return count;
}

// ---- Discovery: Postiz CLI ----

export async function ingestPostizCLI(): Promise<boolean> {
  const postizCliPath = path.join(
    process.cwd(),
    'apps/control-room/openclaw-logic/synthia-3.0-backend/Synthia-3.0-opensource/postiz-app-main/postiz-app-main/apps/cli/src/index.ts'
  );

  if (!fs.existsSync(postizCliPath)) return false;

  await registerTool({
    tool_id: 'postiz_cli',
    tool_name: 'Postiz Social Media CLI',
    executor_kind: 'postiz',
    executor_config: {
      cli_path: postizCliPath,
      api_base: process.env.POSTIZ_API_URL ?? 'http://localhost:3000',
    },
    capabilities: [
      'social_media', 'content_publishing', 'scheduling',
      'instagram', 'tiktok', 'linkedin', 'twitter', 'youtube',
    ],
    cli_signature: 'postiz posts create --integration <name> --text <text> [--date <ISO>]',
    auth_required: true,
    auth_env_key: 'POSTIZ_API_KEY',
    version: '1.0.0',
    source_file: postizCliPath,
  });

  return true;
}

// ---- Discovery: CLI-Anything desktop tools ----

export async function ingestCLIAnythingTools(): Promise<number> {
  const cliAnythingTools = [
    { id: 'gimp', name: 'GIMP Image Editor', caps: ['image_editing', 'design', 'social_assets'] },
    { id: 'blender', name: 'Blender 3D', caps: ['3d_rendering', 'motion_graphics', 'video'] },
    { id: 'inkscape', name: 'Inkscape Vector', caps: ['vector_design', 'svg', 'infographics'] },
    { id: 'kdenlive', name: 'Kdenlive Video Editor', caps: ['video_editing', 'captions', 'tiktok'] },
    { id: 'audacity', name: 'Audacity Audio', caps: ['audio_editing', 'podcast', 'voice'] },
    { id: 'libreoffice', name: 'LibreOffice', caps: ['documents', 'spreadsheets', 'presentations', 'pdf'] },
    { id: 'obs_studio', name: 'OBS Studio', caps: ['screen_recording', 'streaming', 'demo_recording'] },
    { id: 'drawio', name: 'Draw.io Diagrams', caps: ['diagrams', 'flowcharts', 'architecture'] },
    { id: 'anygen', name: 'AnyGen Presentations', caps: ['presentations', 'slides', 'pitch_deck'] },
  ];

  let count = 0;
  for (const tool of cliAnythingTools) {
    await registerTool({
      tool_id: `cli_anything_${tool.id}`,
      tool_name: tool.name,
      executor_kind: 'cli_anything',
      executor_config: {
        cli_binary: `cli-anything-${tool.id}`,
        api_endpoint: '/api/cli',
      },
      capabilities: tool.caps,
      cli_signature: `cli-anything-${tool.id} --json <command> [args]`,
      auth_required: false,
      version: '1.0.0',
    });
    count++;
  }

  return count;
}

// ---- Full bootstrap ----

export async function bootstrapHeraldRegistry(): Promise<{
  marketing_clis: number;
  mcp_servers: number;
  postiz: boolean;
  cli_anything: number;
  total: number;
}> {
  console.log('[herald] Starting tool registry bootstrap...');

  const results = await Promise.allSettled([
    ingestMarketingSkillsCLIs(),
    ingestMCPServers(),
    ingestPostizCLI(),
    ingestCLIAnythingTools(),
  ]);

  const [mktCount, mcpCount, postizOk, cliCount] = results.map(r =>
    r.status === 'fulfilled' ? r.value : 0
  );

  const result = {
    marketing_clis: mktCount as number,
    mcp_servers: mcpCount as number,
    postiz: postizOk as boolean,
    cli_anything: cliCount as number,
    total: (mktCount as number) + (mcpCount as number) + (cliCount as number) + (postizOk ? 1 : 0),
  };

  console.log('[herald] Bootstrap complete:', result);
  return result;
}

// ---- Query ----

export async function getAllTools(
  filter?: { executor_kind?: ExecutorKind; capability?: string }
): Promise<ToolRegistration[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = supabaseClient.from('tool_registrations').select('*') as any;
    if (filter?.executor_kind) query = query.eq('executor_kind', filter.executor_kind);
    if (filter?.capability) query = query.contains('capabilities', [filter.capability]);

    const { data, error } = await query.order('quality_score', { ascending: false });
    if (error) throw error;
    return (data ?? []) as ToolRegistration[];
  } catch {
    return Array.from(inMemoryTools.values());
  }
}

// ---- Helpers ----

function inferCapabilities(toolId: string, source: string): string[] {
  const capabilityMap: Record<string, string[]> = {
    ga4: ['analytics', 'google_analytics', 'reporting'],
    'meta-ads': ['paid_ads', 'facebook_ads', 'instagram_ads', 'advertising'],
    klaviyo: ['email_marketing', 'crm', 'ecommerce'],
    hubspot: ['crm', 'sales', 'marketing_automation'],
    mailchimp: ['email_marketing', 'newsletters'],
    semrush: ['seo', 'keyword_research', 'competitor_analysis'],
    ahrefs: ['seo', 'backlinks', 'keyword_research'],
    stripe: ['payments', 'billing', 'subscriptions'],
    amplitude: ['analytics', 'product_analytics', 'user_behavior'],
    mixpanel: ['analytics', 'product_analytics', 'funnels'],
    intercom: ['customer_support', 'chat', 'user_engagement'],
    segment: ['analytics', 'data_pipeline', 'tracking'],
    resend: ['email', 'transactional_email'],
    beehiiv: ['newsletter', 'email_marketing', 'subscriptions'],
    'linkedin-ads': ['paid_ads', 'linkedin', 'b2b_advertising'],
    'tiktok-ads': ['paid_ads', 'tiktok', 'video_advertising'],
    'google-ads': ['paid_ads', 'google', 'search_advertising'],
    sendgrid: ['email', 'transactional_email', 'marketing_email'],
    apollo: ['sales', 'prospecting', 'lead_generation'],
    clearbit: ['data_enrichment', 'lead_generation', 'crm'],
    hotjar: ['analytics', 'heatmaps', 'user_behavior'],
    plausible: ['analytics', 'privacy_friendly', 'reporting'],
    paddle: ['payments', 'billing', 'subscriptions'],
    typeform: ['forms', 'surveys', 'lead_generation'],
    calendly: ['scheduling', 'calendar', 'sales'],
    buffer: ['social_media', 'scheduling', 'content_publishing'],
    zapier: ['automation', 'integrations', 'workflows'],
  };

  const lower = toolId.toLowerCase().replace(/-/g, '_');
  for (const [key, caps] of Object.entries(capabilityMap)) {
    if (lower.includes(key.replace(/-/g, '_'))) return caps;
  }

  const caps: string[] = [];
  if (source.includes('email')) caps.push('email');
  if (source.includes('analytic') || source.includes('metric')) caps.push('analytics');
  if (source.includes('social') || source.includes('post')) caps.push('social_media');
  if (source.includes('pay') || source.includes('billing')) caps.push('payments');
  if (source.includes('seo') || source.includes('keyword')) caps.push('seo');
  if (caps.length === 0) caps.push('general');
  return caps;
}

function inferCliSignature(toolId: string, source: string): string {
  const fnMatches = source.match(/(?:async function|function|const)\s+(\w+)/g)?.slice(0, 3) ?? [];
  const fns = fnMatches.map(m => m.split(/\s+/).pop()).filter(Boolean);
  return `${toolId} ${fns.join('|')} [--options]`;
}

function requiresAuth(source: string): boolean {
  return source.includes('API_KEY') || source.includes('apiKey') || source.includes('access_token');
}

function inferAuthEnvKey(toolId: string): string {
  return toolId.toUpperCase().replace(/-/g, '_') + '_API_KEY';
}

function toolIdToName(toolId: string): string {
  return toolId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function inferMCPCapabilities(serverName: string): string[] {
  const mcpCapMap: Record<string, string[]> = {
    notion: ['notes', 'knowledge_base', 'project_management', 'databases'],
    github: ['code', 'repositories', 'pull_requests', 'issues'],
    stripe: ['payments', 'billing', 'subscriptions'],
    gmail: ['email', 'communication'],
    slack: ['messaging', 'team_communication'],
    figma: ['design', 'ui_ux', 'prototyping'],
    cloudflare: ['hosting', 'cdn', 'workers', 'deployment'],
    vercel: ['deployment', 'hosting', 'frontend'],
    sentry: ['error_tracking', 'monitoring', 'debugging'],
    linear: ['project_management', 'issues', 'engineering'],
    hubspot: ['crm', 'sales', 'marketing'],
    canva: ['design', 'visual_content', 'social_media'],
    invideo: ['video_creation', 'social_media', 'content'],
    google: ['search', 'analytics', 'workspace'],
    paypal: ['payments', 'billing'],
  };

  const lower = serverName.toLowerCase();
  for (const [key, caps] of Object.entries(mcpCapMap)) {
    if (lower.includes(key)) return caps;
  }
  return ['general'];
}
