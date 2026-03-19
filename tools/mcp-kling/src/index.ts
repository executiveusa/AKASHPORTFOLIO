#!/usr/bin/env node
/**
 * Kling AI MCP Server — Kupuri Media™ / Synthia Studio
 *
 * Tools:
 *   kling_text_to_video       — text prompt → video
 *   kling_image_to_video      — image + prompt → animated video
 *   kling_video_effects       — apply cinematic effects to video
 *   kling_world_flythrough    — generate a 3D world fly-through for sphere meetings
 *   kling_get_task_status     — poll async generation task
 *
 * Kling API: https://api.klingai.com/v1
 * Auth: Bearer token (KLING_API_KEY)
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../apps/control-room/.env.local') });

const KLING_API_KEY = process.env.KLING_API_KEY || '';
const KLING_BASE = 'https://api.klingai.com/v1';

async function klingRequest(
  method: 'GET' | 'POST',
  path: string,
  body?: Record<string, unknown>
) {
  const res = await fetch(`${KLING_BASE}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${KLING_API_KEY}`,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Kling API error ${res.status}: ${err}`);
  }
  return res.json();
}

// Location cinematic presets
const LOCATION_CINEMATIC: Record<string, string> = {
  'santa-maria-ribera':     'Lush green alameda park Mexico City, moorish iron pavilion, atmospheric golden light, cinematic wide angle',
  'balcon-del-zocalo':      'Dramatic Mexico City rooftop, cathedral and national palace visible, golden hour sky, cinematic establishing shot',
  'manantiales-xochimilco': 'Hyperbolic concrete shell floating over Mexican canal, ancient waterway, blue hour, architectural masterpiece',
  'la-panorama-vallarta':   'Pacific coast rooftop Puerto Vallarta, sweeping ocean view, palm silhouettes, sunset fire sky',
};

const server = new Server(
  { name: 'mcp-kling', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'kling_text_to_video',
      description: 'Generate high-quality video from a text prompt using Kling AI (best for dynamic cinematic content)',
      inputSchema: {
        type: 'object',
        properties: {
          prompt:       { type: 'string', description: 'Cinematic text description' },
          negative_prompt: { type: 'string', description: 'What to avoid in the video', default: 'blur, artifacts, watermark' },
          model:        { type: 'string', enum: ['kling-v1', 'kling-v1-5', 'kling-v2'], default: 'kling-v1-5' },
          duration:     { type: 'number', enum: [5, 10], default: 5 },
          aspect_ratio: { type: 'string', enum: ['16:9', '9:16', '1:1'], default: '16:9' },
          mode:         { type: 'string', enum: ['std', 'pro'], default: 'std' },
        },
        required: ['prompt'],
      },
    },
    {
      name: 'kling_image_to_video',
      description: 'Animate an existing image into a cinematic video using Kling AI',
      inputSchema: {
        type: 'object',
        properties: {
          image_url:    { type: 'string', description: 'Source image URL to animate' },
          prompt:       { type: 'string', description: 'Motion and scene description' },
          tail_image_url: { type: 'string', description: 'Optional end-frame image' },
          duration:     { type: 'number', enum: [5, 10], default: 5 },
          mode:         { type: 'string', enum: ['std', 'pro'], default: 'std' },
        },
        required: ['image_url', 'prompt'],
      },
    },
    {
      name: 'kling_video_effects',
      description: 'Apply special cinematic effects to an existing video (hug, kiss, expand, echo, etc.)',
      inputSchema: {
        type: 'object',
        properties: {
          scene_type:  { type: 'string', enum: ['hug', 'kiss', 'heart_gesture', 'squish', 'expansion', 'dizziness', 'jelly', 'bloombloom', 'echo', 'tail'] },
          image_url:   { type: 'string', description: 'Source image URL for effect' },
          duration:    { type: 'number', enum: [5, 10], default: 5 },
        },
        required: ['scene_type', 'image_url'],
      },
    },
    {
      name: 'kling_world_flythrough',
      description: 'Generate a cinematic fly-through video for a sphere meeting world location',
      inputSchema: {
        type: 'object',
        properties: {
          location_id: {
            type: 'string',
            enum: ['santa-maria-ribera', 'balcon-del-zocalo', 'manantiales-xochimilco', 'la-panorama-vallarta'],
            description: 'Sphere meeting world location',
          },
          sphere_count: { type: 'number', description: 'Number of sphere agents present (for scale)', default: 3 },
          time_of_day:  { type: 'string', enum: ['dawn', 'morning', 'golden_hour', 'blue_hour', 'night'], default: 'golden_hour' },
          camera_move:  { type: 'string', enum: ['dolly', 'orbit', 'crane', 'handheld', 'aerial'], default: 'dolly' },
        },
        required: ['location_id'],
      },
    },
    {
      name: 'kling_get_task_status',
      description: 'Check the status of an active Kling video generation task',
      inputSchema: {
        type: 'object',
        properties: {
          task_id:     { type: 'string', description: 'Task ID from a generation call' },
          task_type:   { type: 'string', enum: ['text2video', 'image2video', 'effects'], default: 'text2video' },
        },
        required: ['task_id'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!KLING_API_KEY) {
    return {
      content: [{ type: 'text', text: 'Error: KLING_API_KEY not configured. Add it to .env.local.' }],
      isError: true,
    };
  }

  try {
    switch (name) {
      case 'kling_text_to_video': {
        const { prompt, negative_prompt = 'blur, artifacts, watermark', model = 'kling-v1-5', duration = 5, aspect_ratio = '16:9', mode = 'std' } = args as {
          prompt: string; negative_prompt?: string; model?: string; duration?: number; aspect_ratio?: string; mode?: string;
        };
        const result = await klingRequest('POST', '/videos/text2video', {
          model_name: model,
          prompt,
          negative_prompt,
          cfg_scale: 0.5,
          mode,
          duration: String(duration),
          aspect_ratio,
        });
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ success: true, task_id: result.data?.task_id, status: result.data?.task_status }, null, 2),
          }],
        };
      }

      case 'kling_image_to_video': {
        const { image_url, prompt, tail_image_url, duration = 5, mode = 'std' } = args as {
          image_url: string; prompt: string; tail_image_url?: string; duration?: number; mode?: string;
        };
        const body: Record<string, unknown> = {
          model_name: 'kling-v1-5',
          image: image_url,
          prompt,
          mode,
          duration: String(duration),
          cfg_scale: 0.5,
        };
        if (tail_image_url) body.image_tail = tail_image_url;
        const result = await klingRequest('POST', '/videos/image2video', body);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ success: true, task_id: result.data?.task_id, status: result.data?.task_status }, null, 2),
          }],
        };
      }

      case 'kling_video_effects': {
        const { scene_type, image_url, duration = 5 } = args as {
          scene_type: string; image_url: string; duration?: number;
        };
        const result = await klingRequest('POST', '/videos/effects', {
          model_name: 'kling-v1-5',
          scene_type,
          duration: String(duration),
          input: { start_frame: { type: 'image', url: image_url } },
        });
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ success: true, task_id: result.data?.task_id, scene_type, status: result.data?.task_status }, null, 2),
          }],
        };
      }

      case 'kling_world_flythrough': {
        const { location_id, sphere_count = 3, time_of_day = 'golden_hour', camera_move = 'dolly' } = args as {
          location_id: string; sphere_count?: number; time_of_day?: string; camera_move?: string;
        };
        const base = LOCATION_CINEMATIC[location_id] || location_id;
        const prompt = `${base}, ${time_of_day} lighting, ${camera_move} camera movement, ${sphere_count} ethereal holographic sphere entities hovering in space, cinematic 4K, atmospheric depth`;
        const result = await klingRequest('POST', '/videos/text2video', {
          model_name: 'kling-v1-5',
          prompt,
          negative_prompt: 'people, text, logos, artifacts',
          mode: 'pro',
          duration: '10',
          aspect_ratio: '16:9',
          cfg_scale: 0.7,
        });
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ success: true, task_id: result.data?.task_id, location_id, prompt_used: prompt, status: result.data?.task_status }, null, 2),
          }],
        };
      }

      case 'kling_get_task_status': {
        const { task_id, task_type = 'text2video' } = args as { task_id: string; task_type?: string };
        const pathMap: Record<string, string> = {
          text2video:  `/videos/text2video/${task_id}`,
          image2video: `/videos/image2video/${task_id}`,
          effects:     `/videos/effects/${task_id}`,
        };
        const result = await klingRequest('GET', pathMap[task_type] || pathMap.text2video);
        const task = result.data;
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              task_id,
              status: task?.task_status,
              progress: task?.task_progress,
              video_url: task?.task_result?.videos?.[0]?.url || null,
              cover_url: task?.task_result?.videos?.[0]?.cover_image_url || null,
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
  console.error('[mcp-kling] Server running — Kling AI video generation active');
}

main().catch((err) => {
  console.error('[mcp-kling] Fatal:', err);
  process.exit(1);
});
