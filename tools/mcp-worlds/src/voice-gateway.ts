/**
 * Voice Gateway — Kupuri Media™ / Synthia Studio
 *
 * WebSocket server that:
 * 1. Receives audio/text commands from Surface tablet or any client
 * 2. Transcribes via ElevenLabs STT (or Whisper)
 * 3. Parses intent using worlds_voice_command
 * 4. Dispatches to appropriate MCP tool
 * 5. Returns confirmation with world ID / job ID
 *
 * Run: npx tsx src/voice-gateway.ts
 * WS:  ws://localhost:3104 (or wss:// in cloud)
 *
 * Message format:
 *   → { type: 'text_command', command: '...' }
 *   → { type: 'voice_b64', audio: '<base64 wav/webm>' }
 *   ← { type: 'result', tool: '...', data: {...} }
 *   ← { type: 'error', message: '...' }
 */

import {  WebSocketServer, WebSocket } from 'ws';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../apps/control-room/.env.local') });

const PORT = Number(process.env.VOICE_GATEWAY_PORT) || 3104;
const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY || '';
const OPEN_ROUTER_API = process.env.OPEN_ROUTER_API || '';

// Voice command action patterns (Spanish & English)
const COMMAND_ROUTER = [
  {
    pattern: /crea.*mundo|build.*world|create.*world/i,
    handler: 'worlds_create',
    extract: (cmd: string) => ({
      location: extractLocation(cmd),
      sphere_ids: extractSpheres(cmd),
      world_name: null,
    }),
  },
  {
    pattern: /agrega.*esfera|add.*sphere/i,
    handler: 'worlds_assign_sphere',
    extract: (cmd: string) => ({
      world_id: extractWorldId(cmd),
      sphere_id: extractSpheres(cmd)[0] || '',
      action: 'add',
    }),
  },
  {
    pattern: /despliega|deploy|publica|publish/i,
    handler: 'worlds_deploy',
    extract: (cmd: string) => ({ world_id: extractWorldId(cmd) }),
  },
  {
    pattern: /lista|muéstrame|show.*worlds/i,
    handler: 'worlds_list',
    extract: () => ({ status_filter: 'all' }),
  },
  {
    pattern: /genera.*video|make.*video|video.*para/i,
    handler: 'higgsfield_animate_scene',
    extract: (cmd: string) => ({ location: extractLocation(cmd), time_of_day: 'golden_hour' }),
  },
  {
    pattern: /renderiza|render.*blender|crea.*3d/i,
    handler: 'blender_create_sphere_world',
    extract: (cmd: string) => ({ location: extractLocation(cmd), sphere_ids: extractSpheres(cmd) }),
  },
];

function extractLocation(text: string): string {
  if (/vallarta/i.test(text)) return 'la-panorama-vallarta';
  if (/zócalo|zocalo/i.test(text)) return 'balcon-del-zocalo';
  if (/xochimilco/i.test(text)) return 'manantiales-xochimilco';
  return 'santa-maria-ribera';
}

function extractSpheres(text: string): string[] {
  const all = ['synthia', 'alex', 'cazadora', 'forjadora', 'seductora', 'consejo', 'dr-economia', 'dra-cultura', 'ing-teknos', 'la-vigilante'];
  const found = all.filter(s => text.toLowerCase().includes(s));
  return found.length ? found : ['synthia', 'alex'];
}

function extractWorldId(text: string): string {
  const match = text.match(/world[-_]?([a-f0-9]{8})/i);
  return match ? `world-${match[1]}` : '';
}

/** Transcribe audio via ElevenLabs Speech-to-Text */
async function transcribeAudio(audioBase64: string): Promise<string> {
  if (!ELEVEN_LABS_API_KEY) {
    throw new Error('ELEVEN_LABS_API_KEY not configured');
  }
  const audioBuffer = Buffer.from(audioBase64, 'base64');
  const blob = new Blob([audioBuffer], { type: 'audio/webm' });
  const form = new FormData();
  form.append('audio', blob, 'voice_command.webm');
  form.append('model_id', 'scribe_v1');

  const res = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: { 'xi-api-key': ELEVEN_LABS_API_KEY },
    body: form,
  });
  if (!res.ok) throw new Error(`ElevenLabs STT error ${res.status}`);
  const data = await res.json();
  return data.text || '';
}

/** LLM-powered command parsing fallback */
async function llmParseCommand(command: string): Promise<{ handler: string; params: Record<string, unknown> }> {
  if (!OPEN_ROUTER_API) throw new Error('OPEN_ROUTER_API not configured');

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPEN_ROUTER_API}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet',
      max_tokens: 200,
      messages: [
        {
          role: 'system',
          content: `Parse voice commands for Synthia's World Builder.
Tools: worlds_create, worlds_deploy, worlds_list, worlds_assign_sphere, higgsfield_animate_scene, blender_create_sphere_world.
Locations: santa-maria-ribera, balcon-del-zocalo, manantiales-xochimilco, la-panorama-vallarta.
Spheres: synthia, alex, cazadora, forjadora, seductora, consejo, dr-economia, dra-cultura, ing-teknos, la-vigilante.
Respond with ONLY JSON: { "handler": "tool_name", "params": {...} }`,
        },
        { role: 'user', content: command },
      ],
    }),
  });
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || '{}';
  return JSON.parse(raw);
}

// ─── WebSocket Server ──────────────────────────────────────────────────────────

const wss = new WebSocketServer({ port: PORT });

wss.on('listening', () => {
  console.log(`[voice-gateway] WebSocket server listening on ws://localhost:${PORT}`);
  console.log(`[voice-gateway] Connect from Surface tablet, Claude Code, or any WebSocket client`);
  console.log(`[voice-gateway] Supports: text commands, base64 audio, voice → world dispatch`);
});

wss.on('connection', (ws: WebSocket, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`[voice-gateway] Client connected: ${clientIp}`);

  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Synthia Voice Gateway active. "We build worlds, not websites." Send { type: "text_command", command: "..." }',
    available_locations: ['santa-maria-ribera', 'balcon-del-zocalo', 'manantiales-xochimilco', 'la-panorama-vallarta'],
  }));

  ws.on('message', async (data: Buffer) => {
    let msg: { type: string; command?: string; audio?: string };
    try {
      msg = JSON.parse(data.toString());
    } catch {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
      return;
    }

    try {
      let command = '';

      if (msg.type === 'text_command' && msg.command) {
        command = msg.command;
      } else if (msg.type === 'voice_b64' && msg.audio) {
        ws.send(JSON.stringify({ type: 'status', message: 'Transcribing audio...' }));
        command = await transcribeAudio(msg.audio);
        ws.send(JSON.stringify({ type: 'transcription', text: command }));
      } else {
        ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type. Use text_command or voice_b64.' }));
        return;
      }

      // Route command
      ws.send(JSON.stringify({ type: 'status', message: `Parsing: "${command}"` }));
      let handler = '';
      let params: Record<string, unknown> = {};

      const matched = COMMAND_ROUTER.find(r => r.pattern.test(command));
      if (matched) {
        handler = matched.handler;
        params = matched.extract(command);
      } else {
        // LLM fallback
        try {
          const parsed = await llmParseCommand(command);
          handler = parsed.handler;
          params = parsed.params;
        } catch {
          ws.send(JSON.stringify({ type: 'error', message: `Could not parse: "${command}"` }));
          return;
        }
      }

      ws.send(JSON.stringify({
        type: 'result',
        original_command: command,
        tool: handler,
        params,
        message: `Dispatching to ${handler}...`,
        note: `Call tool ${handler} via MCP client with params above`,
      }));

    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      ws.send(JSON.stringify({ type: 'error', message }));
    }
  });

  ws.on('close', () => {
    console.log(`[voice-gateway] Client disconnected: ${clientIp}`);
  });
});

process.on('SIGTERM', () => { wss.close(); process.exit(0); });
process.on('SIGINT',  () => { wss.close(); process.exit(0); });
