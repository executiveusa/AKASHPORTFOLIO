/**
 * El Panorama™ Startup — runs once on server init
 * Registers all tools, MCP servers, Bright Data, weekly cron
 */

let _initialized = false;

export async function initElPanorama(): Promise<void> {
  if (_initialized) return;
  _initialized = true;

  const start = Date.now();
  console.log('[El Panorama™] 🌅 Iniciando sistema...');

  // Run all registrations in parallel — non-blocking
  const results = await Promise.allSettled([
    bootstrapHerald(),
    bootstrapMCP(),
    bootstrapBrightData(),
  ]);

  for (const [i, result] of results.entries()) {
    if (result.status === 'fulfilled') {
      const name = ['HERALD', 'MCP', 'Bright Data'][i];
      console.log(`[El Panorama™] 🔧 ${name}:`, result.value);
    }
  }

  scheduleWeeklyReview();

  console.log(`[El Panorama™] ✅ Sistema listo en ${Date.now() - start}ms — La vista está despejada.`);
}

async function bootstrapHerald() {
  try {
    const { registerSiteFactoryTools } = await import('./site-factory/herald-registration');
    await registerSiteFactoryTools();
    return 'HERALD initialized + Site Factory tools registered';
  } catch (err) {
    return `HERALD initialized (Site Factory registration failed: ${(err as Error).message})`;
  }
}

async function bootstrapMCP() {
  try {
    const { registerAllMCPServers } = await import('./mcp-connections');
    const result = await registerAllMCPServers();
    return `${result.registered} servers registered`;
  } catch (err) {
    return `MCP bootstrap failed: ${(err as Error).message}`;
  }
}

async function bootstrapBrightData() {
  try {
    const { registerBrightDataTools } = await import('./brightdata-adapter');
    const count = await registerBrightDataTools();
    return `${count} tools registered`;
  } catch (err) {
    return `Bright Data bootstrap failed: ${(err as Error).message}`;
  }
}

// ═══ WEEKLY REVIEW — GTD "critical factor for success" ══════════
// David Allen: "The weekly review is the key that keeps the system running."

let _weeklyReviewScheduled = false;

function scheduleWeeklyReview() {
  if (_weeklyReviewScheduled) return;
  _weeklyReviewScheduled = true;

  // Check every 5 minutes if it's Monday 6:00 AM
  const checkInterval = setInterval(() => {
    const now = new Date();
    const isMonday = now.getDay() === 1;
    const isSixAM = now.getHours() === 6 && now.getMinutes() < 5;

    if (isMonday && isSixAM) {
      void runWeeklyReview().catch(err =>
        console.error('[weekly-review] Error:', err)
      );
    }
  }, 5 * 60 * 1000);

  // Cleanup on module unload
  if (typeof process !== 'undefined') {
    process.on('exit', () => clearInterval(checkInterval));
  }

  console.log('[El Panorama™] 📅 Weekly review cron scheduled (Monday 6am)');
}

async function runWeeklyReview() {
  console.log('[weekly-review] 📋 GTD Weekly Review — Lunes 6am');

  // 1. Re-register all MCP servers (discover new tools)
  try {
    const { registerAllMCPServers } = await import('./mcp-connections');
    await registerAllMCPServers();
  } catch (err) {
    console.error('[weekly-review] MCP refresh failed:', err);
  }

  // 2. Awwwards SOTD scrape (design learning)
  console.log('[weekly-review] 🎨 Awwwards SOTD — dispatching to research-esfera');

  const backend = typeof process !== 'undefined' && process.env
    ? process.env.NEXT_PUBLIC_SYNTHIA_BACKEND ?? 'http://localhost:8080'
    : 'http://localhost:8080';

  try {
    await fetch(`${backend}/el-panorama/misiones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: 'Revisión semanal: Scrape Awwwards SOTD',
        descripcion: 'Estudiar los 10 últimos SOTD. Actualizar patrones de diseño.',
        asignada_a: 'research-esfera',
        prioridad: 'alta',
        proximo_paso: 'Ejecutar brightdata_awwwards_sotd scraper',
        mesa_id: 'kupuri-media-mesa',
      }),
    });
  } catch (err) {
    console.error('[weekly-review] Could not create Awwwards misión:', err);
  }

  console.log('[weekly-review] ✅ Revisión semanal completada');
}
