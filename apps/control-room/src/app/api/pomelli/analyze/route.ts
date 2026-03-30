/**
 * /api/pomelli/analyze
 * POST { url: string }
 *
 * Proxy to Open-Pomelli Python service (localhost:8811 when running locally).
 * Falls back to a structured mock if the service is not running.
 */
import { NextRequest, NextResponse } from "next/server";

const POMELLI_BASE = process.env.POMELLI_API_URL ?? "http://localhost:8811";

export async function POST(req: NextRequest) {
  let body: { url?: string };
  try {
    body = await req.json() as { url?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { url } = body;
  if (!url || typeof url !== "string" || !url.startsWith("http")) {
    return NextResponse.json({ error: "url is required and must start with http" }, { status: 400 });
  }

  // Sanitise: only allow http/https URLs (prevent SSRF to internal services)
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json({ error: "Only http/https URLs are allowed" }, { status: 400 });
    }
    // Block private/loopback ranges to prevent SSRF
    const hostname = parsed.hostname.toLowerCase();
    const blocked = ["localhost", "127.0.0.1", "0.0.0.0", "::1", "169.254", "10.", "192.168.", "172.16.", "172.17.", "172.18.", "172.19.", "172.20.", "172.21.", "172.22.", "172.23.", "172.24.", "172.25.", "172.26.", "172.27.", "172.28.", "172.29.", "172.30.", "172.31."];
    if (blocked.some(b => hostname.startsWith(b) || hostname === b.replace(".", ""))) {
      return NextResponse.json({ error: "URL not allowed" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
  }

  // Try live Pomelli service
  try {
    const upstream = await fetch(`${POMELLI_BASE}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(25_000),
    });

    if (upstream.ok) {
      const data = await upstream.json();
      return NextResponse.json(data);
    }
  } catch {
    // Service not running — fall through to mock
  }

  // Structured mock response (shown in demo/dev when Pomelli is offline)
  const hostname = new URL(url).hostname.replace("www.", "");
  const company = hostname.split(".")[0];
  const capitalized = company.charAt(0).toUpperCase() + company.slice(1);

  return NextResponse.json({
    url,
    companyName: capitalized,
    industry: "Detectando vía análisis visual...",
    colors: ["#1a1208", "#f5d78c", "#f5efe4", "#2e2210"],
    tone: "Profesional, aspiracional, orientado a resultados",
    targetAudience: "Empresarias 30-50 años con negocio establecido en LATAM/USA",
    keyMessages: [
      "Automatización sin esfuerzo técnico",
      "ROI medible en 90 días",
      "Soporte humano + IA 24/7",
    ],
    campaignAngles: [
      "Caso estudio: antes/después de implementar IA en este negocio",
      "Testimonio del fundador/a sobre tiempo recuperado",
      "Desglose ROI: costo de Synthia vs. costo de empleado adicional",
      "Demostración en vivo: lo que hace Synthia™ en 1 hora",
    ],
    platforms: ["LinkedIn", "Instagram", "Email"],
    _mock: true,
  });
}
