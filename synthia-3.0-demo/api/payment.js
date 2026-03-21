/**
 * POST /api/payment
 * Synthia 3.0 — Creem.io Checkout Session
 * Creates a hosted checkout link for Synthia Pro subscription.
 *
 * Body: { productId?: string, email?: string, successUrl?: string }
 * Response: { checkoutUrl, sessionId }
 */

export const config = { runtime: 'edge' };

// Synthia Pro product IDs — update once production products are created in Creem dashboard
const PRODUCTS = {
  starter: process.env.CREEM_PRODUCT_STARTER || 'prod_starter_placeholder',
  pro:     process.env.CREEM_PRODUCT_PRO     || 'prod_pro_placeholder',
  agency:  process.env.CREEM_PRODUCT_AGENCY  || 'prod_agency_placeholder',
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const apiKey = process.env.CREEM_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'CREEM_API_KEY not set' }),
      { status: 503, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  const {
    productId = 'pro',
    email,
    successUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://synthia.kupurimedia.com'}/welcome`,
    cancelUrl  = `${process.env.NEXT_PUBLIC_BASE_URL  || 'https://synthia.kupurimedia.com'}/?cancelled=true`,
  } = body;

  const resolvedProductId = PRODUCTS[productId] || productId;

  try {
    const creemRes = await fetch('https://api.creem.io/v1/checkouts', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: resolvedProductId,
        ...(email ? { customer_email: email } : {}),
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          source: 'synthia-3.0-demo',
          product_tier: productId,
        },
      }),
    });

    const data = await creemRes.json();

    if (!creemRes.ok) {
      console.error('Creem error:', data);
      return new Response(
        JSON.stringify({ error: data?.message || 'Payment session creation failed', detail: data }),
        { status: creemRes.status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    return new Response(
      JSON.stringify({
        checkoutUrl: data.checkout_url || data.url,
        sessionId: data.id || data.session_id,
        productTier: productId,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (err) {
    console.error('Payment route error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Payment failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
