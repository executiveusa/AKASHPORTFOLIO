/**
 * middleware.ts — AUTH BYPASS FOR TESTING.
 * Pass all requests through. Restore: swap in proxy.ts logic with working NextAuth.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(_req: NextRequest) {
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
  ],
};
