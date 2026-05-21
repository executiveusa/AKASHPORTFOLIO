import { NextRequest, NextResponse } from 'next/server';
import { requireUser, toErrorResponse } from '@/lib/auth/guards';
import { supabaseAdmin } from '@/lib/supabase-client';

export const runtime = 'nodejs';

const SEED_SKILLS = [
  { id: 'web-research',    name: 'Investigación Web',    category: 'research',  description: 'Busca y sintetiza información en la web', tool_ids: ['web-search', 'browser'] },
  { id: 'content-writing', name: 'Redacción de Contenido', category: 'content', description: 'Crea artículos, emails y copy profesional', tool_ids: [] },
  { id: 'market-analysis', name: 'Análisis de Mercado',  category: 'research',  description: 'Analiza competidores, tendencias y oportunidades', tool_ids: ['web-search'] },
  { id: 'image-creation',  name: 'Creación de Imágenes', category: 'creative', description: 'Genera imágenes y activos visuales', tool_ids: ['image-gen'] },
  { id: 'video-production',name: 'Producción de Video',  category: 'creative', description: 'Genera guiones y coordina producción de video', tool_ids: ['video-gen'] },
  { id: 'data-analysis',   name: 'Análisis de Datos',   category: 'analytics', description: 'Procesa y visualiza datos en hojas de cálculo', tool_ids: ['spreadsheet'] },
  { id: 'email-outreach',  name: 'Outreach por Email',  category: 'sales',     description: 'Crea y envía secuencias de email personalizadas', tool_ids: ['email-send'] },
  { id: 'code-assistant',  name: 'Asistente de Código', category: 'technical', description: 'Genera, revisa y ejecuta código', tool_ids: ['code-exec'] },
];

export async function GET(_req: NextRequest) {
  try { await requireUser(); } catch (e) { return toErrorResponse(e); }

  const { data, error } = await supabaseAdmin
    .from('synthia_skills')
    .select('*')
    .order('name');

  if (error || !data || data.length === 0) {
    return NextResponse.json({ skills: SEED_SKILLS });
  }

  return NextResponse.json({ skills: data });
}
