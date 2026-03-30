import { NextResponse } from "next/server";

/**
 * GET /api/spheres/status — live sphere status feed
 * Returns each sphere with status: active | standby | error
 */
export const dynamic = "force-dynamic";

const SPHERES = [
  { id: "synthia",   name: "SYNTHIA",      role: "Coordinadora General",    color: "#8b5cf6" },
  { id: "alex",      name: "ALEX",         role: "Estratega Ejecutivo",     color: "#d4af37" },
  { id: "cazadora",  name: "CAZADORA",     role: "Cazadora de Oportunidades", color: "#ef4444" },
  { id: "forjadora", name: "FORJADORA",    role: "Arquitecta de Sistemas",  color: "#22c55e" },
  { id: "seductora", name: "SEDUCTORA",    role: "Closera Maestra",         color: "#eab308" },
  { id: "consejo",   name: "CONSEJO",      role: "Consejero Mayor",         color: "#1d4ed8" },
  { id: "economia",  name: "DR. ECONOMÍA", role: "Analista Financiero",     color: "#f97316" },
  { id: "cultura",   name: "DRA. CULTURA", role: "Estratega Cultural",      color: "#f43f5e" },
  { id: "teknos",    name: "ING. TEKNOS",  role: "Ingeniero de Sistemas",   color: "#06b6d4" },
];

export async function GET() {
  // In production: query DB / agent state store
  // For now: return stable standby state so the UI has something to show
  const spheres = SPHERES.map((s) => ({
    ...s,
    status: "standby" as const,
    task: null,
    last_active: null,
  }));

  return NextResponse.json({
    ok: true,
    spheres,
    active_count: 0,
    timestamp: new Date().toISOString(),
  });
}
