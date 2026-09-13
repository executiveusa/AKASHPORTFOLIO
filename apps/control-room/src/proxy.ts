/**
 * proxy.ts — Next.js 16 middleware (picked up as the edge middleware entry).
 * Guards /cockpit/* routes: requires a valid NextAuth session cookie.
 * All other routes pass through.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only gate cockpit routes
  if (pathname.startsWith('/cockpit')) {
    // NextAuth session cookie name depends on environment
    const sessionCookie =
      req.cookies.get('next-auth.session-token') ??
      req.cookies.get('__Secure-next-auth.session-token');

    if (!sessionCookie) {
      const signInUrl = new URL('/auth/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

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
