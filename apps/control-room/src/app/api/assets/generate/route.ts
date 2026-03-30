/**
 * /api/assets/generate — Asset Generator Route
 * Bead B4: Generates HTML/CSS/copy assets from voice or text input.
 * Supports: voice-to-landing-page, social copy, email draft, council report.
 */

import { NextRequest, NextResponse } from 'next/server';
import { callLLM } from '@/lib/litellm-gateway';
import { secrets } from '@/lib/secrets-client';

export const runtime = 'nodejs';
export const maxDuration = 30;

type AssetType = 'landing-page' | 'social-post' | 'email-draft' | 'council-report' | 'onboarding-step';

interface GenerateRequest {
  type: AssetType;
  prompt: string;
  brand?: string;        // e.g. "Kupuri Media" — defaults to Kupuri Media
  lang?: 'es' | 'en';
  sphereId?: string;     // which sphere is requesting
}

interface GenerateResponse {
  type: AssetType;
  content: string;
  model: string;
  tokensUsed?: number;
}

const ASSET_SYSTEM_PROMPTS: Record<AssetType, string> = {
  'landing-page': `Eres un diseñador web experto en LATAM SaaS. Genera HTML + CSS inline completo para una landing page
minimalista. Sin glassmorphism, sin gradientes, sin efectos de burbuja. Paleta: negro/charcoal + dorado.
Máximo 2 secciones: hero + CTA. Solo devuelve el HTML, sin explicaciones.`,

  'social-post': `Eres una estratega de contenido para LATAM. Genera un post para redes sociales (LinkedIn/Instagram)
que suene humano, no como IA. Tono: emprendedora exitosa de CDMX. Emoji mínimos (máximo 2). Sin hashtag spam.`,

  'email-draft': `Eres una redactora de negocios en español mexicano. Genera un email de negocios profesional pero cálido.
Sin frases genéricas de IA. Sin "espero que este email te encuentre bien". Directo, accionable.`,

  'council-report': `Eres la síntesis del Consejo de Esferas SYNTHIA™. Genera un reporte ejecutivo conciso del estado del consejo.
Formato: 3 secciones (Situación, Decisiones, Próximos pasos). Máximo 300 palabras.`,

  'onboarding-step': `Eres ALEX™, guide de onboarding de SYNTHIA™. Genera el texto para un paso del onboarding.
Tono: amigable, CDMX, no técnico. Celebra el progreso. Máximo 2 párrafos.`,
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Validate CRON_SECRET or any auth header to prevent abuse
  const cronSecret = secrets.vapiPrivateKey() ? process.env.CRON_SECRET : null;
  const authHeader = req.headers.get('authorization');
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  let body: GenerateRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { type, prompt, brand = 'Kupuri Media', lang = 'es', sphereId } = body;

  if (!type || !prompt) {
    return NextResponse.json({ error: 'type and prompt are required' }, { status: 400 });
  }

  if (!ASSET_SYSTEM_PROMPTS[type]) {
    return NextResponse.json({ error: `Unknown asset type: ${type}` }, { status: 400 });
  }

  try {
    const systemPrompt = ASSET_SYSTEM_PROMPTS[type];
    const userPrompt = `Marca: ${brand}\nIdioma: ${lang === 'es' ? 'Español mexicano' : 'English'}\nSolicitud: ${prompt}`;

    const result = await callLLM(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        model: 'claude-opus-4-5',
        maxTokens: type === 'landing-page' ? 2048 : 512,
        temperature: type === 'landing-page' ? 0.5 : 0.8,
        sphereId: sphereId as any,
      }
    );

    // Persist to Supabase if we have a session
    try {
      const { supabaseAdmin } = await import('@/lib/supabase-client');
      await supabaseAdmin.from('generated_assets').insert({
        type,
        prompt,
        content: result.content,
        model: result.model,
        sphere_id: sphereId ?? null,
        lang,
        created_at: new Date().toISOString(),
      });
    } catch { /* non-critical — asset still returned */ }

    const response: GenerateResponse = {
      type,
      content: result.content,
      model: result.model,
      tokensUsed: (result.inputTokens ?? 0) + (result.outputTokens ?? 0),
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('[assets/generate] error:', (err as Error).message);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
