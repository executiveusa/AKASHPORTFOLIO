import { auth } from "@/auth";
import { NextResponse, type NextRequest } from "next/server";

interface AuthRequest extends NextRequest {
  auth?: { user?: unknown } | null;
}

export default auth((req: AuthRequest) => {
  const isLoggedIn = !!req.auth?.user;
  if (!isLoggedIn) {
    const signInUrl = new URL('/auth/signin', req.url);
    signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
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
