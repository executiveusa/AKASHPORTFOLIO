/**
 * Income Automation — Stripe, PayPal, Crypto
 * ALEX™ Income Clerk module for autonomous payment processing
 *
 * All payment flows:
 * 1. Stripe — primary for USD invoices to US/EU clients
 * 2. PayPal — widely used across LATAM
 * 3. Crypto (Coinbase Commerce) — future-proof, no chargebacks
 */

// ─────────────────────────────────────────────────────────────────────────────
// STRIPE
// ─────────────────────────────────────────────────────────────────────────────

export interface StripeInvoiceParams {
  customerEmail: string;
  customerName: string;
  amountUSD: number; // in dollars (will be converted to cents)
  description: string;
  currency?: string;
  dueInDays?: number;
  metadata?: Record<string, string>;
}

export async function createStripeInvoice(
  params: StripeInvoiceParams
): Promise<{ success: boolean; invoiceUrl?: string; invoiceId?: string; error?: string }> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return { success: false, error: 'Stripe not configured' };

  const { customerEmail, customerName, amountUSD, description, currency = 'usd', dueInDays = 7, metadata } = params;

  try {
    // Create or retrieve customer
    const customerRes = await stripeRequest(secretKey, 'POST', '/v1/customers', {
      email: customerEmail,
      name: customerName,
      metadata: metadata ?? {},
    });
    const customerId = customerRes.id as string;

    // Create invoice item
    await stripeRequest(secretKey, 'POST', '/v1/invoiceitems', {
      customer: customerId,
      amount: Math.round(amountUSD * 100),
      currency,
      description,
    });

    // Create invoice
    const dueDate = Math.floor(Date.now() / 1000) + dueInDays * 86400;
    const invoice = await stripeRequest(secretKey, 'POST', '/v1/invoices', {
      customer: customerId,
      collection_method: 'send_invoice',
      due_date: dueDate,
      metadata: metadata ?? {},
    });

    // Finalize and send
    const finalized = await stripeRequest(secretKey, 'POST', `/v1/invoices/${invoice.id}/finalize`, {});
    await stripeRequest(secretKey, 'POST', `/v1/invoices/${invoice.id}/send`, {});

    return {
      success: true,
      invoiceId: finalized.id as string,
      invoiceUrl: finalized.hosted_invoice_url as string,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown Stripe error';
    console.error('Stripe invoice error:', msg);
    return { success: false, error: msg };
  }
}

export async function listStripePayments(limit = 10): Promise<Array<{
  id: string;
  amount: number;
  currency: string;
  status: string;
  customer?: string;
  created: number;
}>> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return [];

  try {
    const data = await stripeRequest(secretKey, 'GET', `/v1/payment_intents?limit=${limit}`, null);
    return ((data.data as any[]) ?? []).map((pi: {
      id: string;
      amount: number;
      currency: string;
      status: string;
      customer?: string;
      created: number;
    }) => ({
      id: pi.id,
      amount: pi.amount / 100,
      currency: pi.currency,
      status: pi.status,
      customer: pi.customer,
      created: pi.created,
    }));
  } catch {
    return [];
  }
}

async function stripeRequest(
  secretKey: string,
  method: string,
  path: string,
  body: Record<string, unknown> | null
): Promise<Record<string, unknown>> {
  const url = `https://api.stripe.com${path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${secretKey}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const options: RequestInit = { method, headers };
  if (body !== null) {
    options.body = new URLSearchParams(
      Object.entries(body).map(([k, v]) => [k, String(v)])
    ).toString();
  }

  const res = await fetch(url, options);
  const data = await res.json() as Record<string, unknown>;
  if (!res.ok) throw new Error(`Stripe ${method} ${path}: ${(data as { error?: { message?: string } }).error?.message ?? res.statusText}`);
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYPAL
// ─────────────────────────────────────────────────────────────────────────────

export interface PayPalInvoiceParams {
  recipientEmail: string;
  recipientName: string;
  amountUSD: number;
  description: string;
  currency?: string;
  note?: string;
}

export async function createPayPalInvoice(
  params: PayPalInvoiceParams
): Promise<{ success: boolean; invoiceId?: string; invoiceUrl?: string; error?: string }> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return { success: false, error: 'PayPal not configured' };
  }

  const { recipientEmail, recipientName, amountUSD, description, currency = 'USD', note } = params;

  try {
    // Get access token
    const tokenRes = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenRes.ok) throw new Error('PayPal auth failed');
    const tokenData = await tokenRes.json() as { access_token: string };
    const accessToken = tokenData.access_token;

    // Create invoice
    const invoicePayload = {
      detail: {
        currency_code: currency,
        note: note ?? description,
        payment_term: { term_type: 'NET_7' },
      },
      invoicer: {
        name: { given_name: 'Kupuri', surname: 'Media' },
        email_address: process.env.PAYPAL_IVETTE_EMAIL ?? '',
      },
      primary_recipients: [
        {
          billing_info: {
            name: { full_name: recipientName },
            email_address: recipientEmail,
          },
        },
      ],
      items: [
        {
          name: description,
          quantity: '1',
          unit_amount: { currency_code: currency, value: String(amountUSD.toFixed(2)) },
        },
      ],
    };

    const invoiceRes = await fetch('https://api-m.paypal.com/v2/invoicing/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(invoicePayload),
    });

    if (!invoiceRes.ok) throw new Error('PayPal invoice creation failed');
    const invoiceData = await invoiceRes.json() as { id: string; href?: string };

    // Send invoice
    await fetch(`https://api-m.paypal.com/v2/invoicing/invoices/${invoiceData.id}/send`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ send_to_invoicer: false }),
    });

    return {
      success: true,
      invoiceId: invoiceData.id,
      invoiceUrl: `https://www.paypal.com/invoice/p/#${invoiceData.id}`,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'PayPal error';
    console.error('PayPal invoice error:', msg);
    return { success: false, error: msg };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CRYPTO — Coinbase Commerce
// ─────────────────────────────────────────────────────────────────────────────

export interface CryptoChargeParams {
  name: string;
  description: string;
  amountUSD: number;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

export async function createCryptoCharge(
  params: CryptoChargeParams
): Promise<{ success: boolean; chargeId?: string; hostedUrl?: string; error?: string }> {
  const apiKey = process.env.COINBASE_COMMERCE_API_KEY;
  if (!apiKey) return { success: false, error: 'Coinbase Commerce not configured' };

  const { name, description, amountUSD, customerEmail, metadata } = params;

  try {
    const res = await fetch('https://api.commerce.coinbase.com/charges', {
      method: 'POST',
      headers: {
        'X-CC-Api-Key': apiKey,
        'X-CC-Version': '2018-03-22',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description,
        pricing_type: 'fixed_price',
        local_price: { amount: String(amountUSD.toFixed(2)), currency: 'USD' },
        metadata: {
          customer_email: customerEmail ?? '',
          ...metadata,
        },
        redirect_url: process.env.NEXT_PUBLIC_APP_URL
          ? `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`
          : undefined,
        cancel_url: process.env.NEXT_PUBLIC_APP_URL
          ? `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`
          : undefined,
      }),
    });

    if (!res.ok) throw new Error('Coinbase Commerce charge creation failed');
    const data = await res.json() as { data?: { id?: string; hosted_url?: string } };

    return {
      success: true,
      chargeId: data.data?.id,
      hostedUrl: data.data?.hosted_url,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Crypto error';
    console.error('Crypto charge error:', msg);
    return { success: false, error: msg };
  }
}
