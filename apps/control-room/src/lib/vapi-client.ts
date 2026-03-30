/**
 * vapi-client.ts — ALEX™ VAPI Voice Core
 * Bead B2: Alex™ is a FEMALE advisor with CDMX Mexican City personality.
 * Voice: ElevenLabs eleven_multilingual_v2, female accent, Ciudad de México.
 *
 * This module exports:
 *   - ALEX_ASSISTANT_CONFIG — the VAPI assistant definition (server-side)
 *   - createVapiClient() — browser-side Vapi SDK wrapper
 *   - registerAlexAssistant() — POST to VAPI API to create/update the assistant
 */

import { secrets } from '@/lib/secrets-client';
import { getTabletSystemPrompt } from '@/lib/emerald-tablets';

// ─────────────────────────────────────────────────────────────────────────────
// Alex™ Assistant Config (VAPI Assistant Object)
// ─────────────────────────────────────────────────────────────────────────────

export const ALEX_ASSISTANT_CONFIG = {
  name: 'ALEX™',
  model: {
    provider: 'openai',                  // VAPI uses openai-compatible format
    model: 'gpt-4o',
    messages: [
      {
        role: 'system' as const,
        content: `Eres ALEX™, la Chief Advisor de SYNTHIA™ Sphere OS — una IA femenina con acento chilango auténtico de la Ciudad de México.

IDENTIDAD:
- Nombre: ALEX™ (siempre con el símbolo ™)
- Género: Femenina — usa "yo soy", "estoy lista", "voy a ayudarte"
- Personalidad: Directa, cálida, ejecutiva. No eres un chatbot — eres socia estratégica.
- Idioma por defecto: Español mexicano. Puedes alternar al inglés si el usuario empieza en inglés.
- Tono: Como una colega de Santa María la Ribera que conoce business, tech y cultura LATAM.

CAPACIDADES (tools disponibles):
- get_sphere_status: Consulta el estado de las 9 esferas del Consejo
- run_council_meeting: Convoca una reunión del Consejo SYNTHIA™
- search_knowledge: Busca en la base de conocimiento de Kupuri Media
- create_task: Crea tareas en el sistema de gestión
- get_analytics: Obtiene métricas del dashboard

REGLAS:
- Nunca digas que eres un asistente de IA genérico
- Nunca menciones "Dolores Cannon" ni "Paperclip"
- Si algo está fuera de tu alcance, di "Voy a escalar eso con el Consejo"
- Respuestas concisas — máximo 3 oraciones por turno en voz
- Termina siempre con acción: "¿Qué sigue?" o "¿Quieres que proceda?"
${getTabletSystemPrompt('alex', [0, 1, 5, 6, 7])}`,
      },
    ],
    temperature: 0.7,
    maxTokens: 512,
  },
  voice: {
    provider: 'elevenlabs',
    voiceId: process.env.SPHERE_ALEX_VOICE_ID || 'ErXwobaYiN019PkySvjV',
    model: 'eleven_multilingual_v2',
    stability: 0.72,
    similarityBoost: 0.85,
    style: 0.40,
    useSpeakerBoost: true,
  },
  transcriber: {
    provider: 'deepgram',
    model: 'nova-2',
    language: 'es',
  },
  firstMessage: '¡Hola! Soy ALEX™, tu Chief Advisor. ¿En qué te puedo ayudar hoy?',
  endCallMessage: 'Perfecto. Quedo pendiente. ¡Hasta pronto!',
  serverUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/vapi/tools`,
  tools: [
    {
      type: 'function' as const,
      function: {
        name: 'get_sphere_status',
        description: 'Get the current status and coherence of all 9 SYNTHIA™ spheres',
        parameters: {
          type: 'object',
          properties: {
            sphereId: {
              type: 'string',
              description: 'Optional: specific sphere ID (synthia, alex, cazadora, etc.)',
            },
          },
          required: [],
        },
      },
    },
    {
      type: 'function' as const,
      function: {
        name: 'run_council_meeting',
        description: 'Trigger a SYNTHIA™ Council meeting with the 9 sphere agents',
        parameters: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              description: 'The topic or agenda for the council meeting',
            },
            urgency: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'emergency'],
              description: 'Urgency level of the meeting',
            },
          },
          required: ['topic'],
        },
      },
    },
    {
      type: 'function' as const,
      function: {
        name: 'search_knowledge',
        description: 'Search Kupuri Media knowledge base for information',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The search query',
            },
          },
          required: ['query'],
        },
      },
    },
    {
      type: 'function' as const,
      function: {
        name: 'create_task',
        description: 'Create a new task or follow-up item in the management system',
        parameters: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Task title',
            },
            assignee: {
              type: 'string',
              description: 'Which sphere or person to assign to',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
            },
          },
          required: ['title'],
        },
      },
    },
    {
      type: 'function' as const,
      function: {
        name: 'get_analytics',
        description: 'Retrieve dashboard analytics and KPIs',
        parameters: {
          type: 'object',
          properties: {
            metric: {
              type: 'string',
              description: 'Specific metric to retrieve (revenue, users, tasks, etc.)',
            },
            period: {
              type: 'string',
              enum: ['today', 'week', 'month', 'quarter'],
            },
          },
          required: [],
        },
      },
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Server-side: Register/Update Alex™ assistant in VAPI
// ─────────────────────────────────────────────────────────────────────────────

export async function registerAlexAssistant(): Promise<{ id: string } | null> {
  const apiKey = secrets.vapiPrivateKey();
  if (!apiKey) {
    console.error('[vapi-client] VAPI_PRIVATE_KEY not set');
    return null;
  }

  try {
    // Check if assistant already exists
    const listRes = await fetch('https://api.vapi.ai/assistant', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (listRes.ok) {
      const list = await listRes.json() as Array<{ id: string; name: string }>;
      const existing = list.find(a => a.name === 'ALEX™');
      if (existing) {
        // Update existing
        const upRes = await fetch(`https://api.vapi.ai/assistant/${existing.id}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(ALEX_ASSISTANT_CONFIG),
        });
        if (upRes.ok) {
          console.log(`[vapi-client] ALEX™ assistant updated: ${existing.id}`);
          return { id: existing.id };
        }
      }
    }

    // Create new
    const createRes = await fetch('https://api.vapi.ai/assistant', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(ALEX_ASSISTANT_CONFIG),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      console.error('[vapi-client] Failed to create assistant:', err);
      return null;
    }

    const data = await createRes.json() as { id: string };
    console.log(`[vapi-client] ALEX™ assistant created: ${data.id}`);
    return data;
  } catch (err) {
    console.error('[vapi-client] registerAlexAssistant error:', (err as Error).message);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Client-side: browser Vapi SDK factory
// (imported lazily so SSR doesn't break)
// ─────────────────────────────────────────────────────────────────────────────

export type VapiCallStatus = 'idle' | 'connecting' | 'active' | 'ending' | 'error';

export interface VapiTranscript {
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export async function createVapiClient() {
  const { default: Vapi } = await import('@vapi-ai/web');
  const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '';
  if (!publicKey) {
    console.warn('[vapi-client] NEXT_PUBLIC_VAPI_PUBLIC_KEY not set — voice disabled');
  }
  return new Vapi(publicKey);
}
