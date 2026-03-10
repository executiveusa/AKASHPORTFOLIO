/**
 * Ralphy Coach API — KUPURI MEDIA™
 * POST /api/coach  → Submit content/code for Ralphy's Lightning review
 * GET  /api/coach  → Get coaching history for an agent
 */
import { NextRequest, NextResponse } from 'next/server';
import { callMiniMax } from '../../../lib/minimax';
import { synthiaSwarm } from '../../../lib/swarm';
import { synthiaObservability } from '../../../lib/observability';
import { agentMail } from '../../../lib/agent-mail';
import * as fs from 'fs';
import * as path from 'path';

const coachingHistory: Array<{
  id: string;
  agentId: string;
  content: string;
  contentType: string;
  report: string;
  score: string;
  timestamp: string;
}> = [];

export async function POST(req: NextRequest) {
  try {
    const { agentId, content, contentType, context } = await req.json();

    if (!agentId || !content) {
      return NextResponse.json({ error: 'Se requieren: agentId, content' }, { status: 400 });
    }

    // Load Ralphy's agent definition for coaching context
    const ralphyPath = path.join(process.cwd(), 'apps/control-room/agents/ralphy.md');
    let ralphyContext = '';
    if (fs.existsSync(ralphyPath)) {
      ralphyContext = fs.readFileSync(ralphyPath, 'utf-8').slice(0, 2000);
    }

    const prompt = `${ralphyContext}

Eres Ralphy, el Microsoft Lightning Coach de KUPURI MEDIA™.

TAREA: Revisar el siguiente contenido del agente "${agentId}" y dar retroalimentación de calidad.

TIPO DE CONTENIDO: ${contentType || 'general'}
CONTEXTO: ${context || 'Revisión de calidad estándar'}

CONTENIDO A REVISAR:
---
${content}
---

Aplica el Microsoft Lightning Protocol:
1. SCAN completo
2. CLASSIFY: Básico / Bueno / Excelente
3. Identifica problemas por prioridad (crítico, medio, bajo)
4. Da evidencia específica de cada problema
5. Proporciona fix específico para cada problema
6. Reconoce lo que funcionó bien
7. Da plan de mejora en 2 semanas

Responde en JSON:
{
  "score": "BÁSICO|BUENO|EXCELENTE",
  "problems": [
    { "priority": "crítico|medio|bajo", "issue": "...", "evidence": "...", "fix": "..." }
  ],
  "strengths": ["..."],
  "improvementPlan": [
    { "week": 1, "action": "...", "metric": "..." },
    { "week": 2, "action": "...", "metric": "..." }
  ],
  "overallFeedback": "..."
}`;

    const response = await callMiniMax([{ role: 'user', content: prompt }]);
    const jsonMatch = response.match(/\{[\s\S]*\}/);

    let report: Record<string, unknown> = { score: 'BUENO', overallFeedback: response };
    if (jsonMatch) {
      try { report = JSON.parse(jsonMatch[0]); } catch { /* use raw */ }
    }

    const scoreMap: Record<string, number> = { 'EXCELENTE': 95, 'BUENO': 78, 'BÁSICO': 55 };
    const qualityScore = scoreMap[String(report.score || 'BUENO')] || 70;

    // Update agent quality score in swarm
    synthiaSwarm.updateQualityScore(agentId, qualityScore);

    const coachEntry = {
      id: `coach-${Date.now()}`,
      agentId,
      content: content.slice(0, 200) + '...',
      contentType: contentType || 'general',
      report: JSON.stringify(report),
      score: String(report.score || 'BUENO'),
      timestamp: new Date().toISOString(),
    };
    coachingHistory.unshift(coachEntry);
    if (coachingHistory.length > 200) coachingHistory.pop();

    // Send coaching report via agent mail
    agentMail.send({
      from: 'ralphy',
      to: [agentId],
      cc: ['synthia-prime'],
      subject: `⚡ [COACHING] Reporte Lightning — ${agentId} — ${report.score}`,
      body: `Score: **${report.score}**\n\n${report.overallFeedback}\n\nProblemas encontrados: ${(report.problems as Array<unknown>)?.length || 0}\nPlan de mejora adjunto.`,
      type: 'coaching',
      priority: qualityScore < 60 ? 'high' : 'normal',
    });

    synthiaObservability.logEvent({
      type: 'success',
      summary: `Coaching completado para ${agentId}: ${report.score}`,
      data: { agentId, score: report.score, qualityScore },
    });

    return NextResponse.json({ ...report, qualityScore, timestamp: coachEntry.timestamp });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get('agentId');
  const limit = parseInt(searchParams.get('limit') || '20');

  const history = agentId
    ? coachingHistory.filter(c => c.agentId === agentId).slice(0, limit)
    : coachingHistory.slice(0, limit);

  return NextResponse.json(history);
}
