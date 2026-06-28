import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const LOCALES = ["en", "es"] as const;
const DEFAULT_LOCALE = "es";

const intlMiddleware = createMiddleware({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localeDetection: true,
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth routes and API
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Inject tenant context from subdomain
  const host = request.headers.get("host") ?? "";
  const subdomain = host.split(".")[0];
  const tenantSlug =
    subdomain !== "panorama" && subdomain !== "www" && subdomain !== "localhost"
      ? subdomain
      : null;

  // Auth guard — redirect to login if no session
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthPage = pathname.includes("/auth") || pathname === "/";

  if (!token && !isAuthPage) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Handle intl routing
  const response = intlMiddleware(request);

  // Attach tenant slug header for server components
  if (tenantSlug) {
    response.headers.set("x-tenant-slug", tenantSlug);
  }
  if (token?.tenantId) {
    response.headers.set("x-tenant-id", String(token.tenantId));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
