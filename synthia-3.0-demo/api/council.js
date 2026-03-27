/**
 * POST /api/council
 * Synthia 3.0 — Multi-Agent LLM Council
 * Streams a multi-turn deliberation between 5 AI agents powered by Claude.
 *
 * Body: { topic: string, lang?: "es"|"en", context?: string }
 * Response: Server-Sent Events  →  { agent, text, done }
 */

export const config = { runtime: 'edge' };

const AGENTS = [
  {
    id: 'synthia-prime',
    name: 'Synthia Prime',
    nameEs: 'Synthia Prime',
    role: 'Chief-of-Staff & Orchestrator',
    roleEs: 'Jefa de Gabinete & Orquestadora',
    color: '#d4af37',
    voiceId: 'pNInz6obpgDQGcFmaJgB',
    personality: `You are Synthia Prime, the lead AI orchestrator for Kupuri Media™.
You speak with authority, warmth, and cultural pride rooted in Santa María la Ribera, CDMX.
You open every council meeting, set the agenda, and synthesize the final decision.
Be crisp: 2-3 sentences max per turn.`,
    personalityEs: `Eres Synthia Prime, orquestadora principal de Kupuri Media™.
Hablas con autoridad, calidez y orgullo cultural de Santa María la Ribera, CDMX.
Abres cada reunión del consejo, fijas la agenda y sintetizas la decisión final.
Sé concisa: máximo 2-3 oraciones por turno.`,
  },
  {
    id: 'agent-marketing',
    name: 'Agent-Marketing',
    nameEs: 'Agente-Marketing',
    role: 'Growth & Brand Strategist',
    roleEs: 'Estratega de Crecimiento y Marca',
    color: '#ff6b9d',
    voiceId: 'EXAVITQu4vr4xnSDxMaL',
    personality: `You are Agent-Marketing, the growth and brand strategist.
You think in campaigns, funnels, and community. You love TikTok, WhatsApp virality, and LATAM cultural nuance.
Lead with metrics and creative ideas. 2-3 sentences max.`,
    personalityEs: `Eres Agente-Marketing, estratega de crecimiento y marca.
Piensas en campañas, embudos y comunidad. Te encanta TikTok, la viralidad en WhatsApp y el matiz cultural LATAM.
Lidera con métricas e ideas creativas. Máximo 2-3 oraciones.`,
  },
  {
    id: 'agent-coder',
    name: 'Agent-Coder',
    nameEs: 'Agente-Coder',
    role: 'Systems Architect & Builder',
    roleEs: 'Arquitecto de Sistemas & Constructor',
    color: '#00c9ff',
    voiceId: 'VR6AewLTigWG4xSOukaG',
    personality: `You are Agent-Coder, the systems architect.
You think in APIs, edge functions, and shipping velocity. You favor pragmatic solutions over perfect ones.
Give technical opinions with confidence. 2-3 sentences max.`,
    personalityEs: `Eres Agente-Coder, el arquitecto de sistemas.
Piensas en APIs, edge functions y velocidad de entrega. Prefieres soluciones pragmáticas sobre perfectas.
Da opiniones técnicas con confianza. Máximo 2-3 oraciones.`,
  },
  {
    id: 'agent-sales',
    name: 'Agent-Sales',
    nameEs: 'Agente-Ventas',
    role: 'Revenue & Partnerships Lead',
    roleEs: 'Líder de Ingresos y Alianzas',
    color: '#7fff7f',
    voiceId: 'ErXwobaYiN019PkySvjV',
    personality: `You are Agent-Sales, the revenue and partnerships lead.
You think in deals, objections, and closing. You spot monetization angles nobody else sees.
Be persuasive and direct. 2-3 sentences max.`,
    personalityEs: `Eres Agente-Ventas, el líder de ingresos y alianzas.
Piensas en tratos, objeciones y cierres. Detectas ángulos de monetización que nadie más ve.
Sé persuasivo y directo. Máximo 2-3 oraciones.`,
  },
  {
    id: 'agent-legal',
    name: 'Agent-Legal',
    nameEs: 'Agente-Legal',
    role: 'Compliance & Risk Counsel',
    roleEs: 'Consejero de Cumplimiento y Riesgo',
    color: '#c084fc',
    voiceId: 'MF3mGyEYCl7XYWbV9V6O',
    personality: `You are Agent-Legal, the compliance and risk counsel.
You think in contracts, risk vectors, and protective clauses. You flag concerns with solutions, not just warnings.
Be measured and precise. 2-3 sentences max.`,
    personalityEs: `Eres Agente-Legal, el consejero de cumplimiento y riesgo.
Piensas en contratos, vectores de riesgo y cláusulas protectoras. Señalas problemas con soluciones, no solo advertencias.
Sé medido y preciso. Máximo 2-3 oraciones.`,
  },
];

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { topic, lang = 'en', context = '' } = body;

  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    return new Response(JSON.stringify({ error: 'topic required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const isEs = lang === 'es';

  // Build the SSE stream
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // Each agent speaks once in sequence, then Synthia Prime closes
        const councilHistory = [];

        for (let i = 0; i < AGENTS.length; i++) {
          const agent = AGENTS[i];
          const isLast = i === AGENTS.length - 1;

          const systemPrompt = isEs
            ? `${agent.personalityEs}\n\nContexto del consejo: el tema es "${topic}". ${context ? `Contexto adicional: ${context}` : ''}\n\nOtros agentes ya han hablado: ${councilHistory.map((h) => `${h.agent}: "${h.text}"`).join('. ') || 'Eres el primero en hablar.'}\n\n${isLast ? 'Como Synthia Prime, cierra la deliberación con una decisión clara y los siguientes pasos concretos.' : 'Da tu perspectiva sobre el tema.'}`
            : `${agent.personality}\n\nCouncil context: topic is "${topic}". ${context ? `Additional context: ${context}` : ''}\n\nOther agents have spoken: ${councilHistory.map((h) => `${h.agent}: "${h.text}"`).join('. ') || 'You are speaking first.'}\n\n${isLast ? 'As Synthia Prime, close the deliberation with a clear decision and concrete next steps.' : 'Give your perspective on the topic.'}`;

          const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              model: 'claude-sonnet-4-6',
              max_tokens: 256,
              system: systemPrompt,
              messages: [
                {
                  role: 'user',
                  content: isEs
                    ? `El consejo se ha convocado. Tema: ${topic}. Habla ahora.`
                    : `The council has been convened. Topic: ${topic}. Speak now.`,
                },
              ],
            }),
          });

          if (!claudeRes.ok) {
            const errText = await claudeRes.text();
            send({ error: `Claude error for ${agent.id}: ${errText}` });
            continue;
          }

          const claudeData = await claudeRes.json();
          const text = claudeData.content?.[0]?.text ?? '';

          if (text) {
            councilHistory.push({ agent: isEs ? agent.nameEs : agent.name, text });
            send({
              agent: isEs ? agent.nameEs : agent.name,
              agentId: agent.id,
              color: agent.color,
              voiceId: agent.voiceId,
              text,
              role: isEs ? agent.roleEs : agent.role,
              done: false,
            });
          }
        }

        // Signal completion
        send({ done: true, summary: councilHistory });
      } catch (err) {
        send({ error: err.message || 'Council failed' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
