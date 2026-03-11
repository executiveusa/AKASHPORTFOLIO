/**
 * Blog content library for Kupuri Media™
 * Posts are stored as markdown strings (inline for simplicity)
 * ALEX™ can auto-generate new posts via /api/blog/generate
 */

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags?: string[];
  html: string;
}

// Seed content — ALEX™ will expand this via /api/blog/generate
const POSTS: Omit<BlogPost, 'html'>[] = [
  {
    slug: 'como-ganar-dolares-desde-mexico',
    title: 'Cómo ganar dólares desde México con servicios digitales',
    excerpt: 'El tipo de cambio juega a tu favor. Aprende a cobrar en USD mientras vives con pesos — estrategias reales para freelancers y agencias LATAM.',
    date: '2025-06-01',
    tags: ['arbitraje', 'freelance', 'latam', 'finanzas'],
  },
  {
    slug: 'ia-para-emprendedoras-cdmx',
    title: 'IA para emprendedoras en CDMX: por dónde empezar',
    excerpt: 'No necesitas saber programar. Estas herramientas de inteligencia artificial pueden automatizar tu negocio desde hoy — sin depender de nadie.',
    date: '2025-06-08',
    tags: ['ia', 'automatización', 'emprendimiento', 'cdmx'],
  },
  {
    slug: 'agentes-ia-vs-empleados',
    title: 'Agentes de IA vs. empleados: ¿cuándo contratar a quién?',
    excerpt: 'Los agentes trabajan 24/7, no piden vacaciones y cuestan fracciones de un salario. Pero hay tareas donde los humanos siguen siendo irremplazables.',
    date: '2025-06-15',
    tags: ['ia', 'negocios', 'productividad'],
  },
];

const CONTENT: Record<string, string> = {
  'como-ganar-dolares-desde-mexico': `
<p>Si vives en México, Argentina, Colombia o cualquier país LATAM donde el dólar vale mucho más que la moneda local, tienes una ventaja competitiva enorme frente a freelancers en Estados Unidos o Europa.</p>

<h2>La aritmética es simple</h2>
<p>Un servicio que cobras en $500 USD representa:</p>
<ul>
  <li>~$9,500 MXN (tipo de cambio ~19)</li>
  <li>~$450,000 ARS (Argentina, tipo de cambio ~900)</li>
  <li>~$2,050,000 COP (Colombia, ~4,100)</li>
</ul>
<p>Mientras tu costo de vida permanece en pesos, tus ingresos en dólares equivalen a un salario de clase media alta en cualquier ciudad de LATAM.</p>

<h2>Cómo empezar</h2>
<ol>
  <li><strong>Abre una cuenta en Wise o Payoneer</strong> — te permiten recibir pagos en USD desde cualquier parte del mundo.</li>
  <li><strong>Crea un perfil en Upwork o Workana</strong> — enfócate en servicios de alto valor: automatización de IA, copywriting en inglés/español, desarrollo web.</li>
  <li><strong>Cobra en USD, vive en pesos</strong> — convierte solo lo que necesitas cada mes.</li>
</ol>

<h2>Servicios más rentables en 2025</h2>
<ul>
  <li>Automatización con IA (n8n, Make, Zapier) — $80–150 USD/hora</li>
  <li>Desarrollo con Next.js/React — $50–120 USD/hora</li>
  <li>Copywriting en inglés (SEO, ads) — $0.10–0.30/palabra</li>
  <li>Creación de chatbots y asistentes — $500–2,000 por proyecto</li>
</ul>

<p><em>ALEX™ puede escanear oportunidades activas en Upwork y Workana diariamente y enviar resúmenes directamente a tu bandeja de entrada.</em></p>
`,
  'ia-para-emprendedoras-cdmx': `
<p>La inteligencia artificial no es solo para programadores. En 2025, cualquier emprendedora con una conexión a internet puede automatizar tareas que antes requerían un equipo completo.</p>

<h2>Las 5 herramientas más útiles para tu negocio</h2>

<h3>1. ChatGPT / Claude — Tu asistente de escritura</h3>
<p>Úsalo para redactar propuestas, responder emails, crear contenido para redes sociales y mucho más. El costo es mínimo comparado con contratar a alguien.</p>

<h3>2. n8n — Automatización sin código</h3>
<p>Conecta tus apps: cuando alguien llena tu formulario de contacto, n8n puede enviar un email automático, crear una tarea en Notion y notificarte en Telegram — todo sin que hagas nada.</p>

<h3>3. ElevenLabs — Voz propia para tu marca</h3>
<p>Clona tu voz y úsala para crear contenido de audio, videos y respuestas automáticas. Perfecto para agencias de contenido.</p>

<h3>4. Stripe + Coinbase Commerce — Pagos internacionales</h3>
<p>Cobra en cualquier parte del mundo, en cualquier moneda, incluyendo criptomonedas estables como USDC.</p>

<h3>5. ALEX™ — Tu directora de operaciones</h3>
<p>Nuestra propia IA coordinadora monitorea tus proyectos, envía facturas, escanea oportunidades de trabajo y programa reuniones de estrategia — todo en automático.</p>

<p><em>¿Quieres ver ALEX™ en acción? Visita el Control Room en kupurimedia.com</em></p>
`,
  'agentes-ia-vs-empleados': `
<p>Esta es una de las preguntas más frecuentes que recibimos de emprendedoras: ¿debo contratar a alguien o automatizar con IA?</p>

<p>La respuesta depende completamente del tipo de trabajo.</p>

<h2>Dónde los agentes de IA ganan</h2>
<ul>
  <li><strong>Tareas repetitivas</strong>: responder preguntas frecuentes, actualizar hojas de cálculo, enviar emails de seguimiento</li>
  <li><strong>Monitoreo 24/7</strong>: vigilar precios, oportunidades de trabajo, alertas de clientes</li>
  <li><strong>Procesamiento de datos</strong>: analizar facturas, extraer información de documentos, resumir reportes</li>
  <li><strong>Generación de contenido primer borrador</strong>: posts de blog, propuestas, descripciones de productos</li>
</ul>

<h2>Dónde los humanos son irremplazables</h2>
<ul>
  <li><strong>Negociaciones importantes</strong>: una IA puede preparar los argumentos, pero el apretón de manos lo das tú</li>
  <li><strong>Decisiones estratégicas</strong>: la visión del negocio, los valores, la dirección — eso es tuyo</li>
  <li><strong>Relaciones con clientes clave</strong>: la empatía genuina todavía no se puede automatizar completamente</li>
  <li><strong>Creatividad original</strong>: los conceptos más innovadores nacen de experiencias humanas reales</li>
</ul>

<h2>La estrategia de Kupuri Media™</h2>
<p>Automatizamos todo lo que podemos con agentes de IA, y dedicamos el tiempo humano a lo que realmente importa: construir relaciones, pensar en grande y tomar decisiones.</p>
<p>El resultado: un equipo de 2 personas que opera como si fueran 20.</p>
`,
};

function markdownToHtml(md: string): string {
  // Minimal markdown processor (headers, bold, lists, paragraphs)
  return md
    .trim()
    .replace(/<[^>]+>/g, (tag) => tag) // Pass through existing HTML
    .replace(/\n\n/g, '</p><p>')
    .replace(/^<p>(<h[1-6]>)/, '$1')
    .replace(/(<\/h[1-6]>)<\/p>/, '$1');
}

export async function getBlogPosts(): Promise<Omit<BlogPost, 'html'>[]> {
  return POSTS.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const meta = POSTS.find((p) => p.slug === slug);
  if (!meta) return null;

  const rawHtml = CONTENT[slug] ?? `<p>Próximamente...</p>`;
  return { ...meta, html: rawHtml.trim() };
}
