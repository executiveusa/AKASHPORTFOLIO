import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

// Public routes that don't require auth
const PUBLIC_ROUTES = [
  '/landing',
  '/synthia',
  '/blog',
  '/newspaper',
  '/onboarding',
  '/auth/signin',
  '/auth/error',
  '/auth/denied',
  '/landing-index',
];

// API routes with tighter rate limits (reqs per minute)
const API_RATE_LIMITS: Record<string, number> = {
  '/api/vapi': 30,
  '/api/alex': 20,
  '/api/spheres': 30,
  '/api/council': 10,
  '/api/newsletter': 5,
  '/api/income': 10,
  '/api/auth': 20,
};

const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function getRateKey(request: NextRequest, prefix: string): string {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
  return `${prefix}:${ip}`;
}

function isRateLimited(key: string, limit: number): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (bucket.count >= limit) return true;
  bucket.count += 1;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API rate limiting — applied before auth checks
  if (pathname.startsWith('/api/')) {
    const matchedPrefix = Object.keys(API_RATE_LIMITS).find(p => pathname.startsWith(p));
    if (matchedPrefix) {
      const limit = API_RATE_LIMITS[matchedPrefix];
      const key = getRateKey(request, matchedPrefix);
      if (isRateLimited(key, limit)) {
        return NextResponse.json(
          { error: 'Too Many Requests', retryAfter: 60 },
          { status: 429, headers: { 'Retry-After': '60' } }
        );
      }
    }
    return NextResponse.next();
  }

  // Check if route is public
  const isPublic = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  if (isPublic) {
    return NextResponse.next();
  }

  // Static asset pass-through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.endsWith('.txt') ||
    pathname.endsWith('.xml') ||
    pathname.endsWith('.json')
  ) {
    return NextResponse.next();
  }

  // Get session for protected routes
  const session = await auth();

  if (!session?.user) {
    const signin = new URL('/auth/signin', request.url);
    signin.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signin);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
