import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sanitizeText, sanitizeForLLM } from '@/lib/sanitize';

interface OnboardingAnswers {
  biz: string;
  revenue: string;
  team: string;
  pain: string;
  goal: string;
}

function recommendSpheres(answers: OnboardingAnswers): string[] {
  const spheres: string[] = ['synthia', 'alex'];
  const pain = answers.pain.toLowerCase();
  const biz = answers.biz.toLowerCase();
  const goal = answers.goal.toLowerCase();

  if (pain.includes('marketing') || biz.includes('content') || goal.includes('redes')) {
    spheres.push('dra-cultura');
  }
  if (pain.includes('ventas') || goal.includes('client') || goal.includes('cerrar')) {
    spheres.push('cazadora', 'seductora');
  }
  if (pain.includes('finanzas') || pain.includes('dinero') || goal.includes('ingresos')) {
    spheres.push('dr-economia');
  }
  if (pain.includes('sistema') || pain.includes('techn') || biz.includes('tech')) {
    spheres.push('ing-teknos', 'forjadora');
  }
  if (answers.team.includes('solo') || answers.team.includes('1')) {
    spheres.push('consejo');
  }

  return [...new Set(spheres)];
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: OnboardingAnswers;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const safeAnswers: OnboardingAnswers = {
    biz: '',
    revenue: '',
    team: '',
    pain: '',
    goal: '',
  };

  for (const key of ['biz', 'revenue', 'team', 'pain', 'goal'] as const) {
    const raw = String(body[key] || '');
    const { clean, blocked } = sanitizeForLLM(raw);
    if (blocked) {
      return NextResponse.json({ error: 'Entrada no válida' }, { status: 400 });
    }
    safeAnswers[key] = sanitizeText(clean, 500);
  }

  const recommendedSpheres = recommendSpheres(safeAnswers);

  try {
    const { supabaseAdmin } = await import('@/lib/supabase-client');

    const { error: insertError } = await supabaseAdmin.from('agent_tasks').insert({
      task_type: 'onboarding_survey',
      input: {
        userEmail: session.user.email,
        answers: safeAnswers,
        recommendedSpheres,
        completedAt: new Date().toISOString(),
      },
      status: 'completed',
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error('[onboarding/save] Supabase insert error:', insertError.message);
    }

    await supabaseAdmin.from('agent_memory').upsert({
      key: `onboarding:${session.user.email}`,
      agent_id: 'synthia',
      value: JSON.stringify({
        answers: safeAnswers,
        recommendedSpheres,
        completedAt: new Date().toISOString(),
      }),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'key' });

    return NextResponse.json({
      success: true,
      recommendedSpheres,
      message: 'Cuestionario guardado. Tus Spheres han sido activados.',
    });
  } catch (err) {
    console.error('[onboarding/save] Error:', (err as Error).message);
    return NextResponse.json({ error: 'Error guardando respuestas' }, { status: 500 });
  }
}
