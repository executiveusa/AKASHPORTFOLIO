import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

const supabaseAdmin = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  : null;

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
  }

  if (!stripe) {
    return NextResponse.json({ error: "Payment service not configured" }, { status: 503 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  } catch (err) {
    console.error("[stripe/webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await upsertSubscription({
          customerId: session.customer as string,
          subscriptionId: session.subscription as string,
          email: session.customer_email ?? "",
          planId: session.metadata?.planId ?? "creador",
          status: "active",
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await upsertSubscription({
          customerId: sub.customer as string,
          subscriptionId: sub.id,
          email: "",
          planId: (sub.metadata?.planId as string) ?? "creador",
          status: sub.status === "active" ? "active" : sub.status === "past_due" ? "past_due" : "canceled",
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await upsertSubscription({
          customerId: sub.customer as string,
          subscriptionId: sub.id,
          email: "",
          planId: "lector",
          status: "canceled",
        });
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error(`[stripe/webhook] handler error for ${event.type}:`, err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function upsertSubscription(data: {
  customerId: string;
  subscriptionId: string;
  email: string;
  planId: string;
  status: string;
}) {
  if (!supabaseAdmin) {
    console.warn("[stripe/webhook] Supabase not configured — skipping subscription upsert");
    return;
  }

  const { error } = await supabaseAdmin
    .from("subscriptions")
    .upsert(
      {
        stripe_customer_id: data.customerId,
        stripe_subscription_id: data.subscriptionId,
        email: data.email || undefined,
        plan_id: data.planId,
        status: data.status,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "stripe_subscription_id" }
    );

  if (error) {
    console.error("[stripe/webhook] Supabase upsert error:", error);
  }
}
