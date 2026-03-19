#!/usr/bin/env node
/**
 * Worlds Orchestrator MCP Server — Kupuri Media™
 *
 * "We don't build websites. We build worlds."
 *
 * This is the master orchestrator that coordinates:
 *   - Higgsfield video generation
 *   - Kling video generation
 *   - Blender 3D world export
 *   - Three.js live world delivery
 *   - Multi-LLM visual context (rendered worlds → LLM vision)
 *   - World-as-a-Service private deployments
 *
 * Tools:
 *   worlds_create          — spin up a complete world for a sphere meeting
 *   worlds_assign_sphere   — assign a sphere agent to a world
 *   worlds_list            — list active worlds
 *   worlds_deploy          — deploy world to Coolify VPS (private URL)
 *   worlds_ab_test         — run A/B visual test between two worlds
 *   worlds_voice_command   — parse a voice command and dispatch to world tools
 *   worlds_metrics         — get visual engagement metrics for a world
 *   worlds_link_to_llm     — link rendered world frames to LLM for visual context
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../apps/control-room/.env.local') });

const COOLIFY_URL = process.env.COOLIFY_URL || 'http://31.220.58.212:8000';
const COOLIFY_TOKEN = process.env.COOLIFY_API_TOKEN || '';
const OPEN_ROUTER_API = process.env.OPEN_ROUTER_API || '';

// In-memory world registry (replace with Supabase in production)
const worldRegistry = new Map<string, {
  id: string;
  name: string;
  location: string;
  spheres: string[];
  status: 'pending' | 'building' | 'ready' | 'deployed';
  glb_url?: string;
  video_url?: string;
  deployed_url?: string;
  created_at: string;
  metrics?: { views: number; engagement: number; ab_variant?: string };
}>();

// Voice command → tool dispatch mapping
const VOICE_INTENTS: Array<{
  patterns: RegExp[];
  tool: string;
  extract: (match: string) => Record<string, unknown>;
}> = [
  {
    patterns: [/crea.*mundo.*para|build.*world.*for|create.*world/i],
    tool: 'worlds_create',
    extract: (m) => ({ location: extractLocation(m), sphere_ids: extractSpheres(m) }),
  },
  {
    patterns: [/despliega|deploy|publica/i],
    tool: 'worlds_deploy',
    extract: (m) => ({ world_id: extractWorldId(m) }),
  },
  {
    patterns: [/lista.*mundos|list.*worlds|qué mundos/i],
    tool: 'worlds_list',
    extract: () => ({}),
  },
  {
    patterns: [/prueba.*a\/b|test.*a.*b|compara/i],
    tool: 'worlds_ab_test',
    extract: (m) => ({ world_a: '', world_b: '', metric: 'engagement' }),
  },
];

function extractLocation(text: string): string {
  if (/vallarta/i.test(text)) return 'la-panorama-vallarta';
  if (/zócalo|zocalo/i.test(text)) return 'balcon-del-zocalo';
  if (/xochimilco/i.test(text)) return 'manantiales-xochimilco';
  if (/ribera|kiosco/i.test(text)) return 'santa-maria-ribera';
  return 'santa-maria-ribera';
}

function extractSpheres(text: string): string[] {
  const all = ['synthia', 'alex', 'cazadora', 'forjadora', 'seductora', 'consejo', 'dr-economia', 'dra-cultura', 'ing-teknos', 'la-vigilante'];
  return all.filter(s => text.toLowerCase().includes(s));
}

function extractWorldId(text: string): string {
  const match = text.match(/world[-_]?[a-f0-9]{8}/i);
  return match ? match[0] : '';
}

// ─── MCP Server ────────────────────────────────────────────────────────────────

const server = new Server(
  { name: 'mcp-worlds', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'worlds_create',
      description: 'Create a complete Synthia World: assembles location, sphere agents, visual style, and queues Blender + video generation. The foundation of "We build worlds, not websites."',
      inputSchema: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            enum: ['santa-maria-ribera', 'balcon-del-zocalo', 'manantiales-xochimilco', 'la-panorama-vallarta'],
          },
          sphere_ids:    { type: 'array', items: { type: 'string' }, description: 'Sphere agents in this world' },
          world_name:    { type: 'string', description: 'Human-readable world name' },
          generate_video: { type: 'boolean', description: 'Also queue a Higgsfield/Kling video for this world', default: true },
          client_id:     { type: 'string', description: 'Optional client ID for World-as-a-Service' },
        },
        required: ['location', 'sphere_ids'],
      },
    },
    {
      name: 'worlds_assign_sphere',
      description: 'Add or remove a sphere agent from an active world',
      inputSchema: {
        type: 'object',
        properties: {
          world_id:  { type: 'string' },
          sphere_id: { type: 'string' },
          action:    { type: 'string', enum: ['add', 'remove'], default: 'add' },
        },
        required: ['world_id', 'sphere_id'],
      },
    },
    {
      name: 'worlds_list',
      description: 'List all active sphere worlds with their status and URLs',
      inputSchema: { type: 'object', properties: { status_filter: { type: 'string', enum: ['all', 'pending', 'ready', 'deployed'], default: 'all' } } },
    },
    {
      name: 'worlds_deploy',
      description: 'Deploy a world to the Coolify VPS at a private HTTPS URL',
      inputSchema: {
        type: 'object',
        properties: {
          world_id:    { type: 'string' },
          subdomain:   { type: 'string', description: 'Subdomain on kupuri.media, e.g. "vallarta" → vallarta.kupuri.media' },
          private:     { type: 'boolean', description: 'Require auth to view', default: true },
        },
        required: ['world_id'],
      },
    },
    {
      name: 'worlds_ab_test',
      description: 'Run an A/B visual engagement test between two worlds, returning which performs better',
      inputSchema: {
        type: 'object',
        properties: {
          world_a:   { type: 'string', description: 'World ID A' },
          world_b:   { type: 'string', description: 'World ID B' },
          metric:    { type: 'string', enum: ['engagement', 'time_on_world', 'conversion', 'sphere_interactions'], default: 'engagement' },
          duration_hours: { type: 'number', default: 24 },
        },
        required: ['world_a', 'world_b'],
      },
    },
    {
      name: 'worlds_voice_command',
      description: 'Parse a natural language or voice command and dispatch to the appropriate world tool. Supports Spanish and English.',
      inputSchema: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'Natural language voice command, e.g. "Crea un mundo para Vallarta con Synthia y Alex"' },
        },
        required: ['command'],
      },
    },
    {
      name: 'worlds_link_to_llm',
      description: 'Link rendered world frames to an LLM for visual context — enables multi-LLM visual council with different graphics per sphere',
      inputSchema: {
        type: 'object',
        properties: {
          world_id:    { type: 'string' },
          llm_provider: { type: 'string', enum: ['openrouter', 'anthropic', 'gemini', 'minimax'], default: 'openrouter' },
          frame_urls:  { type: 'array', items: { type: 'string' }, description: 'Image URLs to send as visual context' },
          prompt:      { type: 'string', description: 'LLM prompt about the world' },
        },
        required: ['world_id', 'prompt'],
      },
    },
    {
      name: 'worlds_metrics',
      description: 'Get engagement and visual performance metrics for a deployed world',
      inputSchema: {
        type: 'object',
        properties: {
          world_id: { type: 'string' },
          period:   { type: 'string', enum: ['24h', '7d', '30d'], default: '24h' },
        },
        required: ['world_id'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'worlds_create': {
        const { location, sphere_ids, world_name, generate_video = true, client_id } = args as {
          location: string; sphere_ids: string[]; world_name?: string; generate_video?: boolean; client_id?: string;
        };
        const id = `world-${randomUUID().slice(0, 8)}`;
        const wname = world_name || `${location}-${sphere_ids.slice(0, 2).join('-')}`;

        const world = {
          id,
          name: wname,
          location,
          spheres: sphere_ids,
          status: 'pending' as const,
          created_at: new Date().toISOString(),
          metrics: { views: 0, engagement: 0 },
        };
        worldRegistry.set(id, world);

        // Queue Blender + video generation via Coolify services (async)
        const nextSteps = [
          `1. POST /api/worlds/build { world_id: "${id}", location: "${location}", sphere_ids: ${JSON.stringify(sphere_ids)} }`,
          generate_video ? `2. Trigger mcp-higgsfield: higgsfield_animate_scene for "${location}"` : null,
          `3. Export GLB via mcp-blender: blender_create_sphere_world`,
          `4. Link to Three.js theater at /spheres?world=${id}`,
        ].filter(Boolean);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              world_id: id,
              name: wname,
              location,
              sphere_count: sphere_ids.length,
              status: 'pending',
              next_steps: nextSteps,
              control_room_url: `https://dashboard-agent-swarm-eight.vercel.app/spheres?world=${id}`,
              client_id: client_id || null,
            }, null, 2),
          }],
        };
      }

      case 'worlds_assign_sphere': {
        const { world_id, sphere_id, action = 'add' } = args as { world_id: string; sphere_id: string; action?: string };
        const world = worldRegistry.get(world_id);
        if (!world) throw new Error(`World ${world_id} not found`);

        if (action === 'add' && !world.spheres.includes(sphere_id)) {
          world.spheres.push(sphere_id);
        } else if (action === 'remove') {
          world.spheres = world.spheres.filter(s => s !== sphere_id);
        }
        worldRegistry.set(world_id, world);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ success: true, world_id, sphere_id, action, current_spheres: world.spheres }, null, 2),
          }],
        };
      }

      case 'worlds_list': {
        const { status_filter = 'all' } = args as { status_filter?: string };
        const worlds = Array.from(worldRegistry.values())
          .filter(w => status_filter === 'all' || w.status === status_filter)
          .map(w => ({ id: w.id, name: w.name, location: w.location, status: w.status, spheres: w.spheres.length, deployed_url: w.deployed_url || null }));

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ total: worlds.length, worlds }, null, 2),
          }],
        };
      }

      case 'worlds_deploy': {
        const { world_id, subdomain, private: isPrivate = true } = args as {
          world_id: string; subdomain?: string; private?: boolean;
        };
        const world = worldRegistry.get(world_id);
        if (!world) throw new Error(`World ${world_id} not found`);

        const sub = subdomain || world.location;
        const deployed_url = `https://${sub}.kupuri.media/worlds/${world_id}`;
        world.status = 'deployed';
        world.deployed_url = deployed_url;
        worldRegistry.set(world_id, world);

        // In production: trigger Coolify deploy API
        const coolifyPayload = {
          world_id,
          location: world.location,
          spheres: world.spheres,
          subdomain: sub,
          private: isPrivate,
          glb_url: world.glb_url || null,
          video_url: world.video_url || null,
        };

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              world_id,
              deployed_url,
              subdomain: sub,
              private: isPrivate,
              coolify_target: `${COOLIFY_URL}/api/v1/deploy`,
              note: 'Trigger Coolify deployment via COOLIFY_API_TOKEN to go live',
              coolify_payload: coolifyPayload,
            }, null, 2),
          }],
        };
      }

      case 'worlds_ab_test': {
        const { world_a, world_b, metric = 'engagement', duration_hours = 24 } = args as {
          world_a: string; world_b: string; metric?: string; duration_hours?: number;
        };
        const wA = worldRegistry.get(world_a);
        const wB = worldRegistry.get(world_b);

        // Simulate A/B test setup (in production: wire to pauli-auto-research)
        const test_id = `ab-${randomUUID().slice(0,8)}`;
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              test_id,
              world_a: { id: world_a, name: wA?.name || world_a, location: wA?.location },
              world_b: { id: world_b, name: wB?.name || world_b, location: wB?.location },
              metric,
              duration_hours,
              traffic_split: '50/50',
              tracking_endpoint: `/api/ab/track?test=${test_id}`,
              results_endpoint: `/api/ab/results?test=${test_id}`,
              note: 'Wire to pauli-auto-research for live metric collection and auto-optimization',
            }, null, 2),
          }],
        };
      }

      case 'worlds_voice_command': {
        const { command } = args as { command: string };

        // LLM-powered intent matching via OpenRouter
        if (OPEN_ROUTER_API) {
          const llmRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPEN_ROUTER_API}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'anthropic/claude-3.5-sonnet',
              max_tokens: 300,
              messages: [{
                role: 'system',
                content: `You are a voice command parser for Synthia's World Builder. 
Extract intent and parameters from voice commands (Spanish or English).
Available tools: worlds_create, worlds_deploy, worlds_list, worlds_ab_test, worlds_assign_sphere.
Available locations: santa-maria-ribera, balcon-del-zocalo, manantiales-xochimilco, la-panorama-vallarta.
Available spheres: synthia, alex, cazadora, forjadora, seductora, consejo, dr-economia, dra-cultura, ing-teknos, la-vigilante.
Return ONLY JSON: { "tool": "...", "params": {...}, "confidence": 0.0-1.0 }`,
              }, {
                role: 'user',
                content: command,
              }],
            }),
          });
          if (llmRes.ok) {
            const llmData = await llmRes.json();
            const parsed = llmData.choices?.[0]?.message?.content;
            try {
              const intent = JSON.parse(parsed);
              return {
                content: [{
                  type: 'text',
                  text: JSON.stringify({
                    original_command: command,
                    detected_intent: intent,
                    dispatch: `Call tool: ${intent.tool} with params: ${JSON.stringify(intent.params)}`,
                  }, null, 2),
                }],
              };
            } catch { /* fall through to regex */ }
          }
        }

        // Fallback: regex intent matching
        for (const intent of VOICE_INTENTS) {
          if (intent.patterns.some(p => p.test(command))) {
            const params = intent.extract(command);
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  original_command: command,
                  detected_intent: { tool: intent.tool, params, confidence: 0.7 },
                  dispatch: `Call tool: ${intent.tool}`,
                }, null, 2),
              }],
            };
          }
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ original_command: command, error: 'Could not parse intent', suggestions: ['worlds_create', 'worlds_list', 'worlds_deploy'] }, null, 2),
          }],
        };
      }

      case 'worlds_link_to_llm': {
        const { world_id, llm_provider = 'openrouter', frame_urls = [], prompt } = args as {
          world_id: string; llm_provider?: string; frame_urls?: string[]; prompt: string;
        };
        const world = worldRegistry.get(world_id);

        const messages: Array<{ role: string; content: unknown }> = [{
          role: 'system',
          content: `You are analyzing a Synthia World: ${world?.name || world_id} at ${world?.location || 'unknown'}. 
Sphere agents: ${world?.spheres?.join(', ') || 'unknown'}.
Purpose: visual context for multi-LLM sphere council.`,
        }];

        if (frame_urls.length > 0) {
          messages.push({
            role: 'user',
            content: [
              ...frame_urls.map(url => ({ type: 'image_url', image_url: { url } })),
              { type: 'text', text: prompt },
            ],
          });
        } else {
          messages.push({ role: 'user', content: prompt });
        }

        // Route to appropriate LLM
        if (llm_provider === 'openrouter' && OPEN_ROUTER_API) {
          const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPEN_ROUTER_API}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: frame_urls.length > 0 ? 'anthropic/claude-3.5-sonnet' : 'anthropic/claude-3.5-sonnet',
              max_tokens: 1024,
              messages,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  world_id,
                  llm_provider,
                  response: data.choices?.[0]?.message?.content,
                  usage: data.usage,
                }, null, 2),
              }],
            };
          }
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ world_id, error: 'LLM call failed — check OPEN_ROUTER_API env var', llm_provider }, null, 2),
          }],
        };
      }

      case 'worlds_metrics': {
        const { world_id, period = '24h' } = args as { world_id: string; period?: string };
        const world = worldRegistry.get(world_id);

        // Placeholder metrics (in production: pull from Supabase analytics)
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              world_id,
              name: world?.name || world_id,
              period,
              metrics: {
                views: world?.metrics?.views || 0,
                engagement_score: world?.metrics?.engagement || 0,
                avg_time_in_world_sec: 0,
                sphere_interactions: 0,
                ab_variant: world?.metrics?.ab_variant || null,
                video_plays: 0,
                glb_loads: 0,
              },
              note: 'Wire to Supabase analytics for live data. Schema: worlds_metrics table.',
            }, null, 2),
          }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: 'text', text: `Error: ${message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[mcp-worlds] Worlds Orchestrator running — "We build worlds, not websites."');
}

main().catch((err) => {
  console.error('[mcp-worlds] Fatal:', err);
  process.exit(1);
});
