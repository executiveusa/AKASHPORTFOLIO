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
  // Regex-style matchers ensure both the exact path and all sub-paths are protected
  matcher: [
    '/cockpit(.*)',
    '/dashboard(.*)',
    '/spheres(.*)',
  ],
};
