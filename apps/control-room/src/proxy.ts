import { auth } from "@/auth";
import { NextResponse, type NextRequest } from "next/server";

interface AuthRequest extends NextRequest {
  auth?: { user?: unknown; planId?: string; subStatus?: string } | null;
}

export default auth((req: AuthRequest) => {
  const isLoggedIn = !!req.auth?.user;
  if (!isLoggedIn) {
    const signInUrl = new URL('/auth/signin', req.url);
    signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Stripe subscription gate — flip STRIPE_ENABLED=true in Vercel to activate
  if (process.env.STRIPE_ENABLED === "true") {
    const planId = req.auth?.planId ?? "lector";
    const subStatus = req.auth?.subStatus;
    const { pathname } = req.nextUrl;

    const PREMIUM_PREFIXES = ["/cockpit", "/panorama", "/casos", "/chat", "/integraciones"];
    const needsPlan = PREMIUM_PREFIXES.some((p) => pathname.startsWith(p));

    if (needsPlan && (!subStatus || subStatus === "canceled" || planId === "lector")) {
      return NextResponse.redirect(new URL("/cockpit/subscriptions", req.url));
    }
  }
});

export const config = {
  matcher: [
    '/cockpit(.*)',
    '/dashboard(.*)',
    '/spheres(.*)',
    '/panorama(.*)',
    '/chat(.*)',
    '/casos(.*)',
    '/watcher(.*)',
    '/integraciones(.*)',
    '/theater(.*)',
    '/skills(.*)',
    '/synthia(.*)',
    '/newspaper(.*)',
    '/coordination(.*)',
    '/alex(.*)',
    '/api/revenue(.*)',
    '/api/watcher(.*)',
    '/api/telemetry(.*)',
    '/api/vibe(.*)',
    '/api/synthia(.*)',
    '/api/income(.*)',
    '/api/council(.*)',
  ],
};
