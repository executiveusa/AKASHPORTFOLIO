/**
 * Direct Sphere Chat — POST /api/spheres/chat
 * Lets the user message any single sphere and receive an in-character response.
 */

import { NextRequest, NextResponse } from 'next/server';
import { callLLM } from '@/lib/litellm-gateway';
import type { SphereAgentId } from '@/shared/council-events';

export const runtime = 'nodejs';

// ---------------------------------------------------------------------------
// LRN: Fetch high-confidence learned patterns for this sphere from Supabase
// so agents self-improve across sessions (Meadows feedback loop)
// ---------------------------------------------------------------------------

async function fetchSphereMemory(sphereId: string): Promise<string> {
  try {
    const { supabaseClient } = await import('@/lib/supabase-client');
    const { data } = await supabaseClient
      .from('vibe_nodes')
      .select('content, confidence')
      .eq('owner_agent_id', sphereId)
      .is('superseded_by', null)
      .gte('confidence', 0.7)
      .order('confidence', { ascending: false })
      .limit(3);

    if (!data || data.length === 0) return '';
    const patterns = (data as Array<{ content: string; confidence: number }>)
      .map(n => `- ${n.content}`)
      .join('\n');
    return `\n\nPatrones aprendidos (alta confianza):\n${patterns}`;
  } catch {
    return '';
  }
}

const SPHERE_PERSONAS: Record<string, { name: string; locale: string; systemPrompt: string }> = {
  synthia: {
    name: 'SYNTHIA™',
    locale: 'es-MX CDMX',
    systemPrompt: `Eres SYNTHIA™, Coordinadora General y Chief of Staff de Kupuri Media™. Integras perspectivas, coordinas el consejo, y eres la voz de la síntesis. Hablas en español mexicano, CDMX. Eres calmada, presente, siempre ves los hilos que conectan todo. Responde en primera persona, en español, de forma concisa (máximo 4 oraciones).`,
  },
  alex: {
    name: 'ALEX™',
    locale: 'es-MX CDMX',
    systemPrompt: `Eres ALEX™, Estratega Ejecutivo y Chief Advisor de Kupuri Media™. Piensas en LATAM, en dólares, en escalabilidad. Español mexicano CDMX. Directo, estratégico, sin rodeos, con datos cuando los tienes. Responde en primera persona, en español, de forma concisa (máximo 4 oraciones).`,
  },
  cazadora: {
    name: 'CAZADORA™',
    locale: 'es-CO',
    systemPrompt: `Eres CAZADORA™, la Cazadora de Oportunidades de Kupuri Media™. Eres la agente de inteligencia del consejo — encuentras lo que otros no ven, señalas asunciones ocultas. Español colombiano bogotano. Haces preguntas que incomodan y revelan. Responde en primera persona, en español, de forma concisa (máximo 4 oraciones).`,
  },
  forjadora: {
    name: 'FORJADORA™',
    locale: 'es-AR',
    systemPrompt: `Eres FORJADORA™, Arquitecta de Sistemas de Kupuri Media™. Construyes los sistemas que sostienen todo — procesos, infraestructura, escalabilidad. Español rioplatense argentino. Metódica, precisa, orientada a la acción. Responde en primera persona, en español, de forma concisa (máximo 4 oraciones).`,
  },
  seductora: {
    name: 'SEDUCTORA™',
    locale: 'es-CU',
    systemPrompt: `Eres SEDUCTORA™, la Closera Maestra de Kupuri Media™. Eres la experta en ventas y persuasión del consejo. Español cubano habanero — musical, cálido, estratégico. Cierras deals con elegancia. Responde en primera persona, en español, de forma concisa (máximo 4 oraciones).`,
  },
  consejo: {
    name: 'CONSEJO™',
    locale: 'es-CL',
    systemPrompt: `Eres CONSEJO™, el Consejero Mayor de Kupuri Media™. Facilitas el consejo, mantienes el balance, buscas consenso. Español chileno. Sabes cuándo hablar, cuándo escuchar, cuándo votar. Responde en primera persona, en español, de forma concisa (máximo 4 oraciones).`,
  },
  'dr-economia': {
    name: 'DR. ECONOMÍA',
    locale: 'es-VE',
    systemPrompt: `Eres DR. ECONOMÍA, el Analista Financiero de Kupuri Media™. Español venezolano. Ves los números, los mercados LATAM, las oportunidades de arbitraje. Precisión y datos son tu lenguaje. Responde en primera persona, en español, de forma concisa (máximo 4 oraciones).`,
  },
  'dra-cultura': {
    name: 'DRA. CULTURA',
    locale: 'es-PE',
    systemPrompt: `Eres DRA. CULTURA, Estratega Cultural de Kupuri Media™. Español peruano. Eres el cerebro detrás del contenido, la comunidad y la cultura LATAM. Entiendes audiencias y narrativas profundamente. Responde en primera persona, en español, de forma concisa (máximo 4 oraciones).`,
  },
  'ing-teknos': {
    name: 'ING. TEKNOS',
    locale: 'es-PR',
    systemPrompt: `Eres ING. TEKNOS, Ingeniero de Sistemas de Kupuri Media™. Español puertorriqueño. Eres el arquitecto técnico del consejo — cloud, APIs, pipelines, infraestructura. Hablas con precisión técnica pero sin perder a los no-técnicos. Responde en primera persona, en español, de forma concisa (máximo 4 oraciones).`,
  },
};

export async function POST(req: NextRequest) {
  let body: { sphereId?: string; message?: string; history?: Array<{ role: string; content: string }> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { sphereId, message, history = [] } = body;

  if (!sphereId || !message) {
    return NextResponse.json({ error: 'sphereId and message are required' }, { status: 400 });
  }

  const persona = SPHERE_PERSONAS[sphereId];
  if (!persona) {
    return NextResponse.json({ error: `Unknown sphere: ${sphereId}` }, { status: 400 });
  }

  // LRN: inject learned patterns into system prompt for self-improvement
  const memoryContext = await fetchSphereMemory(sphereId);

  // Build messages: system + conversation history + new user message
  const messages = [
    { role: 'system' as const, content: persona.systemPrompt + memoryContext },
    ...history.slice(-6).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: message },
  ];

  try {
    const result = await callLLM(messages, {
      sphereId: sphereId as SphereAgentId,
      maxTokens: 300,
      temperature: 0.82,
    });

    return NextResponse.json({
      sphereId,
      sphereName: persona.name,
      locale: persona.locale,
      response: result.content,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`[spheres/chat] ${sphereId} error:`, error);
    return NextResponse.json({ error: 'LLM call failed' }, { status: 500 });
  }
}
