/**
 * P.A.S.S.™ Copy Engine — Problem → Amplification → Solution → System
 * Generates all website copy for the site factory
 * Spanish-first. LATAM entrepreneurs. Zero AI slop.
 * Uses Claude via Anthropic API for high-quality copy generation
 */

export interface PassCopy {
  hero_headline: string;
  hero_subline: string;
  problem_statement: string;
  amplification: string;
  solution: string;
  system_proof: string;
  services: Array<{ title: string; description: string }>;
  trust_signals: string[];
  cta_primary: string;
  cta_secondary: string;
  footer_tagline: string;
}

/**
 * Generate full P.A.S.S.™ copy for a business
 * Problem → Amplification → Solution → System
 */
export async function generatePassCopy(params: {
  businessName: string;
  niche: string;
  city: string;
  blueprint: { hero_headline: string; cta_text: string; key_trust_signals: string[] };
  competitorStrengths: string[];
  language?: string;
}): Promise<PassCopy> {
  const lang = params.language ?? 'es';
  const isSpanish = lang === 'es';

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY ?? '';
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        system: `You are SYNTHIA™, a P.A.S.S.™ copy specialist for LATAM businesses.
P.A.S.S.™ = Problem → Amplification → Solution → System.
Write compelling, specific, non-generic business copy.
Respond ONLY with valid JSON. No markdown. No explanation.`,
        messages: [
          {
            role: 'user',
            content: `Generate website copy for ${params.businessName}, a ${params.niche.replace(/_/g, ' ')} business in ${params.city}.

Competitors excel at: ${params.competitorStrengths.join(', ')}.

Return JSON with these exact keys:
{
  "hero_headline": "compelling headline in ${lang}, max 8 words",
  "hero_subline": "supporting line in ${lang}, max 15 words",
  "problem_statement": "what problem this business solves, 1 sentence",
  "amplification": "why this problem matters/costs them, 1-2 sentences",
  "solution": "how this business specifically solves it, 1-2 sentences",
  "system_proof": "why they can trust this business, 1 sentence",
  "services": [{"title": "string", "description": "string"}],
  "trust_signals": ["string", "string", "string"],
  "cta_primary": "action button text, max 5 words",
  "cta_secondary": "secondary CTA, max 5 words",
  "footer_tagline": "brand tagline, max 8 words"
}`,
          },
        ],
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (response.ok) {
      const data = await response.json() as { content: Array<{ text: string }> };
      const text = data.content[0]?.text ?? '{}';
      const cleaned = text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned) as PassCopy;
    }
  } catch {
    // Fall through to default copy
  }

  return generateFallbackCopy(params, isSpanish);
}

function generateFallbackCopy(
  params: {
    businessName: string;
    niche: string;
    city: string;
    blueprint: { hero_headline: string; cta_text: string };
  },
  isSpanish: boolean
): PassCopy {
  const n = params.businessName;
  const c = params.city;

  return {
    hero_headline: params.blueprint.hero_headline,
    hero_subline: isSpanish
      ? `Servicio profesional en ${c}. Resultados garantizados.`
      : `Professional service in ${c}. Guaranteed results.`,
    problem_statement: isSpanish
      ? `Encontrar un ${params.niche.replace(/_/g, ' ')} confiable en ${c} es difícil.`
      : `Finding reliable ${params.niche.replace(/_/g, ' ')} in ${c} is hard.`,
    amplification: isSpanish
      ? `Cada día sin el servicio correcto cuesta tiempo y dinero. La calidad importa.`
      : `Every day without the right service costs time and money.`,
    solution: isSpanish
      ? `${n} ofrece exactamente lo que necesitas, cuando lo necesitas, con garantía de satisfacción.`
      : `${n} offers exactly what you need, guaranteed.`,
    system_proof: isSpanish
      ? `Más de 500 clientes satisfechos en ${c} confían en nosotros.`
      : `Over 500 satisfied clients in ${c} trust us.`,
    services: [
      {
        title: isSpanish ? 'Servicio Premium' : 'Premium Service',
        description: isSpanish ? 'Calidad de primera' : 'First-class quality',
      },
      {
        title: isSpanish ? 'Atención Personalizada' : 'Personalized Care',
        description: isSpanish ? 'Cada cliente es único' : 'Every client is unique',
      },
      {
        title: isSpanish ? 'Resultados Garantizados' : 'Guaranteed Results',
        description: isSpanish ? 'Tu satisfacción es nuestra meta' : 'Your satisfaction is our goal',
      },
    ],
    trust_signals: [
      isSpanish ? '10+ años de experiencia' : '10+ years experience',
      isSpanish ? '500+ clientes satisfechos' : '500+ happy clients',
      isSpanish ? 'Respuesta en 24 horas' : '24-hour response',
    ],
    cta_primary: isSpanish ? params.blueprint.cta_text : 'Get Started',
    cta_secondary: isSpanish ? 'Ver más' : 'Learn more',
    footer_tagline: isSpanish ? `Excelencia en ${c}` : `Excellence in ${c}`,
  };
}
