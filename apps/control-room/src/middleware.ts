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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is public
  const isPublic = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  if (isPublic) {
    return NextResponse.next();
  }

  // Get session for protected routes
  const session = await auth();

  if (!session?.user) {
    // Redirect to signin with callback URL
    const signin = new URL('/auth/signin', request.url);
    signin.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signin);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|api|public|favicon.ico).*)',
  ],
};
