/**
 * LLM Council — KUPURI MEDIA™
 *
 * Multi-LLM deliberation system for Synthia 3.0.
 * Council members vote and reason on strategic decisions before Synthia executes.
 * Prevents single-model bias and catches blind spots.
 */

import { synthiaObservability } from './observability';
import { callMiniMax } from './minimax';
import { agentMail } from './agent-mail';

export type CouncilMember = 'synthia' | 'perplexity' | 'minimax' | 'gemini' | 'devil-advocate';
export type VoteResult = 'approve' | 'reject' | 'modify' | 'abstain';

export interface CouncilVote {
  member: CouncilMember;
  vote: VoteResult;
  confidence: number;     // 0-100
  reasoning: string;
  suggestedModifications?: string;
  concerns?: string[];
  timestamp: string;
}

export interface CouncilSession {
  id: string;
  question: string;
  context: string;
  votes: CouncilVote[];
  synthesis: string;
  finalDecision: VoteResult;
  consensusScore: number; // 0-100
  timestamp: string;
  completedAt?: string;
  actionItems: string[];
}

export interface CouncilAgenda {
  question: string;
  context: string;
  options?: string[];
  urgency: 'immediate' | 'today' | 'this_week';
  requester: string;
}

const councilSessions: Map<string, CouncilSession> = new Map();

/**
 * Simulates a council member's perspective using MiniMax with different system prompts.
 * Each member has a unique analytical lens.
 */
async function getMemberVote(
  member: CouncilMember,
  question: string,
  context: string,
  otherVotes: CouncilVote[] = []
): Promise<CouncilVote> {
  const memberPrompts: Record<CouncilMember, string> = {
    synthia: `Eres Synthia Prime, CEO Digital de KUPURI MEDIA. Tu perspectiva es estratégica y orientada al negocio de Ivette. Piensas en impacto a largo plazo, riesgo para clientes, y crecimiento de la agencia. Eres directa y ejecutiva.`,

    perplexity: `Eres el módulo de investigación y contexto de mercado. Tu perspectiva está basada en datos del mercado, tendencias de la industria, y benchmarks externos. Citas evidencia específica cuando votas. Eres escéptico de suposiciones sin datos.`,

    minimax: `Eres el módulo técnico y de ejecución. Tu perspectiva es sobre factibilidad técnica, costo de implementación, tiempo requerido, y riesgos de ejecución. Piensas en cómo se implementa en la práctica, no solo en teoría.`,

    gemini: `Eres el módulo de perspectiva alternativa. Tu trabajo es ver lo que los demás no ven. Buscas supuestos cuestionables, consecuencias no intencionales, y perspectivas del usuario final. Eres constructivamente crítico.`,

    'devil-advocate': `Eres el abogado del diablo. Tu único trabajo es encontrar por qué esta decisión podría ser un error. Asumes el peor escenario plausible. Buscas lo que podría salir mal. No eres negativo por naturaleza — eres el mecanismo de defensa del equipo.`,
  };

  const votesContext = otherVotes.length > 0
    ? `\n\nVotos anteriores del consejo:\n${otherVotes.map(v =>
        `- ${v.member}: ${v.vote} (confianza: ${v.confidence}%) — ${v.reasoning}`
      ).join('\n')}\n\nConsidera estas perspectivas pero forma tu propio juicio independiente.`
    : '';

  const prompt = `${memberPrompts[member]}

PREGUNTA DEL CONSEJO:
${question}

CONTEXTO:
${context}
${votesContext}

Responde en este formato JSON exacto:
{
  "vote": "approve|reject|modify|abstain",
  "confidence": <número 0-100>,
  "reasoning": "<tu razonamiento en 2-3 oraciones>",
  "suggestedModifications": "<si vote=modify, qué cambiarías específicamente>",
  "concerns": ["<preocupación 1>", "<preocupación 2>"]
}`;

  try {
    const response = await callMiniMax([{ role: 'user', content: prompt }]);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        member,
        vote: parsed.vote || 'abstain',
        confidence: Math.min(100, Math.max(0, parsed.confidence || 50)),
        reasoning: parsed.reasoning || 'Sin razonamiento proporcionado',
        suggestedModifications: parsed.suggestedModifications,
        concerns: parsed.concerns || [],
        timestamp: new Date().toISOString(),
      };
    }
  } catch (err) {
    synthiaObservability.logEvent({
      type: 'error',
      summary: `Council vote failed for member: ${member}`,
      data: { error: String(err) },
    });
  }

  // Fallback vote
  return {
    member,
    vote: 'abstain',
    confidence: 0,
    reasoning: `No se pudo obtener voto de ${member}. Sistema en modo fallback.`,
    concerns: ['Sistema de votación no disponible'],
    timestamp: new Date().toISOString(),
  };
}

/**
 * Synthesize council votes into a final decision and summary.
 */
async function synthesizeVotes(
  question: string,
  votes: CouncilVote[]
): Promise<{ synthesis: string; finalDecision: VoteResult; consensusScore: number; actionItems: string[] }> {
  const votesSummary = votes.map(v =>
    `${v.member.toUpperCase()}: ${v.vote} (${v.confidence}% confianza)\n  Razón: ${v.reasoning}${v.concerns?.length ? `\n  Preocupaciones: ${v.concerns.join(', ')}` : ''}${v.suggestedModifications ? `\n  Modificaciones: ${v.suggestedModifications}` : ''}`
  ).join('\n\n');

  // Calculate consensus score
  const voteCounts = votes.reduce<Record<string, number>>((acc, v) => {
    acc[v.vote] = (acc[v.vote] || 0) + 1;
    return acc;
  }, {});
  const maxVote = Object.entries(voteCounts).sort(([, a], [, b]) => b - a)[0];
  const consensusScore = Math.round((maxVote[1] / votes.length) * 100);
  const finalDecision = maxVote[0] as VoteResult;

  const synthesisPrompt = `Eres Synthia Prime, CEO Digital de KUPURI MEDIA. El Consejo de LLMs ha votado sobre esta pregunta.

PREGUNTA: ${question}

VOTOS DEL CONSEJO:
${votesSummary}

RESULTADO: ${finalDecision.toUpperCase()} con ${consensusScore}% de consenso.

Escribe una síntesis ejecutiva de ≤150 palabras que:
1. Declare la decisión y el nivel de consenso
2. Resuma los argumentos principales a favor
3. Mencione las preocupaciones más importantes
4. Liste 2-3 acciones concretas a tomar

Responde en JSON:
{
  "synthesis": "<síntesis ejecutiva>",
  "actionItems": ["<acción 1>", "<acción 2>", "<acción 3>"]
}`;

  try {
    const response = await callMiniMax([{ role: 'user', content: synthesisPrompt }]);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        synthesis: parsed.synthesis || 'Síntesis no disponible',
        finalDecision,
        consensusScore,
        actionItems: parsed.actionItems || [],
      };
    }
  } catch {
    // Fallback synthesis
  }

  return {
    synthesis: `El Consejo votó ${finalDecision} con ${consensusScore}% de consenso. Ver votos individuales para detalles.`,
    finalDecision,
    consensusScore,
    actionItems: [],
  };
}

/**
 * Convene a council session on a question.
 * This is the main entry point for all council deliberations.
 */
export async function conveneCouncil(agenda: CouncilAgenda): Promise<CouncilSession> {
  const sessionId = `council-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  synthiaObservability.logEvent({
    type: 'info',
    summary: `Consejo de LLMs convocado: ${agenda.question.slice(0, 60)}...`,
    data: { sessionId, requester: agenda.requester },
  });

  const session: CouncilSession = {
    id: sessionId,
    question: agenda.question,
    context: agenda.context,
    votes: [],
    synthesis: '',
    finalDecision: 'abstain',
    consensusScore: 0,
    timestamp: new Date().toISOString(),
    actionItems: [],
  };

  councilSessions.set(sessionId, session);

  // Phase 1: Independent votes (no cross-influence)
  const phase1Members: CouncilMember[] = ['perplexity', 'minimax', 'gemini'];
  const phase1Votes = await Promise.all(
    phase1Members.map(member => getMemberVote(member, agenda.question, agenda.context))
  );

  // Phase 2: Synthia and Devil's Advocate vote WITH context of phase 1
  const phase2Votes = await Promise.all([
    getMemberVote('synthia', agenda.question, agenda.context, phase1Votes),
    getMemberVote('devil-advocate', agenda.question, agenda.context, phase1Votes),
  ]);

  session.votes = [...phase1Votes, ...phase2Votes];

  // Phase 3: Synthesis
  const { synthesis, finalDecision, consensusScore, actionItems } = await synthesizeVotes(
    agenda.question,
    session.votes
  );

  session.synthesis = synthesis;
  session.finalDecision = finalDecision;
  session.consensusScore = consensusScore;
  session.actionItems = actionItems;
  session.completedAt = new Date().toISOString();

  councilSessions.set(sessionId, session);

  // Notify via agent mail
  agentMail.send({
    from: 'council',
    to: ['synthia-prime'],
    cc: [],
    subject: `[CONSEJO] Decisión: ${agenda.question.slice(0, 60)}...`,
    body: `**Resultado del Consejo de LLMs**\n\nDecisión: **${finalDecision.toUpperCase()}** (${consensusScore}% consenso)\n\n${synthesis}\n\n**Acciones a tomar:**\n${actionItems.map((a, i) => `${i + 1}. ${a}`).join('\n')}`,
    type: 'council_vote',
    priority: agenda.urgency === 'immediate' ? 'urgent' : 'high',
    metadata: { taskId: sessionId },
  });

  synthiaObservability.logEvent({
    type: 'success',
    summary: `Consejo completado: ${finalDecision.toUpperCase()} (${consensusScore}% consenso)`,
    data: { sessionId, finalDecision, consensusScore },
  });

  return session;
}

/**
 * Get all council sessions (for UI display).
 */
export function getCouncilSessions(limit = 20): CouncilSession[] {
  return Array.from(councilSessions.values())
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

/**
 * Get a specific council session.
 */
export function getCouncilSession(sessionId: string): CouncilSession | undefined {
  return councilSessions.get(sessionId);
}
