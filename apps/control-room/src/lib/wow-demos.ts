/**
 * WOW Demo Configurations for Runway/Remotion
 * 3 signature demos showcasing ALEX™ capabilities
 * ZTE-20260311-0001: Permanent video skill wiring
 */

export interface WowDemoScene {
  duration: number; // seconds
  type: 'text' | 'animation' | 'voiceover' | 'transition';
  content: string;
  color?: string;
  speed?: 'slow' | 'normal' | 'fast';
}

export interface WowDemoConfig {
  id: string;
  title_es: string;
  title_en: string;
  description_es: string;
  description_en: string;
  duration: number; // total video length in seconds
  scenes: WowDemoScene[];
  voiceover_es: string;
  voiceover_en: string;
  cta_text: string;
  brand_color: string; // hex code
  template: 'whatsapp_demo' | 'content_calendar' | 'overnight_worker';
}

/**
 * DEMO 1: WhatsApp Auto-Reply
 * Shows a message arriving in real-time, ALEX™ analyzing it, and auto-reply being sent
 * Duration: 30 seconds
 */
export const DEMO_WHATSAPP_AUTO_REPLY: WowDemoConfig = {
  id: 'video_whatsapp_demo',
  title_es: 'Demo: Auto-Respuesta WhatsApp',
  title_en: 'Demo: WhatsApp Auto-Reply',
  description_es: 'ALEX™ lee, entiende y responde mensajes mientras tú duermes',
  description_en: 'ALEX™ reads, understands, and replies to messages while you sleep',
  duration: 30,
  template: 'whatsapp_demo',
  brand_color: '#f5d78c', // gold
  voiceover_es: `
    Imagina despertar con 47 leads nuevos, todos completamente calificados.
    ALEX™ trabajó toda la noche, leyendo cada mensaje de WhatsApp,
    entendiendo el contexto, y respondiendo con tu voz.
    No genérico. Tu voz.
  `,
  voiceover_en: `
    Imagine waking up with 47 new qualified leads.
    ALEX™ worked all night, reading every WhatsApp message,
    understanding context, and replying in your voice.
    Not generic. Your voice.
  `,
  cta_text: 'Activa ALEX™ hoy | Activate ALEX™ today',
  scenes: [
    {
      type: 'text',
      duration: 3,
      content: 'Miércoles, 8:43 PM | Wednesday, 8:43 PM',
      color: '#999',
    },
    {
      type: 'animation',
      duration: 4,
      content: 'WhatsApp message bubble arrives with "Hola, quiero info sobre tus servicios"',
      speed: 'normal',
    },
    {
      type: 'text',
      duration: 2,
      content: 'ALEX™ analyzing...',
      color: '#f5d78c',
    },
    {
      type: 'animation',
      duration: 3,
      content: 'Typing indicator, then auto-reply appears in founder\'s tone',
      speed: 'fast',
    },
    {
      type: 'text',
      duration: 2,
      content: '✅ Auto-reply sent in 2.3 seconds',
      color: '#90EE90',
    },
    {
      type: 'transition',
      duration: 2,
      content: 'Gold fade to ALEX™ logo',
      color: '#f5d78c',
    },
    {
      type: 'text',
      duration: 10,
      content: 'ALEX™ — Tu socio de negocios de IA\nYour 24/7 AI business partner',
      color: '#f5d78c',
    },
  ],
};

/**
 * DEMO 2: Content Calendar Generation
 * Shows ALEX™ filling a 30-day calendar with curated content in real-time (time-lapse)
 * Duration: 30 seconds
 */
export const DEMO_CONTENT_CALENDAR: WowDemoConfig = {
  id: 'video_content_calendar',
  title_es: 'Demo: Generador de Calendario de Contenido',
  title_en: 'Demo: Content Calendar Generator',
  description_es: 'ALEX™ genera 30 días de contenido listo para publicar en 3 minutos',
  description_en: 'ALEX™ generates 30 days of post-ready content in 3 minutes',
  duration: 30,
  template: 'content_calendar',
  brand_color: '#f5d78c',
  voiceover_es: `
    Un calendario vacío. Un click.
    ALEX™ llena los próximos 30 días con contenido que convierte.
    Instagram stories. TikTok scripts. LinkedIn posts.
    Todo alineado con tu marca. Todo listo.
    No hay más "no sé qué publicar hoy."
  `,
  voiceover_en: `
    An empty calendar. One click.
    ALEX™ fills the next 30 days with content that converts.
    Instagram stories. TikTok scripts. LinkedIn posts.
    All brand-aligned. All ready.
    No more "I don't know what to post today."
  `,
  cta_text: 'Crea tu primer calendario | Create your first calendar',
  scenes: [
    {
      type: 'text',
      duration: 2,
      content: 'Marzo 2026 | March 2026',
      color: '#f5d78c',
    },
    {
      type: 'animation',
      duration: 1,
      content: 'Empty 30-day grid appears',
      speed: 'fast',
    },
    {
      type: 'text',
      duration: 1,
      content: 'Generando contenido... | Generating content...',
      color: '#f5d78c',
    },
    {
      type: 'animation',
      duration: 12,
      content: 'Calendar cells fill rapidly with: Instagram icon, TikTok icon, LinkedIn icon (rotating)',
      speed: 'fast',
    },
    {
      type: 'animation',
      duration: 2,
      content: 'Sample post appears: "Descubre cómo ALEX™ ahorra 15 horas/semana"',
      speed: 'normal',
    },
    {
      type: 'text',
      duration: 3,
      content: '✅ 30 días completados\n✅ 30 days complete\nTiempo: 3 minutos | Time: 3 minutes',
      color: '#90EE90',
    },
    {
      type: 'animation',
      duration: 2,
      content: 'Slide swipe to next post preview',
      speed: 'fast',
    },
    {
      type: 'animation',
      duration: 2,
      content: 'Another post appears with different platform icon',
      speed: 'normal',
    },
    {
      type: 'transition',
      duration: 2,
      content: 'Zoom out to full calendar view',
      color: '#f5d78c',
    },
    {
      type: 'text',
      duration: 2,
      content: 'Listo para publicar | Ready to publish',
      color: '#90EE90',
    },
  ],
};

/**
 * DEMO 3: Overnight Worker (Time-Lapse)
 * Shows ALEX™ working through 12 tasks overnight while founder sleeps
 * Duration: 60 seconds
 */
export const DEMO_OVERNIGHT_WORKER: WowDemoConfig = {
  id: 'video_overnight_worker',
  title_es: 'Demo: El Trabajador de Noche',
  title_en: 'Demo: The Overnight Worker',
  description_es: 'Mientras tú duermes, ALEX™ completa 12 tareas de negocio críticas',
  description_en: 'While you sleep, ALEX™ completes 12 critical business tasks',
  duration: 60,
  template: 'overnight_worker',
  brand_color: '#f5d78c',
  voiceover_es: `
    Las 10 PM. Acabas de acostarte.
    ALEX™ acaba de empezar su turno.
    Primer: clasificar 147 leads según potencial.
    Segundo: redactar 12 propuestas de venta personalizadas.
    Tercero: generar reportes de ingresos del mes.
    Cuarto: programar reuniones óptimas.
    Y 8 tareas más.
    Mientras tú duermes, tu negocio crece.
  `,
  voiceover_en: `
    10 PM. You just went to bed.
    ALEX™ just started her shift.
    First: qualify 147 leads by potential.
    Second: draft 12 personalized sales proposals.
    Third: generate monthly revenue reports.
    Fourth: schedule optimal meetings.
    And 8 more tasks.
    While you sleep, your business grows.
  `,
  cta_text: 'Durmamos mientras ALEX™ trabaja | Sleep while ALEX™ works',
  scenes: [
    {
      type: 'text',
      duration: 3,
      content: '10:00 PM — Founder goes to bed\nALEX™ starts her shift',
      color: '#1a1208', // charcoal
    },
    {
      type: 'animation',
      duration: 2,
      content: 'ALEX™ avatar lights up on screen',
      speed: 'normal',
    },
    {
      type: 'text',
      duration: 3,
      content: 'Task 1: Lead Qualification\n📊 147 leads analyzed',
      color: '#f5d78c',
    },
    {
      type: 'animation',
      duration: 2,
      content: 'Leads sorting into buckets: Hot, Warm, Cold',
      speed: 'fast',
    },
    {
      type: 'text',
      duration: 3,
      content: 'Task 2: Sales Proposals\n✍️ 12 proposals drafted',
      color: '#f5d78c',
    },
    {
      type: 'animation',
      duration: 2,
      content: 'Proposal documents appearing with checkmarks',
      speed: 'fast',
    },
    {
      type: 'text',
      duration: 3,
      content: 'Task 3: Revenue Reports\n📈 March summary: +$47K',
      color: '#f5d78c',
    },
    {
      type: 'animation',
      duration: 2,
      content: 'Chart growing upward with gold accent',
      speed: 'fast',
    },
    {
      type: 'text',
      duration: 2,
      content: 'Task 4: Calendar Optimization\n⏰ 8 meetings scheduled',
      color: '#f5d78c',
    },
    {
      type: 'animation',
      duration: 2,
      content: 'Calendar fills with color-coded meetings',
      speed: 'fast',
    },
    {
      type: 'text',
      duration: 2,
      content: 'Task 5-12: ...',
      color: '#f5d78c',
    },
    {
      type: 'animation',
      duration: 3,
      content: 'Fast montage of tasks (email, content, invoices, etc)',
      speed: 'fast',
    },
    {
      type: 'text',
      duration: 3,
      content: '12 tasks completed\n⏱️ Overnight',
      color: '#90EE90',
    },
    {
      type: 'animation',
      duration: 2,
      content: 'Dashboard summary slides onto screen',
      speed: 'normal',
    },
    {
      type: 'text',
      duration: 6,
      content: '7:00 AM — Founder wakes up\nDashboard ready with overnight summary\n✅ All tasks complete\n📊 Ready for the day',
      color: '#f5d78c',
    },
    {
      type: 'text',
      duration: 3,
      content: 'ALEX™ — Tu socio que nunca duerme\nYour partner who never sleeps',
      color: '#f5d78c',
    },
  ],
};

/**
 * Export all demos as a map for easy access
 */
export const WOW_DEMOS: Record<string, WowDemoConfig> = {
  whatsapp_demo: DEMO_WHATSAPP_AUTO_REPLY,
  content_calendar: DEMO_CONTENT_CALENDAR,
  overnight_worker: DEMO_OVERNIGHT_WORKER,
};

/**
 * Helper: Get demo by ID
 */
export function getWowDemo(demoId: string): WowDemoConfig | null {
  return WOW_DEMOS[demoId] || null;
}

/**
 * Helper: List all demo IDs
 */
export function listWowDemos(): string[] {
  return Object.keys(WOW_DEMOS);
}
