/**
 * Social Media Automation — KUPURI MEDIA™
 *
 * Auto-creates viral demos and posts across platforms with A/B testing.
 * Tracks performance and automatically scales winners.
 * Integrates with Indigo (growth) and Lapina (content) agents.
 */

import { callMiniMax } from './minimax';
import { synthiaObservability } from './observability';
import { agentMail } from './agent-mail';

export type Platform = 'tiktok' | 'instagram' | 'twitter' | 'linkedin' | 'youtube_shorts';
export type ContentType = 'demo_video' | 'carousel' | 'thread' | 'short_post' | 'long_form' | 'story';
export type ABVariant = 'A' | 'B' | 'C';
export type CampaignStatus = 'draft' | 'scheduled' | 'live' | 'completed' | 'paused';

export interface ContentVariant {
  id: string;
  variant: ABVariant;
  hook: string;           // Opening line / attention grabber
  body: string;           // Main content
  cta: string;            // Call to action
  hashtags: string[];
  visualNotes: string;    // Description for visual production
  platform: Platform;
  metrics?: {
    views: number;
    engagement: number;   // likes + comments + shares
    clicks: number;
    leads: number;
    engagementRate: number;
  };
  winner?: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  objective: 'brand_awareness' | 'lead_gen' | 'demo_viral' | 'client_showcase' | 'thought_leadership';
  targetAudience: string;
  platforms: Platform[];
  variants: ContentVariant[];
  status: CampaignStatus;
  createdAt: string;
  scheduledAt?: string;
  completedAt?: string;
  winner?: ContentVariant;
  totalReach: number;
  totalLeads: number;
  notes: string;
}

const campaigns: Map<string, Campaign> = new Map();

const PLATFORM_SPECS: Record<Platform, {
  maxChars: number;
  bestHookLength: number;
  contentNotes: string;
  postingTimes: string[];
}> = {
  tiktok: {
    maxChars: 150,
    bestHookLength: 10,
    contentNotes: 'Hook en primeros 3 segundos. Música de tendencia. Subtítulos obligatorios. Vertical 9:16.',
    postingTimes: ['07:00', '12:00', '19:00', '21:00'],
  },
  instagram: {
    maxChars: 2200,
    bestHookLength: 125,
    contentNotes: 'Primera línea debe detener el scroll. Carruseles generan más saves. Stories complementan posts.',
    postingTimes: ['07:00', '11:00', '13:00', '17:00', '21:00'],
  },
  twitter: {
    maxChars: 280,
    bestHookLength: 280,
    contentNotes: 'Threads para contenido largo. Hooks controversiales pero verídicos. Responde rápido para engagement.',
    postingTimes: ['08:00', '12:00', '17:00', '21:00'],
  },
  linkedin: {
    maxChars: 3000,
    bestHookLength: 200,
    contentNotes: 'Narrativa personal resonante. Insights de industria. Primera línea antes del "ver más" es crítica.',
    postingTimes: ['07:30', '12:00', '17:30'],
  },
  youtube_shorts: {
    maxChars: 500,
    bestHookLength: 15,
    contentNotes: 'Valor entregado en primeros 15s. CTA al final. Subtítulos siempre. 60s máximo.',
    postingTimes: ['09:00', '15:00', '20:00'],
  },
};

/**
 * Generate A/B/C content variants for a given brief.
 */
export async function generateVariants(
  brief: {
    objective: Campaign['objective'];
    platform: Platform;
    keyMessage: string;
    targetAudience: string;
    brand: string;
    examples?: string;
  }
): Promise<ContentVariant[]> {
  const specs = PLATFORM_SPECS[brief.platform];

  const prompt = `Eres Lapina, la Content Creator de KUPURI MEDIA™, y Indigo, el Growth Hacker. Juntos crean contenido viral para ${brief.brand}.

BRIEF:
- Plataforma: ${brief.platform}
- Objetivo: ${brief.objective}
- Mensaje clave: ${brief.keyMessage}
- Audiencia objetivo: ${brief.targetAudience}
${brief.examples ? `- Ejemplos de referencia: ${brief.examples}` : ''}

SPECS DE PLATAFORMA:
- Máximo caracteres: ${specs.maxChars}
- Longitud ideal del hook: ${specs.bestHookLength} chars
- Notas: ${specs.contentNotes}

Crea 3 variantes (A, B, C) con DIFERENTES hooks pero el mismo mensaje central.
- Variante A: Hook educativo ("¿Sabías que...")
- Variante B: Hook provocativo / desafío ("La mayoría de [audiencia] comete este error...")
- Variante C: Hook de historia / resultados ("En [tiempo corto] logramos [resultado específico]...")

Responde en JSON:
{
  "variants": [
    {
      "variant": "A",
      "hook": "<primera línea impactante>",
      "body": "<contenido principal>",
      "cta": "<llamada a la acción>",
      "hashtags": ["tag1", "tag2", "tag3"],
      "visualNotes": "<descripción de lo visual>"
    },
    { ... B ... },
    { ... C ... }
  ]
}`;

  try {
    const response = await callMiniMax([{ role: 'user', content: prompt }]);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return (parsed.variants || []).map((v: Omit<ContentVariant, 'id' | 'platform'>) => ({
        ...v,
        id: `variant-${v.variant}-${Date.now()}`,
        platform: brief.platform,
      }));
    }
  } catch (err) {
    synthiaObservability.logEvent({
      type: 'error',
      summary: 'Error generando variantes de contenido',
      data: { error: String(err) },
    });
  }

  return [];
}

/**
 * Create a new A/B test campaign.
 */
export async function createCampaign(
  name: string,
  objective: Campaign['objective'],
  keyMessage: string,
  targetAudience: string,
  platforms: Platform[]
): Promise<Campaign> {
  const id = `campaign-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const allVariants: ContentVariant[] = [];
  for (const platform of platforms) {
    const variants = await generateVariants({
      objective,
      platform,
      keyMessage,
      targetAudience,
      brand: 'KUPURI MEDIA',
    });
    allVariants.push(...variants);
  }

  const campaign: Campaign = {
    id,
    name,
    objective,
    targetAudience,
    platforms,
    variants: allVariants,
    status: 'draft',
    createdAt: new Date().toISOString(),
    totalReach: 0,
    totalLeads: 0,
    notes: `Campaña creada automáticamente por Synthia 3.0. ${allVariants.length} variantes generadas para ${platforms.length} plataformas.`,
  };

  campaigns.set(id, campaign);

  synthiaObservability.logEvent({
    type: 'success',
    summary: `Campaña de contenido creada: ${name}`,
    data: { campaignId: id, variants: allVariants.length, platforms },
  });

  // Notify Indigo and Lapina
  agentMail.send({
    from: 'synthia-prime',
    to: ['indigo', 'lapina'],
    subject: `[CAMPAÑA] Nueva campaña creada: ${name}`,
    body: `Nueva campaña de A/B testing lista para revisión.\n\nObjectivo: ${objective}\nPlataformas: ${platforms.join(', ')}\nVariantes: ${allVariants.length}\n\nRevisen el Control Room para aprobar y programar publicación.`,
    type: 'task',
    priority: 'high',
    metadata: { taskId: id },
  });

  return campaign;
}

/**
 * Simulate recording performance metrics for a campaign (in production, connects to platform APIs).
 */
export function recordMetrics(
  campaignId: string,
  variantId: string,
  metrics: ContentVariant['metrics']
): void {
  const campaign = campaigns.get(campaignId);
  if (!campaign) return;

  const variant = campaign.variants.find(v => v.id === variantId);
  if (!variant) return;

  variant.metrics = metrics;

  // Auto-determine winner if all variants have metrics
  const variantsWithMetrics = campaign.variants.filter(v => v.metrics);
  if (variantsWithMetrics.length === campaign.variants.length) {
    const winner = variantsWithMetrics.sort((a, b) => {
      const scoreA = (a.metrics!.leads * 10) + (a.metrics!.engagementRate * 5) + (a.metrics!.clicks);
      const scoreB = (b.metrics!.leads * 10) + (b.metrics!.engagementRate * 5) + (b.metrics!.clicks);
      return scoreB - scoreA;
    })[0];

    winner.winner = true;
    campaign.winner = winner;
    campaign.status = 'completed';

    agentMail.send({
      from: 'morpho',
      to: ['synthia-prime', 'indigo', 'lapina'],
      subject: `🏆 [GANADOR A/B] Campaña: ${campaign.name}`,
      body: `Variante ${winner.variant} es la ganadora con:\n- Leads: ${winner.metrics!.leads}\n- Engagement rate: ${winner.metrics!.engagementRate}%\n- Clicks: ${winner.metrics!.clicks}\n\nHook ganador: "${winner.hook}"\n\nRecomendación: Escalar variante ${winner.variant} en todos los canales activos.`,
      type: 'report',
      priority: 'high',
    });
  }

  campaigns.set(campaignId, campaign);
}

/**
 * Generate a viral demo campaign automatically.
 */
export async function createViralDemo(
  serviceName: string,
  keyBenefit: string,
  evidence: string
): Promise<Campaign> {
  return createCampaign(
    `Demo Viral: ${serviceName}`,
    'demo_viral',
    `${serviceName}: ${keyBenefit}. Evidencia: ${evidence}`,
    'Emprendedores y agencias en LATAM buscando escalar su marketing digital',
    ['tiktok', 'instagram', 'linkedin']
  );
}

export function getCampaigns(limit = 20): Campaign[] {
  return Array.from(campaigns.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export function getCampaign(id: string): Campaign | undefined {
  return campaigns.get(id);
}

export function getActiveCampaigns(): Campaign[] {
  return Array.from(campaigns.values()).filter(c => c.status === 'live' || c.status === 'scheduled');
}
