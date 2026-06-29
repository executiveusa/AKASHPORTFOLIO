/**
 * Next.js middleware — auth gate + subscription awareness.
 *
 * Free (unauthenticated) routes: landing, auth flows, public APIs, webhooks.
 * All other routes: require authenticated Google session.
 * Subscription enforcement: enabled when STRIPE_ENABLED=true (off by default).
 */

import { auth } from "@/auth";
import { NextResponse } from "next/server";

const FREE_PREFIXES = [
  "/",
  "/auth",
  "/landing",
  "/landing-index",
  "/privacy",
  "/api/auth",
  "/api/onboarding",
  "/api/beta",
  "/api/webhooks",
  "/api/health",
];

function isFree(pathname: string): boolean {
  if (pathname === "/") return true;
  return FREE_PREFIXES.some(
    (p) => p !== "/" && pathname.startsWith(p)
  );
}

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (isFree(pathname)) return NextResponse.next();

  if (!req.auth) {
    const signIn = new URL("/auth/signin", req.url);
    signIn.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(signIn);
  }

  // Stripe subscription gate — only active when explicitly enabled.
  // Wire it now, flip the switch by setting STRIPE_ENABLED=true in Vercel.
  if (process.env.STRIPE_ENABLED === "true") {
    const planId = (req.auth as { planId?: string }).planId ?? "lector";
    const subStatus = (req.auth as { subStatus?: string }).subStatus;

    const PREMIUM_PREFIXES = ["/cockpit", "/agents", "/panorama", "/casos", "/chat", "/settings/billing"];
    const needsPlan = PREMIUM_PREFIXES.some((p) => pathname.startsWith(p));

    if (needsPlan && (!subStatus || subStatus === "canceled" || planId === "lector")) {
      return NextResponse.redirect(new URL("/cockpit/subscriptions", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|eot)).*)"],
};
