/**
 * Newsletter Subscribe API
 * POST /api/newsletter/subscribe
 *
 * Production: writes to Supabase newsletter_subscribers table.
 * Graceful degradation: if Supabase is unconfigured, returns 503 with clear message
 * rather than silently losing the subscriber in a Set<> that resets on every cold start.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';

interface SubscribeRequest {
  email: string;
  name?: string;
  source?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SubscribeRequest = await request.json();
    const { email, name, source = 'unknown' } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Dirección de correo inválida' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
      return NextResponse.json(
        {
          error: 'Newsletter service not configured',
          setup_required: true,
          message: 'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment variables',
        },
        { status: 503 }
      );
    }

    const { error: upsertError } = await supabaseAdmin
      .from('newsletter_subscribers')
      .upsert(
        {
          email: normalizedEmail,
          name: name || null,
          source,
          subscribed_at: new Date().toISOString(),
          status: 'active',
        },
        {
          onConflict: 'email',
          ignoreDuplicates: false,
        }
      );

    if (upsertError) {
      console.error('[newsletter] Supabase upsert error:', upsertError);
      return NextResponse.json(
        { error: 'Error al guardar suscripción', details: upsertError.message },
        { status: 500 }
      );
    }

    const { count } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    return NextResponse.json(
      {
        message: '¡Bienvenida a El Panorama Semanal de SYNTHIA™!',
        email: normalizedEmail,
        subscriberCount: count || 0,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[newsletter] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const configured = !!(supabaseUrl && !supabaseUrl.includes('placeholder'));

  if (!configured) {
    return NextResponse.json({ configured: false, subscribers: 0 });
  }

  const { count } = await supabaseAdmin
    .from('newsletter_subscribers')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  return NextResponse.json({
    configured: true,
    subscribers: count || 0,
    endpoint: 'POST /api/newsletter/subscribe',
  });
}
