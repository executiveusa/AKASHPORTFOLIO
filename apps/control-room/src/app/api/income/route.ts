/**
 * POST /api/income — ALEX™ Income Clerk
 * Unified endpoint for Stripe, PayPal, and Crypto invoice creation
 *
 * Body: { provider, ...params }
 * Providers: 'stripe' | 'paypal' | 'crypto'
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createStripeInvoice,
  createPayPalInvoice,
  createCryptoCharge,
  listStripePayments,
} from '@/lib/income-automation';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      provider: 'stripe' | 'paypal' | 'crypto';
      [key: string]: unknown;
    };

    const { provider } = body;

    switch (provider) {
      case 'stripe': {
        const result = await createStripeInvoice({
          customerEmail: body.customerEmail as string,
          customerName: body.customerName as string,
          amountUSD: Number(body.amountUSD),
          description: body.description as string,
          currency: body.currency as string | undefined,
          dueInDays: body.dueInDays as number | undefined,
          metadata: body.metadata as Record<string, string> | undefined,
        });
        return NextResponse.json(result, { status: result.success ? 201 : 400 });
      }

      case 'paypal': {
        const result = await createPayPalInvoice({
          recipientEmail: body.recipientEmail as string,
          recipientName: body.recipientName as string,
          amountUSD: Number(body.amountUSD),
          description: body.description as string,
          currency: body.currency as string | undefined,
          note: body.note as string | undefined,
        });
        return NextResponse.json(result, { status: result.success ? 201 : 400 });
      }

      case 'crypto': {
        const result = await createCryptoCharge({
          name: body.name as string,
          description: body.description as string,
          amountUSD: Number(body.amountUSD),
          customerEmail: body.customerEmail as string | undefined,
          metadata: body.metadata as Record<string, string> | undefined,
        });
        return NextResponse.json(result, { status: result.success ? 201 : 400 });
      }

      default:
        return NextResponse.json(
          { error: 'provider must be stripe | paypal | crypto' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Income API error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const provider = req.nextUrl.searchParams.get('provider') ?? 'stripe';
  const limit = Number(req.nextUrl.searchParams.get('limit') ?? '10');

  if (provider === 'stripe') {
    const payments = await listStripePayments(limit);
    return NextResponse.json({ payments });
  }

  return NextResponse.json({ error: 'GET only supported for stripe' }, { status: 400 });
}
