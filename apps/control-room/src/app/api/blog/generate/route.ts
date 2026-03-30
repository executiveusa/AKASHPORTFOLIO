import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

/**
 * POST /api/blog/generate
 * ALEX™ auto-generates a new blog post on a requested topic.
 * Returns HTML content ready for the blog.
 */

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SEO_TOPICS = [
  'automatización con IA para pequeñas empresas',
  'cómo usar ChatGPT para marketing en español',
  'arbitraje de divisas LATAM para freelancers',
  'herramientas de IA gratuitas para emprendedoras',
  'cómo cobrar en dólares desde México',
  'agencias digitales con IA: cómo empezar',
  'email marketing automatizado con IA',
  'SEO en español: guía para 2025',
];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const topic: string = body.topic ?? SEO_TOPICS[Math.floor(Math.random() * SEO_TOPICS.length)];
  const lang: string = body.lang ?? 'es';

  const systemPrompt = lang === 'es'
    ? `Eres ALEX™, escritora de contenido de Kupuri Media™. Escribes artículos de blog en español de México (CDMX), útiles, directos y orientados a ayudar a emprendedoras latinas con IA y automatización. Tono: profesional pero cálido. Sin fluff. Sin introducción genérica.`
    : `You are ALEX™, content writer for Kupuri Media™. Write blog posts in English, helpful, direct, targeting LATAM women entrepreneurs interested in AI and automation. Tone: professional but warm. No fluff. No generic intro.`;

  const userPrompt = `Escribe un artículo de blog completo sobre: "${topic}".

Formato requerido (responde SOLO con JSON):
{
  "title": "Título del artículo (10-60 caracteres, llamativo)",
  "excerpt": "Resumen de 1-2 oraciones para SEO (120-160 caracteres)",
  "tags": ["tag1", "tag2", "tag3"],
  "html": "<p>Cuerpo completo del artículo en HTML...</p>"
}

El artículo debe tener:
- Al menos 600 palabras
- Subtítulos (h2, h3)
- Listas donde ayuden
- Un CTA al final mencionando Kupuri Media™ o ALEX™
- Keywords naturales para SEO`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    // Extract JSON from response (may be wrapped in markdown code block)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Invalid response format from AI' }, { status: 500 });
    }

    const post = JSON.parse(jsonMatch[0]) as {
      title: string;
      excerpt: string;
      tags: string[];
      html: string;
    };

    // Build a URL-safe slug
    const slug = post.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 80);

    const date = new Date().toISOString().split('T')[0];

    return NextResponse.json({
      slug,
      title: post.title,
      excerpt: post.excerpt,
      date,
      tags: post.tags,
      html: post.html,
      topic,
      generatedBy: 'ALEX™',
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Generation failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ topics: SEO_TOPICS });
}
