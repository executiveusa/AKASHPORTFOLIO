/**
 * proxy.ts — Route matcher / auth middleware.
 * AUTH BYPASS ACTIVE FOR TESTING — pass all matched routes through.
 * Restore: re-add 'import { auth } from "@/auth"' and auth gate logic.
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
    '/api/vibe(.*)',
    '/api/synthia(.*)',
    '/api/income(.*)',
    '/api/council(.*)',
  ],
};
