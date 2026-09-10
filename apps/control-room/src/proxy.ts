/**
 * proxy.ts — AUTH BYPASS FOR TESTING.
 * Was NextAuth middleware (auth-gating all routes). Now a pass-through.
 * Restore: bring back auth() from "@/auth" and the isLoggedIn redirect logic.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(_req: NextRequest) {
  return NextResponse.next();
}

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
    '/api/council(.*)',
  ],
};
