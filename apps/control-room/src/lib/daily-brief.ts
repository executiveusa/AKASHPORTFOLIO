/**
 * Daily Brief Generator
 * Generates executive briefing for ALEX™ users at 8am CDMX
 * Combines: Google Trends + Calendar + Messages + AI Recommendation
 */

import Anthropic from '@anthropic-ai/sdk';

export interface BriefData {
  userName: string;
  businessName: string;
  industry: string;
  date: Date;
  language: 'es' | 'en';
  googleTrends?: Array<{
    search: string;
    volume: number;
    trend: 'up' | 'steady' | 'down';
    changePercent?: number;
  }>;
  calendarEvents?: Array<{
    title: string;
    time: string;
    duration: number;
  }>;
  pendingMessages?: number;
  newLeads?: number;
  completedTasks?: number;
  revenue?: number;
}

export interface DailyBrief {
  greeting: string;
  trending: string;
  metrics: string;
  schedule: string;
  recommendation: string;
  cta: string;
  fullBrief: string;
}

const anthropic = new Anthropic();

const DAILY_BRIEF_PROMPT_ES = `Eres ALEX™, asistente de negocio de una empresaria latina.
Genera un briefing ejecutivo matutino personalizado.

CONTEXTO:
- Nombre: {userName}
- Negocio: {businessName}
- Industria: {industry}
- Fecha: {date}

DATOS:
- Google Trends: {googleTrends}
- Calendario hoy: {calendarEvents}
- WhatsApps pendientes: {pendingMessages}
- Leads nuevos: {newLeads}
- Tareas completadas ayer: {completedTasks}
- Ingresos ayer: {revenue}

Genera un briefing en este formato EXACTO (todo en ESPAÑOL):

📊 Buenos días, {userName}! Tu Briefing Ejecutivo de hoy:

🔥 TRENDING AHORA EN MÉXICO (que te importa):
• #{trend1} — subiendo {pct1}% — Insight: {1 frase sobre oportunidad}
• #{trend2} — en tu industria — Insight: {1 frase}

📱 TUS NÚMEROS HOY:
• {pendingMessages} WhatsApps nuevos
• {newLeads} leads desde tu landing
• {completedTasks} tareas completadas ayer ✓
• Ingresos ayer: {revenue}

📅 TU AGENDA:
{Primera 3 citas del día con horarios - si no hay, pon "Día abierto para crear"}

💡 RECOMENDACIÓN DE ALEX™:
{1 frase específica accionable basada en trends + agenda}

¿Por dónde empezamos hoy?`;

const DAILY_BRIEF_PROMPT_EN = `You are ALEX™, business assistant for a Latin American entrepreneur.
Generate a personalized morning executive briefing.

CONTEXT:
- Name: {userName}
- Business: {businessName}
- Industry: {industry}
- Date: {date}

DATA:
- Google Trends: {googleTrends}
- Calendar today: {calendarEvents}
- Pending messages: {pendingMessages}
- New leads: {newLeads}
- Tasks completed yesterday: {completedTasks}
- Revenue yesterday: {revenue}

Generate a brief in this EXACT format:

📊 Good morning, {userName}! Your Executive Brief for today:

🔥 TRENDING NOW IN MEXICO:
• #{trend1} — up {pct1}% — Insight: {1 sentence on opportunity}
• #{trend2} — in your industry — Insight: {1 sentence}

📱 YOUR NUMBERS TODAY:
• {pendingMessages} new WhatsApps
• {newLeads} leads from landing
• {completedTasks} tasks completed yesterday ✓
• Revenue yesterday: {revenue}

📅 YOUR SCHEDULE:
{First 3 appointments with times - if none, put "Open day to create"}

💡 ALEX™ RECOMMENDATION:
{1 specific actionable sentence based on trends + schedule}

Where should we start today?`;

/**
 * Generate a personalized daily brief
 */
export async function generateDailyBrief(data: BriefData): Promise<DailyBrief> {
  try {
    // Format trends
    const trendsText = data.googleTrends
      ?.map((t) => `${t.search} (${t.volume} searches, ${t.trend})`)
      .join(', ') || 'No trending data';

    // Format calendar
    const calendarText =
      data.calendarEvents && data.calendarEvents.length > 0
        ? data.calendarEvents
            .slice(0, 3)
            .map((e) => `${e.time}: ${e.title} (${e.duration}m)`)
            .join('\n')
        : 'No events scheduled';

    // Select prompt based on language
    const systemPrompt =
      data.language === 'es' ? DAILY_BRIEF_PROMPT_ES : DAILY_BRIEF_PROMPT_EN;

    const filledPrompt = systemPrompt
      .replace('{userName}', data.userName)
      .replace('{businessName}', data.businessName)
      .replace('{industry}', data.industry)
      .replace('{date}', data.date.toLocaleDateString('es-MX'))
      .replace('{googleTrends}', trendsText)
      .replace('{calendarEvents}', calendarText)
      .replace('{pendingMessages}', String(data.pendingMessages || 0))
      .replace('{newLeads}', String(data.newLeads || 0))
      .replace('{completedTasks}', String(data.completedTasks || 0))
      .replace('{revenue}', String(data.revenue || 0));

    // Call Claude to generate brief
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 512,
      system: filledPrompt,
      messages: [
        {
          role: 'user',
          content:
            data.language === 'es'
              ? 'Genera el briefing ejecutivo ahora.'
              : 'Generate the executive brief now.',
        },
      ],
    });

    const fullBrief =
      response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse brief into sections
    const sections = parseBrief(fullBrief);

    return {
      greeting: sections.greeting,
      trending: sections.trending,
      metrics: sections.metrics,
      schedule: sections.schedule,
      recommendation: sections.recommendation,
      cta: sections.cta,
      fullBrief,
    };
  } catch (error) {
    console.error('Error generating daily brief:', error);
    throw error;
  }
}

/**
 * Parse brief into sections for dashboard display
 */
function parseBrief(fullBrief: string) {
  const lines = fullBrief.split('\n');
  let greeting = '';
  let trending = '';
  let metrics = '';
  let schedule = '';
  let recommendation = '';
  let cta = '';

  let currentSection = '';

  for (const line of lines) {
    if (line.includes('Buenos días') || line.includes('Good morning')) {
      greeting = line.trim();
      currentSection = 'greeting';
    } else if (line.includes('🔥')) {
      currentSection = 'trending';
      trending += line + '\n';
    } else if (line.includes('📱')) {
      currentSection = 'metrics';
      metrics += line + '\n';
    } else if (line.includes('📅')) {
      currentSection = 'schedule';
      schedule += line + '\n';
    } else if (line.includes('💡')) {
      currentSection = 'recommendation';
      recommendation += line + '\n';
    } else if (line.includes('¿Por dónde') || line.includes('Where should')) {
      cta = line.trim();
    } else if (currentSection && line.trim()) {
      if (currentSection === 'trending') trending += line + '\n';
      else if (currentSection === 'metrics') metrics += line + '\n';
      else if (currentSection === 'schedule') schedule += line + '\n';
      else if (currentSection === 'recommendation') recommendation += line + '\n';
    }
  }

  return {
    greeting,
    trending: trending.trim(),
    metrics: metrics.trim(),
    schedule: schedule.trim(),
    recommendation: recommendation.trim(),
    cta,
  };
}

/**
 * Format brief for WhatsApp delivery
 */
export function formatBriefForWhatsApp(brief: DailyBrief): string {
  return `${brief.greeting}\n\n${brief.trending}\n\n${brief.metrics}\n\n${brief.schedule}\n\n${brief.recommendation}\n\n${brief.cta}`;
}

/**
 * Check if briefing time (8am CDMX) has arrived
 */
export function isBriefingTime(): boolean {
  const cdmxTime = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'America/Mexico_City' })
  );
  const hour = cdmxTime.getHours();
  const minute = cdmxTime.getMinutes();

  // Return true if between 8:00 and 8:05 AM
  return hour === 8 && minute <= 5;
}
