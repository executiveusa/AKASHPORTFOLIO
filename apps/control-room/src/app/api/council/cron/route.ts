import { NextRequest, NextResponse } from 'next/server';

/**
 * Council Cron Endpoint — triggered by Vercel Cron or external scheduler
 * POST /api/council/cron
 *
 * Schedule (Mexico City / America/Mexico_City):
 *   Daily standup  — 09:00 Mon–Fri
 *   Weekly strategy — 10:00 Monday
 *   Monthly finance — 15:00 1st of month
 *
 * Add to vercel.json:
 *   "crons": [
 *     { "path": "/api/council/cron", "schedule": "0 15 * * 1-5" },
 *     { "path": "/api/council/cron", "schedule": "0 16 * * 1" },
 *     { "path": "/api/council/cron", "schedule": "0 21 1 * *" }
 *   ]
 * (UTC offsets for CST = UTC-6)
 */

const COUNCIL_MEMBERS = [
  { id: 'advisor-economic',  name: 'Dr. Economía',   role: 'Análisis financiero y arbitraje LATAM' },
  { id: 'advisor-cultural',  name: 'Dra. Cultura',   role: 'Estrategia de contenido y comunidad CDMX' },
  { id: 'advisor-tech',      name: 'Ing. Teknos',    role: 'Arquitectura de sistemas y automatización' },
  { id: 'advisor-social',    name: 'Lic. Social',    role: 'Relaciones freelance y clientes' },
  { id: 'alex-chief',        name: 'ALEX™',          role: 'Chief of Staff — Coordinadora General' },
];

type MeetingType = 'standup' | 'strategy' | 'finance';

function detectMeetingType(): MeetingType {
  const now = new Date();
  // Convert to Mexico City time
  const mxTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }));
  const day = mxTime.getDay(); // 0=Sun, 1=Mon
  const date = mxTime.getDate();

  if (date === 1) return 'finance';
  if (day === 1) return 'strategy';
  return 'standup';
}

function buildAgenda(type: MeetingType): string[] {
  const now = new Date().toLocaleDateString('es-MX', {
    timeZone: 'America/Mexico_City',
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const agendas: Record<MeetingType, string[]> = {
    standup: [
      `Sesión: Daily Standup — ${now}`,
      '1. ¿Qué completamos ayer?',
      '2. ¿Qué haremos hoy?',
      '3. ¿Hay bloqueos?',
      '4. Revisión de oportunidades freelance activas',
      '5. Alertas de arbitraje de divisas',
    ],
    strategy: [
      `Sesión: Revisión Estratégica Semanal — ${now}`,
      '1. Progreso hacia metas de ingresos semanales',
      '2. Pipeline de clientes: propuestas enviadas y respuestas',
      '3. Contenido de blog y SEO — publicaciones programadas',
      '4. Revisión de automatizaciones activas',
      '5. Prioridades para la próxima semana',
      '6. Decisiones que requieren aprobación de Ivette',
    ],
    finance: [
      `Sesión: Revisión Financiera Mensual — ${now}`,
      '1. Ingresos del mes (Stripe + PayPal + Crypto)',
      '2. Pagos pendientes y cobranza',
      '3. Revisión de arbitraje de divisas del mes',
      '4. Costos de APIs y servicios (ElevenLabs, Anthropic, etc.)',
      '5. Meta del próximo mes',
      '6. Distribución de ingresos a cuenta de Ivette',
    ],
  };

  return agendas[type];
}

export async function POST(req: NextRequest) {
  // Verify this is coming from our scheduler (basic shared secret)
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const type = detectMeetingType();
  const agenda = buildAgenda(type);
  const meetingId = `council-cron-${type}-${Date.now()}`;

  const meeting = {
    id: meetingId,
    type,
    topic: agenda[0],
    agenda,
    participants: COUNCIL_MEMBERS,
    status: 'live',
    createdAt: new Date().toISOString(),
    scheduledBy: 'cron',
  };

  // Persist via council POST route internally
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    await fetch(`${baseUrl}/api/council`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: meeting.topic,
        participants: COUNCIL_MEMBERS.map((m) => m.id),
        context: { type, agenda, scheduledBy: 'cron' },
      }),
    });
  } catch {
    // Non-critical — meeting record is returned regardless
  }

  // Notify ALEX™ via agent-mail
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    await fetch(`${baseUrl}/api/agent-mail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'alex-chief',
        from: 'cron-scheduler',
        subject: `[CONVOCATORIA] ${agenda[0]}`,
        body: agenda.join('\n'),
        meetingId,
      }),
    });
  } catch {
    // Non-critical
  }

  return NextResponse.json({ success: true, meeting });
}

// GET: Next scheduled meeting info
export async function GET() {
  const now = new Date();
  const mxNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }));

  const schedules = [
    { label: 'Daily Standup (Lun–Vie)', cron: '09:00 CST', next: nextWeekday(mxNow, 9) },
    { label: 'Estrategia Semanal (Lunes)', cron: '10:00 CST Monday', next: nextMonday(mxNow, 10) },
    { label: 'Revisión Financiera (1ro de mes)', cron: '15:00 CST 1st', next: nextFirst(mxNow, 15) },
  ];

  return NextResponse.json({ schedules, currentTime: mxNow.toISOString() });
}

function nextWeekday(from: Date, hour: number): string {
  const d = new Date(from);
  d.setHours(hour, 0, 0, 0);
  if (d <= from || d.getDay() === 0 || d.getDay() === 6) {
    do { d.setDate(d.getDate() + 1); } while (d.getDay() === 0 || d.getDay() === 6);
    d.setHours(hour, 0, 0, 0);
  }
  return d.toISOString();
}

function nextMonday(from: Date, hour: number): string {
  const d = new Date(from);
  const daysUntil = (1 - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + daysUntil);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function nextFirst(from: Date, hour: number): string {
  const d = new Date(from);
  d.setDate(1);
  d.setHours(hour, 0, 0, 0);
  if (d <= from) {
    d.setMonth(d.getMonth() + 1);
    d.setDate(1);
    d.setHours(hour, 0, 0, 0);
  }
  return d.toISOString();
}
