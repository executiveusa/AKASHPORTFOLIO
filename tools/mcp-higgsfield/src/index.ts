#!/usr/bin/env node
/**
 * Higgsfield MCP Server — Kupuri Media™ / Synthia Studio
 *
 * Tools:
 *   higgsfield_generate_video   — text/image → cinematic video
 *   higgsfield_add_motion       — image + motion descriptor → video
 *   higgsfield_animate_scene    — 3D scene description → animated clip
 *   higgsfield_sphere_avatar    — generate sphere agent's visual avatar
 *   higgsfield_get_job_status   — poll async generation job
 *
 * Auth: JWT signed with API Key ID + Secret (Higgsfield v2 auth)
 * Deployed on: Coolify VPS — accessible at https://mcp.kupuri.media/higgsfield
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as dotenv from 'dotenv';
import { SignJWT } from 'jose';
import { z } from 'zod';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../apps/control-room/.env.local') });

const API_KEY_ID = process.env.HIGGSFIELD_API_KEY_ID!;
const API_KEY_SECRET = process.env.HIGGSFIELD_API_KEY_SECRET!;
const HIGGSFIELD_BASE = 'https://api.higgsfield.ai/v1';

// SPHERE agent color mapping for avatar generation
const SPHERE_STYLES: Record<string, { color: string; vibe: string }> = {
  synthia:      { color: '#8b5cf6', vibe: 'ethereal violet, coordinator, calm presence' },
  alex:         { color: '#d4af37', vibe: 'golden executive, strategic, Latin boardroom' },
  cazadora:     { color: '#ef4444', vibe: 'red energy, Colombian hunter, dynamic motion' },
  forjadora:    { color: '#22c55e', vibe: 'green builder, Rioplatense architect, structural' },
  seductora:    { color: '#eab308', vibe: 'gold closer, Habanera elegance, charisma' },
  consejo:      { color: '#1d4ed8', vibe: 'deep blue council, Chilean wisdom, clarity' },
  'dr-economia':{ color: '#f97316', vibe: 'orange analyst, Venezuelan finance, precision' },
  'dra-cultura':{ color: '#f43f5e', vibe: 'rose strategist, Peruvian culture, community' },
  'ing-teknos': { color: '#06b6d4', vibe: 'cyan engineer, Puerto Rican tech, innovation' },
  'la-vigilante':{ color: '#64748b', vibe: 'slate guardian, neutral, watchful lightning' },
};

/** Generate a short-lived JWT for Higgsfield API auth */
async function getHiggsfieldJWT(): Promise<string> {
  const secret = new TextEncoder().encode(API_KEY_SECRET);
  return new SignJWT({ sub: API_KEY_ID })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(secret);
}

/** POST to Higgsfield API */
async function higgsfieldPost(path: string, body: Record<string, unknown>) {
  const token = await getHiggsfieldJWT();
  const res = await fetch(`${HIGGSFIELD_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Higgsfield API error ${res.status}: ${err}`);
  }
  return res.json();
}

/** GET from Higgsfield API */
async function higgsfieldGet(path: string) {
  const token = await getHiggsfieldJWT();
  const res = await fetch(`${HIGGSFIELD_BASE}${path}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Higgsfield API error ${res.status}`);
  return res.json();
}

// ─── MCP Server ────────────────────────────────────────────────────────────────

const server = new Server(
  { name: 'mcp-higgsfield', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'higgsfield_generate_video',
      description: 'Generate a cinematic video from a text prompt or image URL using Higgsfield AI. Returns a job ID to poll.',
      inputSchema: {
        type: 'object',
        properties: {
          prompt:       { type: 'string', description: 'Cinematic scene description' },
          style:        { type: 'string', enum: ['cinematic', 'documentary', 'animated', 'vintage'], default: 'cinematic' },
          duration_sec: { type: 'number', description: 'Duration in seconds (2-10)', default: 4 },
          aspect_ratio: { type: 'string', enum: ['16:9', '9:16', '1:1'], default: '16:9' },
          image_url:    { type: 'string', description: 'Optional reference image URL to animate' },
        },
        required: ['prompt'],
      },
    },
    {
      name: 'higgsfield_add_motion',
      description: 'Add motion to an existing image — zoom, pan, parallax, camera fly-through',
      inputSchema: {
        type: 'object',
        properties: {
          image_url:   { type: 'string', description: 'Source image URL' },
          motion_type: { type: 'string', enum: ['zoom_in', 'zoom_out', 'pan_left', 'pan_right', 'parallax', 'fly_through'], default: 'zoom_in' },
          intensity:   { type: 'number', description: 'Motion intensity 0.1–1.0', default: 0.5 },
          prompt:      { type: 'string', description: 'Optional scene context prompt' },
        },
        required: ['image_url'],
      },
    },
    {
      name: 'higgsfield_animate_scene',
      description: 'Animate a described 3D meeting world or sphere environment scene',
      inputSchema: {
        type: 'object',
        properties: {
          location:       { type: 'string', description: 'Location ID: santa-maria-ribera | balcon-del-zocalo | manantiales-xochimilco | la-panorama-vallarta' },
          scene_prompt:   { type: 'string', description: 'Additional scene description to layer' },
          time_of_day:    { type: 'string', enum: ['dawn', 'golden_hour', 'dusk', 'night', 'blue_hour'], default: 'golden_hour' },
          duration_sec:   { type: 'number', default: 6 },
          sphere_ids:     { type: 'array', items: { type: 'string' }, description: 'Sphere agents present in scene' },
        },
        required: ['location'],
      },
    },
    {
      name: 'higgsfield_sphere_avatar',
      description: 'Generate a visual avatar video for a sphere agent using their soul color and persona',
      inputSchema: {
        type: 'object',
        properties: {
          sphere_id:   { type: 'string', description: 'Sphere agent ID (synthia | alex | cazadora | etc.)' },
          pose:        { type: 'string', enum: ['idle', 'thinking', 'speaking', 'activating'], default: 'idle' },
          loop:        { type: 'boolean', description: 'Create loopable video', default: true },
        },
        required: ['sphere_id'],
      },
    },
    {
      name: 'higgsfield_get_job_status',
      description: 'Poll the status of an async Higgsfield generation job',
      inputSchema: {
        type: 'object',
        properties: {
          job_id: { type: 'string', description: 'Job ID returned by a generation call' },
        },
        required: ['job_id'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'higgsfield_generate_video': {
        const { prompt, style = 'cinematic', duration_sec = 4, aspect_ratio = '16:9', image_url } = args as {
          prompt: string; style?: string; duration_sec?: number; aspect_ratio?: string; image_url?: string;
        };
        const body: Record<string, unknown> = {
          prompt,
          style,
          duration: duration_sec,
          aspect_ratio,
        };
        if (image_url) body.image_url = image_url;
        const result = await higgsfieldPost('/videos/generate', body);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ success: true, job_id: result.id, status: result.status, eta_seconds: result.eta }, null, 2),
          }],
        };
      }

      case 'higgsfield_add_motion': {
        const { image_url, motion_type = 'zoom_in', intensity = 0.5, prompt } = args as {
          image_url: string; motion_type?: string; intensity?: number; prompt?: string;
        };
        const result = await higgsfieldPost('/videos/motion', {
          image_url, motion_type, intensity,
          ...(prompt && { prompt }),
        });
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ success: true, job_id: result.id, status: result.status }, null, 2),
          }],
        };
      }

      case 'higgsfield_animate_scene': {
        const { location, scene_prompt = '', time_of_day = 'golden_hour', duration_sec = 6, sphere_ids = [] } = args as {
          location: string; scene_prompt?: string; time_of_day?: string; duration_sec?: number; sphere_ids?: string[];
        };

        const locationPrompts: Record<string, string> = {
          'santa-maria-ribera':       'Kiosco Morisco cast-iron pavilion, Alameda park CDMX, ancient trees, dappled light',
          'balcon-del-zocalo':        'rooftop terrace above Zócalo Mexico City, Metropolitan Cathedral view, mezcal hour',
          'manantiales-xochimilco':   'Félix Candela hyperbolic paraboloid restaurant floating over Xochimilco canals',
          'la-panorama-vallarta':     'La Panorama rooftop Bahía de Banderas, Pacific ocean sunset, Puerto Vallarta palms',
        };

        const sphereDesc = sphere_ids.length
          ? ` Sphere agents present: ${sphere_ids.map(id => SPHERE_STYLES[id]?.vibe || id).join(', ')}.`
          : '';

        const fullPrompt = `${locationPrompts[location] || location}, ${time_of_day} lighting.${sphereDesc} ${scene_prompt}`.trim();

        const result = await higgsfieldPost('/videos/generate', {
          prompt: fullPrompt,
          style: 'cinematic',
          duration: duration_sec,
          aspect_ratio: '16:9',
        });
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ success: true, job_id: result.id, location, full_prompt: fullPrompt, status: result.status }, null, 2),
          }],
        };
      }

      case 'higgsfield_sphere_avatar': {
        const { sphere_id, pose = 'idle', loop = true } = args as {
          sphere_id: string; pose?: string; loop?: boolean;
        };
        const style = SPHERE_STYLES[sphere_id] || { color: '#ffffff', vibe: sphere_id };
        const prompt = `Digital AI entity avatar, ${style.vibe}, color ${style.color}, holographic sphere form, ${pose} motion, dark cosmic background, particle effects, ultra-cinematic 4K`;
        const result = await higgsfieldPost('/videos/generate', {
          prompt,
          style: 'cinematic',
          duration: loop ? 3 : 5,
          aspect_ratio: '1:1',
        });
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ success: true, sphere_id, job_id: result.id, prompt, loop, status: result.status }, null, 2),
          }],
        };
      }

      case 'higgsfield_get_job_status': {
        const { job_id } = args as { job_id: string };
        const result = await higgsfieldGet(`/videos/${job_id}`);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              job_id,
              status: result.status,
              progress: result.progress,
              video_url: result.output_url || result.video_url || null,
              thumbnail_url: result.thumbnail_url || null,
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
  console.error('[mcp-higgsfield] Server running on stdio — Synthia Studio ready');
}

main().catch((err) => {
  console.error('[mcp-higgsfield] Fatal:', err);
  process.exit(1);
});
