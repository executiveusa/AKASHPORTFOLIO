/**
 * ALEX™ Skills Registry
 * 50 LATAM-specific skills for Latina entrepreneurs
 * Built by Kupuri Media™
 */

export interface SkillInput {
  name: string;
  type: 'text' | 'number' | 'date' | 'url';
  required: boolean;
  placeholder?: string;
}

export interface SkillOutput {
  name: string;
  format: 'text' | 'json' | 'markdown' | 'html';
  description: string;
}

export interface Skill {
  id: string;
  name_es: string;
  name_en: string;
  category: 'marketing' | 'sales' | 'ops' | 'finance' | 'research' | 'support' | 'growth' | 'content';
  pain_point_es: string;
  solution_es: string;
  wow_demo?: string;
  prompt_template: string;
  inputs: SkillInput[];
  outputs: SkillOutput[];
  tier_required: 'lite' | 'starter' | 'growth' | 'agency';
}

// Use simple string format to avoid template literal issues
const createPrompt = (template: string): string => template;

export const SKILLS_REGISTRY: Skill[] = [
  // TIER 1: WOW SKILLS
  {
    id: 'whatsapp-auto-reply',
    name_es: 'Respuestas WhatsApp Automáticas',
    name_en: 'WhatsApp Auto-Reply',
    category: 'support',
    pain_point_es: 'No puedo contestar todo el día, tengo clientes esperando',
    solution_es: 'ALEX™ responde tus WhatsApps como tú en segundos',
    wow_demo: 'ALEX responde 14 mensajes en 2 minutos',
    prompt_template: 'Responde como asistente WhatsApp. Mensaje: {message}. Contexto: {business_context}. Responde en máximo 3 líneas, cálido y profesional.',
    inputs: [
      { name: 'message', type: 'text', required: true, placeholder: 'El mensaje del cliente' },
      { name: 'business_context', type: 'text', required: true, placeholder: 'Qué hace tu negocio' },
    ],
    outputs: [
      { name: 'reply', format: 'text', description: 'Respuesta lista para WhatsApp' },
    ],
    tier_required: 'lite',
  },
  {
    id: 'content-calendar-generator',
    name_es: 'Generador de Calendario de Contenido',
    name_en: 'Content Calendar Generator',
    category: 'content',
    pain_point_es: 'Me paso 3 horas diarias en redes sociales',
    solution_es: 'ALEX™ genera un mes de contenido en 10 minutos',
    wow_demo: 'Tipo "soy coach de vida" → 30 posts con captions en 8 minutos',
    prompt_template: 'Genera calendario de contenido. Negocio: {business_type}. Audiencia: {target_audience}. Plataformas: {platforms}. Genera 30 posts para 4 semanas con formato: DÍA | PLATAFORMA | CAPTION | HASHTAGS',
    inputs: [
      { name: 'business_type', type: 'text', required: true, placeholder: 'Coach, agencia, tienda' },
      { name: 'target_audience', type: 'text', required: true, placeholder: 'Mujeres 30-50' },
      { name: 'platforms', type: 'text', required: true, placeholder: 'Instagram, TikTok' },
    ],
    outputs: [
      { name: 'calendar', format: 'markdown', description: 'Calendario de 30 posts' },
    ],
    tier_required: 'lite',
  },
  {
    id: 'daily-brief-generator',
    name_es: 'Briefing Ejecutivo Diario',
    name_en: 'Morning Daily Brief',
    category: 'research',
    pain_point_es: 'No sé qué está pasando en mi negocio',
    solution_es: 'ALEX™ te manda tu briefing cada mañana a las 8am',
    wow_demo: 'Briefing automatizado: tendencias + agenda + leads',
    prompt_template: 'Genera briefing ejecutivo matutino. Nombre: {name}. Negocio: {business_type}. Trends: {google_trends}. Mensajes pendientes: {pending_messages}. Leads nuevos: {new_leads}. Genera en formato: Saludo | Trending | Números | Agenda | Recomendación | CTA',
    inputs: [
      { name: 'name', type: 'text', required: true, placeholder: 'Tu nombre' },
      { name: 'business_type', type: 'text', required: true, placeholder: 'Tipo de negocio' },
    ],
    outputs: [
      { name: 'brief', format: 'text', description: 'Briefing listo para WhatsApp' },
    ],
    tier_required: 'lite',
  },
  {
    id: 'lead-qualifier',
    name_es: 'Calificador de Leads',
    name_en: 'Lead Qualifier',
    category: 'sales',
    pain_point_es: 'No sé si un cliente es serio',
    solution_es: 'ALEX™ califica leads automáticamente',
    prompt_template: 'Califica este lead en escala 1-10. Info: {lead_info}. Cliente ideal: {ideal_customer}. Ticket: {ticket_average}. Resultado: Fit | Urgencia | Budget | Autoridad | Puntuación final | Acción',
    inputs: [
      { name: 'lead_info', type: 'text', required: true, placeholder: 'Info del cliente' },
      { name: 'ideal_customer', type: 'text', required: true, placeholder: 'Tu cliente ideal' },
      { name: 'ticket_average', type: 'number', required: true, placeholder: '5000' },
    ],
    outputs: [
      { name: 'score', format: 'json', description: 'Calificación de lead' },
    ],
    tier_required: 'starter',
  },
  {
    id: 'meeting-notes-to-actions',
    name_es: 'Notas de Junta a Plan de Acción',
    name_en: 'Meeting Notes to Actions',
    category: 'ops',
    pain_point_es: 'Salgo de juntas sin claridad',
    solution_es: 'ALEX™ convierte notas en plan en 30 segundos',
    prompt_template: 'Convierte notas en plan de acción. Notas: {meeting_notes}. Genera: Decisiones | Acciones (WHO/WHAT/WHEN) | Preguntas abiertas | Próxima junta',
    inputs: [
      { name: 'meeting_notes', type: 'text', required: true, placeholder: 'Tus notas de junta' },
    ],
    outputs: [
      { name: 'action_plan', format: 'markdown', description: 'Plan de acción estructurado' },
    ],
    tier_required: 'starter',
  },

  // TIER 2: SALES SKILLS (5 skills)
  {
    id: 'email-sequence-es',
    name_es: 'Secuencia de Emails de Ventas',
    name_en: 'Email Sequence Writer',
    category: 'sales',
    pain_point_es: 'No tengo tiempo para escribir emails',
    solution_es: 'ALEX™ escribe tu secuencia de 5 emails en 5 minutos',
    prompt_template: 'Escribe 5 emails de ventas. Producto: {product}. Precio: {price}. Persona: {lead_persona}. Genera: Email 1 Hook | Email 2 Story | Email 3 Social Proof | Email 4 Objeciones | Email 5 Oferta. Cada uno máximo 150 palabras.',
    inputs: [
      { name: 'product', type: 'text', required: true, placeholder: 'Tu producto' },
      { name: 'price', type: 'number', required: true, placeholder: '5000' },
      { name: 'lead_persona', type: 'text', required: true, placeholder: 'Descripción del cliente' },
    ],
    outputs: [
      { name: 'emails', format: 'markdown', description: '5 emails listos para enviar' },
    ],
    tier_required: 'starter',
  },
  {
    id: 'sales-proposal-generator',
    name_es: 'Generador de Propuestas',
    name_en: 'Sales Proposal Generator',
    category: 'sales',
    pain_point_es: 'Cada propuesta me toma 2 horas',
    solution_es: 'ALEX™ genera propuestas en 5 minutos',
    prompt_template: 'Genera propuesta de venta profesional. Cliente: {client_name}. Proyecto: {project_description}. Presupuesto: {budget}. Incluye: Resumen | Problema | Solución | Entregables | Timeline | Presupuesto desglosado | Términos | CTA',
    inputs: [
      { name: 'client_name', type: 'text', required: true, placeholder: 'Nombre cliente' },
      { name: 'project_description', type: 'text', required: true, placeholder: 'Qué necesita' },
      { name: 'budget', type: 'number', required: true, placeholder: '15000' },
    ],
    outputs: [
      { name: 'proposal', format: 'html', description: 'Propuesta profesional' },
    ],
    tier_required: 'starter',
  },
  {
    id: 'follow-up-automation',
    name_es: 'Automatización de Seguimiento',
    name_en: 'Follow-up Automation',
    category: 'sales',
    pain_point_es: 'Se me olvida dar seguimiento',
    solution_es: 'ALEX™ genera plan de seguimiento automático',
    prompt_template: 'Genera plan de seguimiento para lead. Nombre: {lead_name}. Estado: {current_status}. Días sin contacto: {days_since}. Genera: Triggers | Mensajes | Cadencia | Objeciones comunes y respuestas',
    inputs: [
      { name: 'lead_name', type: 'text', required: true, placeholder: 'Nombre del lead' },
      { name: 'current_status', type: 'text', required: true, placeholder: 'Interesado/Dudoso' },
    ],
    outputs: [
      { name: 'followup_plan', format: 'markdown', description: 'Plan de seguimiento' },
    ],
    tier_required: 'starter',
  },
  {
    id: 'invoice-generator',
    name_es: 'Generador de Facturas',
    name_en: 'Invoice Generator',
    category: 'finance',
    pain_point_es: 'Odio hacer facturas',
    solution_es: 'ALEX™ genera facturas en segundos',
    prompt_template: 'Genera factura. Empresa: {company_name}. Cliente: {client_name}. Concepto: {description}. Cantidad: {quantity}. Precio unitario: {unit_price}. Genera JSON con todos los campos requeridos en México',
    inputs: [
      { name: 'company_name', type: 'text', required: true, placeholder: 'Tu empresa' },
      { name: 'client_name', type: 'text', required: true, placeholder: 'Cliente' },
      { name: 'unit_price', type: 'number', required: true, placeholder: '1000' },
    ],
    outputs: [
      { name: 'invoice', format: 'json', description: 'Factura JSON' },
    ],
    tier_required: 'starter',
  },
  {
    id: 'price-objection-handler',
    name_es: 'Manejador de Objeción de Precio',
    name_en: 'Price Objection Handler',
    category: 'sales',
    pain_point_es: 'No sé cómo responder "está muy caro"',
    solution_es: 'ALEX™ te da 5 respuestas que cierran',
    prompt_template: 'Cliente dice "está caro". Producto: {product}. Precio: {price}. Genera 5 respuestas: Reencuadre | Comparación | Pago flexible | Urgencia | Cierre de prueba. Cada una lista para WhatsApp/llamada.',
    inputs: [
      { name: 'product', type: 'text', required: true, placeholder: 'Tu producto' },
      { name: 'price', type: 'number', required: true, placeholder: '5000' },
    ],
    outputs: [
      { name: 'responses', format: 'markdown', description: '5 respuestas probadas' },
    ],
    tier_required: 'starter',
  },

  // TIER 3: OPERATIONS (5 skills)
  {
    id: 'task-delegation',
    name_es: 'Delegación de Tareas',
    name_en: 'Task Delegation',
    category: 'ops',
    pain_point_es: 'No sé cómo delegar sin perder control',
    solution_es: 'ALEX™ convierte tareas en briefs claros',
    prompt_template: 'Convierte tarea en brief de delegación. Tarea: {task_description}. Responsable: {team_member}. Plazo: {deadline}. Genera: Objetivo | Tareas paso a paso | Criterios de éxito | Riesgos | Check-ins',
    inputs: [
      { name: 'task_description', type: 'text', required: true, placeholder: 'Qué necesita hacerse' },
      { name: 'team_member', type: 'text', required: true, placeholder: 'Nombre del equipo' },
      { name: 'deadline', type: 'date', required: true },
    ],
    outputs: [
      { name: 'brief', format: 'markdown', description: 'Brief de delegación' },
    ],
    tier_required: 'growth',
  },
  {
    id: 'project-status-report',
    name_es: 'Reporte de Estado del Proyecto',
    name_en: 'Project Status Report',
    category: 'ops',
    pain_point_es: 'No sé en qué están mis proyectos',
    solution_es: 'ALEX™ genera reportes ejecutivos',
    prompt_template: 'Genera reporte de proyecto. Proyecto: {project_name}. Completado: {completion_percentage}%. Estado: {overall_status}. Genera: Resumen | Métricas | Logros | Riesgos | Próximos pasos',
    inputs: [
      { name: 'project_name', type: 'text', required: true, placeholder: 'Nombre proyecto' },
      { name: 'completion_percentage', type: 'number', required: true, placeholder: '45' },
    ],
    outputs: [
      { name: 'report', format: 'markdown', description: 'Reporte ejecutivo' },
    ],
    tier_required: 'growth',
  },
  {
    id: 'sop-writer',
    name_es: 'Escritor de Procedimientos (SOP)',
    name_en: 'SOP Writer',
    category: 'ops',
    pain_point_es: 'Todo está en mi cabeza',
    solution_es: 'ALEX™ documenta tus procesos',
    prompt_template: 'Crea SOP profesional. Proceso: {process_name}. Descripción: {step_by_step_description}. Genera: Objetivo | Pasos detallados con criterios de éxito | Checklist | Troubleshooting',
    inputs: [
      { name: 'process_name', type: 'text', required: true, placeholder: 'Nombre del proceso' },
      { name: 'step_by_step_description', type: 'text', required: true, placeholder: 'Cómo lo haces' },
    ],
    outputs: [
      { name: 'sop', format: 'markdown', description: 'SOP documentado' },
    ],
    tier_required: 'growth',
  },
  {
    id: 'calendar-booking',
    name_es: 'Agendamiento de Citas',
    name_en: 'Calendar Booking',
    category: 'ops',
    pain_point_es: 'Coordinar citas me roba horas',
    solution_es: 'ALEX™ agenda automáticamente',
    prompt_template: 'Genera secuencia de agendamiento. Horarios: {available_times}. Duración: {meeting_duration}m. Genera: Cal.com link | Mensajes WhatsApp | Email confirmación | Reminders',
    inputs: [
      { name: 'available_times', type: 'text', required: true, placeholder: 'Lun-Vie 10am-5pm' },
      { name: 'meeting_duration', type: 'number', required: false, placeholder: '30' },
    ],
    outputs: [
      { name: 'booking_sequence', format: 'markdown', description: 'Secuencia de agendamiento' },
    ],
    tier_required: 'growth',
  },
  {
    id: 'expense-categorizer',
    name_es: 'Categorizador de Gastos',
    name_en: 'Expense Categorizer',
    category: 'finance',
    pain_point_es: 'Odio la contabilidad',
    solution_es: 'ALEX™ categoriza gastos automáticamente',
    prompt_template: 'Categoriza gasto. Gasto: {expense}. Monto: {amount}. Fecha: {date}. Genera JSON con categoría, subcategoría, descripción, notas',
    inputs: [
      { name: 'expense', type: 'text', required: true, placeholder: 'Descripción del gasto' },
      { name: 'amount', type: 'number', required: true },
    ],
    outputs: [
      { name: 'categorization', format: 'json', description: 'Gasto categorizado' },
    ],
    tier_required: 'starter',
  },

  // TIER 4: CONTENT & MARKETING (10 skills)
  {
    id: 'instagram-caption-es',
    name_es: 'Captions Instagram (ES)',
    name_en: 'Instagram Caption Writer',
    category: 'content',
    pain_point_es: 'Mis captions no convierten',
    solution_es: 'ALEX™ escribe captions que generan engagement',
    prompt_template: 'Escribe caption Instagram que convierte. Tipo: {post_type}. Tema: {topic}. Objetivo: {goal}. Genera: Hook | Story | CTA | Hashtags | Emojis. Máximo 300 caracteres.',
    inputs: [
      { name: 'post_type', type: 'text', required: true, placeholder: 'Carrusel/Reel/Post' },
      { name: 'topic', type: 'text', required: true, placeholder: 'Tema' },
    ],
    outputs: [
      { name: 'caption', format: 'text', description: 'Caption listo' },
    ],
    tier_required: 'starter',
  },
  {
    id: 'tiktok-script-writer',
    name_es: 'Scripts TikTok',
    name_en: 'TikTok Script Writer',
    category: 'content',
    pain_point_es: 'No sé qué decir en TikTok',
    solution_es: 'ALEX™ escribe scripts virales',
    prompt_template: 'Escribe script TikTok 60seg viral. Tema: {topic}. Nicho: {niche}. Genera: Hook (3seg) | Contenido (40seg) | CTA (17seg) | Hashtags | Música recomendada',
    inputs: [
      { name: 'topic', type: 'text', required: true, placeholder: 'Idea TikTok' },
      { name: 'niche', type: 'text', required: true, placeholder: 'Tu nicho' },
    ],
    outputs: [
      { name: 'script', format: 'text', description: 'Script TikTok' },
    ],
    tier_required: 'growth',
  },
  {
    id: 'linkedin-thought-leadership',
    name_es: 'Posts LinkedIn (Autoridad)',
    name_en: 'LinkedIn Post',
    category: 'content',
    pain_point_es: 'Quiero posicionarme como experta',
    solution_es: 'ALEX™ escribe posts de autoridad',
    prompt_template: 'Escribe post LinkedIn de liderazgo. Tema: {topic}. Insight: {your_insight}. Genera: Hook | Story | Lección | CTA | Hashtags. Tono profesional, auténtico.',
    inputs: [
      { name: 'topic', type: 'text', required: true, placeholder: 'Tema del post' },
      { name: 'your_insight', type: 'text', required: true, placeholder: 'Tu insight' },
    ],
    outputs: [
      { name: 'post', format: 'text', description: 'Post LinkedIn' },
    ],
    tier_required: 'growth',
  },
  {
    id: 'blog-post-seo-mexico',
    name_es: 'Blog Post (SEO México)',
    name_en: 'Blog Post Writer',
    category: 'content',
    pain_point_es: 'Quiero que Google me encuentre',
    solution_es: 'ALEX™ escribe posts SEO-optimizados',
    prompt_template: 'Escribe blog post SEO para Google México. Keyword: {main_keyword}. Genera: Meta title | Meta description | H1 | H2s | 1500+ palabras | Links internos | CTA clara',
    inputs: [
      { name: 'main_keyword', type: 'text', required: true, placeholder: 'Keyword principal' },
    ],
    outputs: [
      { name: 'post', format: 'markdown', description: 'Blog post SEO' },
    ],
    tier_required: 'growth',
  },
  {
    id: 'hashtag-researcher-mexico',
    name_es: 'Investigador de Hashtags México',
    name_en: 'Hashtag Researcher',
    category: 'content',
    pain_point_es: 'Mis hashtags no funcionan',
    solution_es: 'ALEX™ encuentra hashtags trending',
    prompt_template: 'Investiga hashtags trending en México. Tema: {topic}. Plataforma: {platform}. Genera: Mega hashtags | Macro hashtags | Micro hashtags | Mexico-specific | Combinaciones ganadoras',
    inputs: [
      { name: 'topic', type: 'text', required: true, placeholder: 'Tema' },
      { name: 'platform', type: 'text', required: true, placeholder: 'Instagram/TikTok' },
    ],
    outputs: [
      { name: 'hashtags', format: 'markdown', description: 'Hashtags investigados' },
    ],
    tier_required: 'growth',
  },
  {
    id: 'email-newsletter-es',
    name_es: 'Newsletter por Email (ES)',
    name_en: 'Email Newsletter',
    category: 'content',
    pain_point_es: 'Quiero newsletter pero no tengo tiempo',
    solution_es: 'ALEX™ escribe newsletters que leen',
    prompt_template: 'Escribe email newsletter. Tema: {main_topic}. Audiencia: {audience}. Genera: Subject line | Saludo | Hero section | Main content | Tips | CTA | PS | Footer',
    inputs: [
      { name: 'main_topic', type: 'text', required: true, placeholder: 'Tema newsletter' },
      { name: 'audience', type: 'text', required: true, placeholder: 'Tu audiencia' },
    ],
    outputs: [
      { name: 'newsletter', format: 'html', description: 'Newsletter HTML' },
    ],
    tier_required: 'growth',
  },
  {
    id: 'youtube-script',
    name_es: 'Script YouTube',
    name_en: 'YouTube Script',
    category: 'content',
    pain_point_es: 'Quiero videos pero no sé qué grabar',
    solution_es: 'ALEX™ escribe scripts YouTube',
    prompt_template: 'Escribe script YouTube {duration}min. Tema: {topic}. Genera: Hook | Promise | Content sections | Recap | CTA | Timing para B-roll | Music recommendations',
    inputs: [
      { name: 'topic', type: 'text', required: true, placeholder: 'Tema video' },
      { name: 'duration', type: 'number', required: false, placeholder: '10' },
    ],
    outputs: [
      { name: 'script', format: 'text', description: 'Script YouTube' },
    ],
    tier_required: 'growth',
  },
  {
    id: 'podcast-outline',
    name_es: 'Estructura Podcast',
    name_en: 'Podcast Outline',
    category: 'content',
    pain_point_es: 'Tengo podcast pero no sé temas',
    solution_es: 'ALEX™ genera estructuras de episodios',
    prompt_template: 'Genera estructura podcast. Tema: {episode_theme}. Duración: {duration}min. Genera: Intro | Background | Main content (3-4 puntos) | Stories | Takeaways | CTA | Outro | Resources | Music',
    inputs: [
      { name: 'episode_theme', type: 'text', required: true, placeholder: 'Tema episodio' },
    ],
    outputs: [
      { name: 'outline', format: 'markdown', description: 'Estructura podcast' },
    ],
    tier_required: 'growth',
  },
  {
    id: 'press-release-es',
    name_es: 'Comunicado de Prensa (ES)',
    name_en: 'Press Release',
    category: 'content',
    pain_point_es: 'Quiero visibilidad en medios',
    solution_es: 'ALEX™ redacta comunicados profesionales',
    prompt_template: 'Redacta comunicado de prensa profesional. Noticia: {news_headline}. Empresa: {company_name}. Genera: Headline | Subtitle | Párrafo 1 | Cita CEO | Contexto | Cita stakeholder | Sobre empresa | Contacto',
    inputs: [
      { name: 'news_headline', type: 'text', required: true, placeholder: 'Tu noticia' },
      { name: 'company_name', type: 'text', required: true, placeholder: 'Empresa' },
    ],
    outputs: [
      { name: 'press_release', format: 'text', description: 'Comunicado profesional' },
    ],
    tier_required: 'growth',
  },
  {
    id: 'ad-copy-facebook-instagram',
    name_es: 'Copywriting Ads FB/IG',
    name_en: 'Ad Copy',
    category: 'marketing',
    pain_point_es: 'Mis anuncios no convierten',
    solution_es: 'ALEX™ escribe ad copy que vende',
    prompt_template: 'Escribe 3 variantes de ad copy. Producto: {product}. Precio: {price}. Audiencia: {target_audience}. Genera: Variante A | Variante B | Variante C. Cada una: Headline | Primary text | CTA. Máx 125 caracteres texto principal.',
    inputs: [
      { name: 'product', type: 'text', required: true, placeholder: 'Tu producto' },
      { name: 'price', type: 'number', required: true, placeholder: '99' },
    ],
    outputs: [
      { name: 'ad_variants', format: 'markdown', description: '3 variantes ad copy' },
    ],
    tier_required: 'growth',
  },

  // TIER 5: RESEARCH (5 skills)
  {
    id: 'competitor-analysis',
    name_es: 'Análisis de Competencia',
    name_en: 'Competitor Analysis',
    category: 'research',
    pain_point_es: 'No sé qué hace mi competencia',
    solution_es: 'ALEX™ analiza competidoras y encuentra gaps',
    prompt_template: 'Analiza competencia. Tu negocio: {your_business}. Competidor 1: {competitor1_name}. Competidor 2: {competitor2_name}. Genera: Posicionamiento | Pricing | Audiencia | Canales | Fortalezas | Debilidades | Oportunidades para ti',
    inputs: [
      { name: 'your_business', type: 'text', required: true, placeholder: 'Tu negocio' },
      { name: 'competitor1_name', type: 'text', required: true, placeholder: 'Competidor 1' },
    ],
    outputs: [
      { name: 'analysis', format: 'markdown', description: 'Análisis competitivo' },
    ],
    tier_required: 'starter',
  },
  {
    id: 'google-trends-brief-mx',
    name_es: 'Google Trends Briefing (MX)',
    name_en: 'Google Trends Brief',
    category: 'research',
    pain_point_es: 'Quiero saber qué está trending',
    solution_es: 'ALEX™ te manda qué está trending',
    prompt_template: 'Genera Google Trends briefing para México. Industria: {industry}. Genera: Top searches | Trending up | Regional differences | Oportunidades | Predicción próxima semana | Acciones hoy',
    inputs: [
      { name: 'industry', type: 'text', required: true, placeholder: 'Tu industria' },
    ],
    outputs: [
      { name: 'brief', format: 'markdown', description: 'Trends briefing' },
    ],
    tier_required: 'starter',
  },
  {
    id: 'market-research-brief',
    name_es: 'Investigación de Mercado',
    name_en: 'Market Research Brief',
    category: 'research',
    pain_point_es: '¿Hay mercado para mi idea?',
    solution_es: 'ALEX™ investiga viabilidad',
    prompt_template: 'Investiga mercado. Idea: {your_idea}. Mercado: {target_market}. Genera: Tamaño mercado | Crecimiento | Competencia | Pricing | Demanda | Barreras entrada | Veredicto | Próximos pasos',
    inputs: [
      { name: 'your_idea', type: 'text', required: true, placeholder: 'Tu idea' },
      { name: 'target_market', type: 'text', required: true, placeholder: 'Mercado objetivo' },
    ],
    outputs: [
      { name: 'research', format: 'markdown', description: 'Investigación mercado' },
    ],
    tier_required: 'growth',
  },
  {
    id: 'customer-persona-builder',
    name_es: 'Constructor de Persona de Cliente',
    name_en: 'Customer Persona Builder',
    category: 'research',
    pain_point_es: 'No conozco bien a mi cliente',
    solution_es: 'ALEX™ construye perfiles detallados',
    prompt_template: 'Construye persona de cliente. Negocio: {your_business}. Producto: {product}. Genera: Datos demográficos | Profesional | Psicográfico | Problemas | Solución ideal | Comportamiento online | Hábitos compra | Messaging efectivo',
    inputs: [
      { name: 'your_business', type: 'text', required: true, placeholder: 'Tu negocio' },
      { name: 'product', type: 'text', required: true, placeholder: 'Tu producto' },
    ],
    outputs: [
      { name: 'persona', format: 'markdown', description: 'Persona de cliente' },
    ],
    tier_required: 'growth',
  },
  {
    id: 'industry-news-digest',
    name_es: 'Resumen de Noticias de Industria',
    name_en: 'Industry News Digest',
    category: 'research',
    pain_point_es: 'Quiero estar actualizada sin perder tiempo',
    solution_es: 'ALEX™ te manda noticias de tu industria',
    prompt_template: 'Genera resumen noticias de industria. Industria: {industry}. Genera: Noticias calientes | Cambios regulatorios | Lanzamientos | Tendencias | M&A | Opinión expertos | Tu acción esta semana | Recursos para leer',
    inputs: [
      { name: 'industry', type: 'text', required: true, placeholder: 'Tu industria' },
    ],
    outputs: [
      { name: 'digest', format: 'markdown', description: 'Resumen noticias' },
    ],
    tier_required: 'growth',
  },

  // TIER 6-8: SUPPORT + FINANCE + GROWTH (Quick versions for space)
  {
    id: 'faq-auto-responder',
    name_es: 'Auto-Respuesta de FAQs',
    name_en: 'FAQ Auto-Responder',
    category: 'support',
    pain_point_es: 'Las mismas preguntas siempre',
    solution_es: 'ALEX™ responde FAQs automáticamente',
    prompt_template: 'Responde pregunta FAQ. Contexto: {faq_context}. Pregunta: {question}. Responde clara y cálida en máximo 5 líneas.',
    inputs: [
      { name: 'question', type: 'text', required: true },
      { name: 'faq_context', type: 'text', required: true },
    ],
    outputs: [
      { name: 'answer', format: 'text', description: 'Respuesta FAQ' },
    ],
    tier_required: 'starter',
  },
  {
    id: 'weekly-revenue-report',
    name_es: 'Reporte Semanal de Ingresos',
    name_en: 'Weekly Revenue Report',
    category: 'finance',
    pain_point_es: 'No sé cuánto estoy ganando',
    solution_es: 'ALEX™ genera reportes de ingresos',
    prompt_template: 'Genera reporte semanal ingresos. Datos: {week_data}. Genera: Resumen | Ingresos por fuente | Comparación semana anterior | Proyección | Insights | Acciones',
    inputs: [
      { name: 'week_data', type: 'text', required: true },
    ],
    outputs: [
      { name: 'report', format: 'markdown', description: 'Reporte ingresos' },
    ],
    tier_required: 'starter',
  },
  {
    id: 'cash-flow-forecast',
    name_es: 'Pronóstico de Flujo de Caja',
    name_en: 'Cash Flow Forecast',
    category: 'finance',
    pain_point_es: 'Me quedo sin dinero sin avisar',
    solution_es: 'ALEX™ predice tu flujo 90 días',
    prompt_template: 'Genera pronóstico cash flow 90 días. Datos financieros: {financial_data}. Genera: Proyección 30/60/90 días | Puntos críticos | Recomendaciones | Alertas',
    inputs: [
      { name: 'financial_data', type: 'text', required: true },
    ],
    outputs: [
      { name: 'forecast', format: 'json', description: 'Pronóstico cash flow' },
    ],
    tier_required: 'growth',
  },
  {
    id: '90-day-business-plan',
    name_es: 'Plan de Negocio 90 Días',
    name_en: '90-Day Business Plan',
    category: 'growth',
    pain_point_es: 'Quiero crecer pero no sé cómo',
    solution_es: 'ALEX™ diseña tu plan quarter',
    prompt_template: 'Genera plan 90 días. Negocio: {business}. Objetivo: {goal}. Genera: Objetivo claro | Mes 1 | Mes 2 | Mes 3 | Milestones | KPIs | Riesgos | Recursos',
    inputs: [
      { name: 'business', type: 'text', required: true },
      { name: 'goal', type: 'text', required: true },
    ],
    outputs: [
      { name: 'plan', format: 'markdown', description: 'Plan 90 días' },
    ],
    tier_required: 'growth',
  },
  {
    id: 'pitch-deck-builder',
    name_es: 'Constructor de Pitch Deck',
    name_en: 'Pitch Deck Builder',
    category: 'growth',
    pain_point_es: 'Necesito presentarme a inversores',
    solution_es: 'ALEX™ genera estructura pitch',
    prompt_template: 'Genera estructura pitch deck. Negocio: {business}. Inversión: {amount}. Genera: Problem | Solution | Market | Team | Traction | Ask | CTA',
    inputs: [
      { name: 'business', type: 'text', required: true },
      { name: 'amount', type: 'number', required: true },
    ],
    outputs: [
      { name: 'pitch', format: 'markdown', description: 'Estructura pitch' },
    ],
    tier_required: 'agency',
  },
  {
    id: 'brand-voice-guide',
    name_es: 'Guía de Voz de Marca',
    name_en: 'Brand Voice Guide',
    category: 'growth',
    pain_point_es: 'No tengo consistencia en mi mensaje',
    solution_es: 'ALEX™ documenta tu voz única',
    prompt_template: 'Crea guía de voz de marca. Marca: {brand_name}. Personalidad: {personality}. Genera: Tono | Voz | Valores | Vocabulary | Ejemplos DO/DONT | Platfor guidelinesespecíficas',
    inputs: [
      { name: 'brand_name', type: 'text', required: true },
      { name: 'personality', type: 'text', required: true },
    ],
    outputs: [
      { name: 'guide', format: 'markdown', description: 'Guía de voz de marca' },
    ],
    tier_required: 'growth',
  },
  {
    id: 'latam-expansion-brief',
    name_es: 'Briefing Expansión LATAM',
    name_en: 'LATAM Expansion Brief',
    category: 'growth',
    pain_point_es: 'Quiero vender en otros países',
    solution_es: 'ALEX™ planifica tu expansión LATAM',
    prompt_template: 'Planifica expansión LATAM. Negocio: {your_business}. Países: {target_countries}. Genera: Por qué cada país | Regulaciones | Competencia local | Estrategia entrada | Timeline | Presupuesto | Riesgos',
    inputs: [
      { name: 'your_business', type: 'text', required: true },
      { name: 'target_countries', type: 'text', required: true, placeholder: 'Colombia, Chile' },
    ],
    outputs: [
      { name: 'expansion', format: 'markdown', description: 'Plan expansión' },
    ],
    tier_required: 'agency',
  },
  {
    id: 'ai-strategy-smb-es',
    name_es: 'Estrategia de IA para PyMEs',
    name_en: 'AI Strategy for SMBs',
    category: 'growth',
    pain_point_es: 'No sé cómo implementar IA',
    solution_es: 'ALEX™ diseña tu roadmap IA',
    prompt_template: 'Diseña roadmap IA para PyME. Tipo: {business_type}. Tamaño: {size} empleados. Presupuesto: {budget}. Genera: Diagnóstico | Low-hanging fruit | Quick wins | Fase 2 | Métrica éxito | Vendors | Training plan',
    inputs: [
      { name: 'business_type', type: 'text', required: true },
      { name: 'size', type: 'number', required: true },
    ],
    outputs: [
      { name: 'roadmap', format: 'markdown', description: 'Roadmap IA' },
    ],
    tier_required: 'agency',
  },

  // WOW VIDEO SKILLS — ZTE-20260311-0001
  {
    id: 'video_whatsapp_demo',
    name_es: 'Video: Demo WhatsApp Auto-Respuesta',
    name_en: 'Video: WhatsApp Auto-Reply Demo',
    category: 'content',
    pain_point_es: 'Necesito mostrar cómo ALEX™ funciona',
    solution_es: 'ALEX™ genera demo video de auto-respuestas',
    wow_demo: 'whatsapp_demo',
    prompt_template: 'Genera video demo WhatsApp. Usando plantilla: whatsapp_demo de wow-demos.ts',
    inputs: [
      { name: 'demo_type', type: 'text', required: true, placeholder: 'whatsapp_demo' },
    ],
    outputs: [
      { name: 'video_url', format: 'text', description: 'URL del video demo generado' },
    ],
    tier_required: 'lite',
  },
  {
    id: 'video_content_calendar',
    name_es: 'Video: Demo Generador de Calendario',
    name_en: 'Video: Content Calendar Demo',
    category: 'content',
    pain_point_es: 'Necesito convencer a mi equipo',
    solution_es: 'ALEX™ genera video mostrando 30 días de contenido en 3 minutos',
    wow_demo: 'content_calendar',
    prompt_template: 'Genera video demo calendario. Usando plantilla: content_calendar de wow-demos.ts',
    inputs: [
      { name: 'demo_type', type: 'text', required: true, placeholder: 'content_calendar' },
    ],
    outputs: [
      { name: 'video_url', format: 'text', description: 'URL del video demo generado' },
    ],
    tier_required: 'lite',
  },
  {
    id: 'video_overnight_worker',
    name_es: 'Video: Trabajador de Noche',
    name_en: 'Video: Overnight Worker',
    category: 'content',
    pain_point_es: 'Quiero mostrar el poder de ALEX™',
    solution_es: 'ALEX™ genera video mostrando 12 tareas completadas mientras duermes',
    wow_demo: 'overnight_worker',
    prompt_template: 'Genera video demo overnight worker. Usando plantilla: overnight_worker de wow-demos.ts',
    inputs: [
      { name: 'demo_type', type: 'text', required: true, placeholder: 'overnight_worker' },
    ],
    outputs: [
      { name: 'video_url', format: 'text', description: 'URL del video demo generado' },
    ],
    tier_required: 'lite',
  },
];

export default SKILLS_REGISTRY;
