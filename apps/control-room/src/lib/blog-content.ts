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
  {
    slug: 'como-crear-tu-ceo-invisible',
    title: 'Cómo crear tu CEO invisible sin código ni técnicos',
    excerpt: 'SYNTHIA™ 3.0 orquesta 9 agentes especializados que toman decisiones, automatizan operaciones y generan ingresos — sin que tengas que saber programar.',
    date: '2025-06-22',
    tags: ['synthia', 'automatización', 'emprendimiento'],
  },
  {
    slug: 'arbitraje-latam-forex',
    title: 'Arbitraje LATAM: cómo los agentes detectan oportunidades de forex',
    excerpt: 'Los diferenciales de divisas entre países LATAM crean oportunidades diarias. Los agentes pueden detectarlas, ejecutarlas y reportarlas — mientras tú duermes.',
    date: '2025-06-29',
    tags: ['arbitraje', 'finanzas', 'automatización'],
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
  'como-crear-tu-ceo-invisible': `
<p>¿Imagina que tuvieras una ejecutiva con doctorado en negocios, otra especializada en ventas, una tercera en finanzas y una cuarta en tecnología — trabajando todas 24/7 para tu negocio, sin pedir salario?</p>

<p>Eso es SYNTHIA™ 3.0: un sistema operativo de 9 agentes de IA que coordina operaciones, toma decisiones y ejecuta tareas complejas.</p>

<h2>Los 9 Agentes de SYNTHIA™</h2>
<ul>
  <li><strong>SYNTHIA™</strong> — Tu coordinadora general. Distribuye tareas, coordina agentes, toma decisiones estratégicas.</li>
  <li><strong>ALEX™</strong> — Tu estratega. Analiza mercados, propone iniciativas, monitorea competencia.</li>
  <li><strong>CAZADORA™</strong> — Tu cazadora de oportunidades. Busca prospectos, identifica clientes ideales, genera leads.</li>
  <li><strong>FORJADORA™</strong> — Tu arquitecta. Diseña sistemas, implementa procesos, construye infraestructura.</li>
  <li><strong>SEDUCTORA™</strong> — Tu closera. Negocia, convence, cierra ventas.</li>
  <li><strong>CONSEJO™</strong> — Tu consejero. Facilita decisiones, media conflictos, propone alternativas.</li>
  <li><strong>DR. ECONOMÍA</strong> — Tu analista financiero. Monitorea flujo de caja, detecta oportunidades de arbitraje, optimiza gastos.</li>
  <li><strong>DRA. CULTURA</strong> — Tu estratega de contenido. Crea posts, genera ideas, mantiene tu marca.</li>
  <li><strong>ING. TEKNOS</strong> — Tu ingeniero. Configura herramientas, resuelve problemas técnicos, optimiza sistemas.</li>
</ul>

<h2>Cómo Funciona</h2>
<p>1. <strong>Tú describes tu negocio</strong> — En la encuesta de onboarding, cuentas qué vendes, a quién, y cuáles son tus metas.</p>
<p>2. <strong>SYNTHIA™ asigna agentes</strong> — Automáticamente, selecciona los 4-5 agentes más relevantes para tu negocio.</p>
<p>3. <strong>Los agentes se coordinan</strong> — Cada día, ejecutan tareas, se reportan entre sí, toman decisiones.</p>
<p>4. <strong>Tú ves el progreso</strong> — En el Cockpit, tu tablero centralizado, ves todo: oportunidades encontradas, ventas cerradas, problemas resueltos.</p>

<h2>El Cockpit: Tu Centro de Control</h2>
<p>Es aquí donde todo sucede. En tiempo real, ves:</p>
<ul>
  <li><strong>Dashboard de Agentes</strong> — Qué está haciendo cada agente ahora mismo</li>
  <li><strong>Oportunidades</strong> — Leads nuevos, referencias, clientes potenciales</li>
  <li><strong>Ventas</strong> — Pipelines, propuestas, contratos cerrados</li>
  <li><strong>Finanzas</strong> — Ingresos diarios, gastos, oportunidades de arbitraje</li>
  <li><strong>Tareas Completadas</strong> — Todo lo que los agentes lograron hoy</li>
</ul>

<h2>Costo: Una Fracción de tu Equipo Actual</h2>
<p>Si hoy pagas $50,000 al mes en salarios para un equipo de 4 personas, SYNTHIA™ cuesta una fracción de eso — y trabaja sin descanso.</p>
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
  'arbitraje-latam-forex': `
<p>Hay una oportunidad de dinero que existe todos los días en Latinoamérica — y la mayoría de emprendedoras no la ve.</p>

<p>Se llama arbitraje: explotar las diferencias de precio de algo (divisas, commodities, acciones) entre dos mercados diferentes.</p>

<h2>El Arbitraje en LATAM es Real</h2>
<p>Ejemplo:</p>
<ul>
  <li>Peso mexicano en Bancomer: 19.50 MXN/USD</li>
  <li>Peso mexicano en Wise: 19.80 MXN/USD</li>
  <li>Diferencia: 0.30 centavos por dólar</li>
</ul>

<p>Si transferís $100,000 USD:</p>
<ul>
  <li>Compra en Bancomer: 1,950,000 MXN</li>
  <li>Vende en Wise: 1,980,000 MXN</li>
  <li>Ganancia: 30,000 MXN (≈$1,500 USD) en 2 horas</li>
</ul>

<p>Esto sucede diariamente. Los límites: velocidad y información. Necesitás detectar la oportunidad, ejecutarla y cerrarla — antes de que el mercado corrija el diferencial (que sucede en minutos).</p>

<h2>Aquí es donde los Agentes Ganan</h2>
<p>DR. ECONOMÍA™ (el agente financiero de SYNTHIA™) monitorea 24/7:</p>
<ul>
  <li>Tipos de cambio en 20+ plataformas (bancos, casas de cambio, cripto exchanges)</li>
  <li>Identifica diferencias de precio mayores al 0.5%</li>
  <li>Calcula ganancias después de comisiones</li>
  <li>Ejecuta el arbitraje automáticamente si la ganancia > $500</li>
  <li>Te reporta diariamente: oportunidades detectadas, ejecutadas, ganancia acumulada</li>
</ul>

<h2>El Riesgo</h2>
<p>Bajo. Es un movimiento simultáneo: compras en A, vendes en B, pocketas la diferencia. No dependés de futuros movimientos de precio — la ganancia está garantizada cuando ejecutás.</p>

<h2>Por Qué No Todos Hacen Esto</h2>
<p>Porque requiere:</p>
<ol>
  <li>Acceso a múltiples plataformas de cambio</li>
  <li>Capital líquido disponible</li>
  <li>Velocidad para actuar en minutos (imposible a mano)</li>
  <li>Monitoreo 24/7 (humanamente agotador)</li>
</ol>

<p>Con SYNTHIA™, es automático. Mientras tú duermés, el dinero se multiplica.</p>
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
