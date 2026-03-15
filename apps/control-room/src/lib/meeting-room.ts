/**
 * Meeting Room — KUPURI MEDIA™
 *
 * 3x daily scheduled meetings with Synthia 3.0's agent team.
 * Ivette can watch live (SSE stream) or replay from storage.
 * All meetings are recorded as structured transcripts.
 */

import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';
import { agentMail } from './agent-mail';
import { callMiniMax } from './minimax';
import { synthiaObservability } from './observability';

export type MeetingType = 'morning_standup' | 'midday_pulse' | 'evening_wrap';
export type MeetingStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';

export interface MeetingTurn {
  agent: string;
  role: string;
  message: string;
  timestamp: string;
  type: 'opening' | 'update' | 'decision' | 'action_item' | 'closing' | 'alert';
}

export interface Meeting {
  id: string;
  type: MeetingType;
  title: string;
  scheduledAt: string;   // ISO datetime in CDMX time (UTC-6)
  startedAt?: string;
  completedAt?: string;
  status: MeetingStatus;
  transcript: MeetingTurn[];
  summary?: string;
  actionItems: { owner: string; task: string; eta: string }[];
  keyDecisions: string[];
  kpis?: Record<string, string | number>;
  duration?: number;     // seconds
}

const MEETINGS_STORE_PATH = path.join(process.cwd(), '.meetings-store');
const meetings: Map<string, Meeting> = new Map();

export const meetingEmitter = new EventEmitter();

function ensureStorePath() {
  if (!fs.existsSync(MEETINGS_STORE_PATH)) {
    fs.mkdirSync(MEETINGS_STORE_PATH, { recursive: true });
  }
}

function saveMeeting(meeting: Meeting) {
  ensureStorePath();
  const filePath = path.join(MEETINGS_STORE_PATH, `${meeting.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(meeting, null, 2));
  meetings.set(meeting.id, meeting);
}

function loadMeetings() {
  ensureStorePath();
  const files = fs.readdirSync(MEETINGS_STORE_PATH).filter(f => f.endsWith('.json'));
  for (const file of files) {
    try {
      const meeting: Meeting = JSON.parse(
        fs.readFileSync(path.join(MEETINGS_STORE_PATH, file), 'utf-8')
      );
      meetings.set(meeting.id, meeting);
    } catch {
      // Skip corrupted files
    }
  }
}

loadMeetings();

const MEETING_CONFIGS: Record<MeetingType, {
  title: string;
  hour: number; // CDMX hour (UTC-6)
  agenda: string;
  participants: string[];
}> = {
  morning_standup: {
    title: '☀️ Morning Standup — KUPURI MEDIA',
    hour: 9,
    agenda: 'Revisión de logros de ayer, prioridades de hoy, y bloqueos actuales.',
    participants: ['synthia-prime', 'morpho', 'indigo', 'clandestino', 'lapina', 'merlina'],
  },
  midday_pulse: {
    title: '⚡ Midday Pulse Check — KUPURI MEDIA',
    hour: 13,
    agenda: 'Revisión de KPIs en tiempo real, decisiones urgentes, ajustes tácticos.',
    participants: ['synthia-prime', 'morpho', 'ralphy'],
  },
  evening_wrap: {
    title: '🌙 Evening Wrap-Up — KUPURI MEDIA',
    hour: 17,
    agenda: 'Resumen del día, pendientes, y resumen ejecutivo para Ivette.',
    participants: ['synthia-prime', 'morpho', 'indigo', 'clandestino', 'lapina', 'merlina', 'ralphy'],
  },
};

const AGENT_ROLES: Record<string, string> = {
  'synthia-prime': 'CEO Digital (Moderadora)',
  'ralphy': 'Coach Técnico',
  'indigo': 'Growth & Marketing',
  'lapina': 'Content & Social Media',
  'clandestino': 'Sales & BD',
  'merlina': 'Directora Creativa',
  'morpho': 'Analytics & Data',
  'ivette-voice': 'Voz de la Fundadora',
};

/**
 * Generate a meeting turn for an agent using MiniMax.
 */
async function generateAgentTurn(
  agent: string,
  meetingType: MeetingType,
  agenda: string,
  previousTurns: MeetingTurn[],
  turnType: MeetingTurn['type']
): Promise<MeetingTurn> {
  const context = previousTurns.length > 0
    ? `\n\nConversación hasta ahora:\n${previousTurns.map(t =>
        `${t.agent}: ${t.message}`
      ).join('\n')}`
    : '';

  const agentFile = path.join(process.cwd(), 'apps/control-room/agents', `${agent}.md`);
  let agentContext = '';
  if (fs.existsSync(agentFile)) {
    const content = fs.readFileSync(agentFile, 'utf-8');
    // Extract just the first ~500 chars of identity context
    const lines = content.split('\n').slice(0, 30).join('\n');
    agentContext = `\n\nTu definición de agente:\n${lines}`;
  }

  const prompt = `Eres ${agent} (${AGENT_ROLES[agent] || 'Agente'}) de KUPURI MEDIA™.${agentContext}

Estás en una reunión de tipo ${meetingType} con la agenda: ${agenda}
${context}

Tipo de turno que debes dar: ${turnType}

Instrucciones:
- Habla en español de CDMX, profesional pero con carácter
- Sé específico y basado en datos cuando puedas
- Si das una actualización, menciona: estado actual, progreso, y cualquier bloqueador
- Si propones una acción, incluye quién, qué, y cuándo
- Mantén tu respuesta en ≤4 oraciones — las reuniones son eficientes
- Si eres Synthia (moderadora), guía la conversación hacia decisiones y acciones

Responde SOLO con tu mensaje de reunión (sin JSON, sin formato especial):`;

  try {
    const response = await callMiniMax([{ role: 'user', content: prompt }]);
    return {
      agent,
      role: AGENT_ROLES[agent] || 'Agente',
      message: response.trim(),
      timestamp: new Date().toISOString(),
      type: turnType,
    };
  } catch {
    return {
      agent,
      role: AGENT_ROLES[agent] || 'Agente',
      message: `[${agent}] Sistema de reuniones activo. Reporte pendiente.`,
      timestamp: new Date().toISOString(),
      type: turnType,
    };
  }
}

/**
 * Run a full meeting and return the completed meeting object.
 * This streams turns in real-time via the meetingEmitter.
 */
export async function runMeeting(type: MeetingType): Promise<Meeting> {
  const config = MEETING_CONFIGS[type];
  const id = `meeting-${type}-${Date.now()}`;

  const meeting: Meeting = {
    id,
    type,
    title: config.title,
    scheduledAt: new Date().toISOString(),
    startedAt: new Date().toISOString(),
    status: 'live',
    transcript: [],
    actionItems: [],
    keyDecisions: [],
  };

  saveMeeting(meeting);
  meetingEmitter.emit('meeting:start', meeting);

  synthiaObservability.logEvent({
    type: 'info',
    summary: `Reunión iniciada: ${config.title}`,
    data: { meetingId: id, type },
  });

  // Broadcast meeting start via agent mail
  agentMail.broadcast(
    'synthia-prime',
    `🔔 Reunión comenzando: ${config.title}`,
    `La reunión ${config.title} está comenzando ahora. Ivette puede verla en vivo en el Control Room.`,
    'broadcast'
  );

  // === OPENING (Synthia moderates) ===
  const openingTurn = await generateAgentTurn(
    'synthia-prime',
    type,
    config.agenda,
    [],
    'opening'
  );
  meeting.transcript.push(openingTurn);
  meetingEmitter.emit('meeting:turn', { meetingId: id, turn: openingTurn });
  saveMeeting(meeting);

  // === AGENT UPDATES ===
  for (const participant of config.participants.filter(p => p !== 'synthia-prime')) {
    const turnType = type === 'morning_standup' ? 'update' :
                     type === 'midday_pulse' ? 'update' : 'update';
    const turn = await generateAgentTurn(participant, type, config.agenda, meeting.transcript, turnType);
    meeting.transcript.push(turn);
    meetingEmitter.emit('meeting:turn', { meetingId: id, turn });
    saveMeeting(meeting);
    await new Promise(resolve => setTimeout(resolve, 800)); // Natural pacing
  }

  // === DECISIONS / ACTION ITEMS (Synthia synthesizes) ===
  const decisionTurn = await generateAgentTurn(
    'synthia-prime',
    type,
    `Sintetiza los updates y confirma las acciones más importantes del equipo.`,
    meeting.transcript,
    'action_item'
  );
  meeting.transcript.push(decisionTurn);
  meetingEmitter.emit('meeting:turn', { meetingId: id, turn: decisionTurn });
  saveMeeting(meeting);

  // === RALPHY COACHING MOMENT (evening only) ===
  if (type === 'evening_wrap') {
    const ralphyTurn = await generateAgentTurn(
      'ralphy',
      type,
      'Da retroalimentación breve sobre la calidad del trabajo de hoy. ¿Qué mejoró? ¿Qué necesita atención?',
      meeting.transcript,
      'decision'
    );
    meeting.transcript.push(ralphyTurn);
    meetingEmitter.emit('meeting:turn', { meetingId: id, turn: ralphyTurn });
    saveMeeting(meeting);
  }

  // === CLOSING (Synthia) ===
  const closingTurn = await generateAgentTurn(
    'synthia-prime',
    type,
    `Cierra la reunión con un resumen de 2-3 puntos para Ivette. Sé específica y orientada a acción.`,
    meeting.transcript,
    'closing'
  );
  meeting.transcript.push(closingTurn);
  meetingEmitter.emit('meeting:turn', { meetingId: id, turn: closingTurn });

  // Generate summary for Ivette
  const summaryTurns = meeting.transcript
    .filter(t => t.type === 'action_item' || t.type === 'closing' || t.type === 'decision')
    .map(t => `${t.agent}: ${t.message}`)
    .join('\n');

  meeting.summary = summaryTurns.length > 0
    ? `Resumen ${config.title}\n\n${summaryTurns}`
    : `Reunión ${config.title} completada con ${meeting.transcript.length} participaciones.`;

  meeting.status = 'completed';
  meeting.completedAt = new Date().toISOString();

  const startMs = new Date(meeting.startedAt!).getTime();
  meeting.duration = Math.round((new Date().getTime() - startMs) / 1000);

  saveMeeting(meeting);
  meetingEmitter.emit('meeting:complete', meeting);

  // Send summary to Ivette via mail
  agentMail.send({
    from: 'synthia-prime',
    to: ['ivette'],
    cc: [],
    subject: `📋 Resumen: ${config.title}`,
    body: meeting.summary,
    type: 'report',
    priority: 'normal',
    metadata: { meetingId: id },
  });

  synthiaObservability.logEvent({
    type: 'success',
    summary: `Reunión completada: ${config.title} (${meeting.duration}s)`,
    data: { meetingId: id, turns: meeting.transcript.length },
  });

  return meeting;
}

/**
 * Get all meetings, sorted by most recent.
 */
export function getMeetings(limit = 30): Meeting[] {
  return Array.from(meetings.values())
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
    .slice(0, limit);
}

/**
 * Get a specific meeting by ID.
 */
export function getMeeting(id: string): Meeting | undefined {
  return meetings.get(id);
}

/**
 * Get today's meetings.
 */
export function getTodaysMeetings(): Meeting[] {
  const today = new Date().toISOString().split('T')[0];
  return Array.from(meetings.values())
    .filter(m => m.scheduledAt.startsWith(today))
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
}

/**
 * Schedule next meeting occurrence for a type.
 */
export function getNextMeetingTime(type: MeetingType): Date {
  const config = MEETING_CONFIGS[type];
  const now = new Date();
  // CDMX is UTC-6
  const cdmxOffset = -6 * 60;
  const utcOffset = now.getTimezoneOffset();
  const localToCdmx = (cdmxOffset - (-utcOffset)) * 60 * 1000;

  const cdmxNow = new Date(now.getTime() + localToCdmx);
  const next = new Date(cdmxNow);
  next.setHours(config.hour, 0, 0, 0);

  if (next <= cdmxNow) {
    next.setDate(next.getDate() + 1);
  }

  return new Date(next.getTime() - localToCdmx);
}
