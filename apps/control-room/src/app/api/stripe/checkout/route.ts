import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS, PlanId } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { planId, email, successUrl, cancelUrl } = await req.json() as {
      planId: PlanId;
      email?: string;
      successUrl?: string;
      cancelUrl?: string;
    };

    const plan = PLANS[planId];
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 400 });
    }

    if (plan.priceMonthlyUsd === 0) {
      return NextResponse.json({ error: "Free plan requires no checkout" }, { status: 400 });
    }

    if (!plan.priceId) {
      return NextResponse.json(
        { error: `Stripe price ID not configured for plan: ${planId}` },
        { status: 500 }
      );
    }

    const origin = req.nextUrl.origin;
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: plan.priceId, quantity: 1 }],
      customer_email: email,
      success_url: successUrl ?? `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl ?? `${origin}/precios`,
      metadata: { planId },
      subscription_data: {
        metadata: { planId },
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok", plans: Object.keys(PLANS) });
}
