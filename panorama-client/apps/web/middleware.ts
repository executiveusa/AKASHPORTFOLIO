import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const LOCALES = ["en", "es"] as const;
const DEFAULT_LOCALE = "es";

const intlMiddleware = createMiddleware({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localeDetection: true,
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth routes and Next.js internals
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

  const isAuthPage = pathname === "/";

  // Check Supabase session via cookie
  let session = null;
  try {
    const response = NextResponse.next();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );
    const { data } = await supabase.auth.getSession();
    session = data.session;
  } catch {
    // Non-fatal — let request through to page which will handle redirect
  }

  if (!session && !isAuthPage) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Handle intl routing
  const response = intlMiddleware(request);

  // Attach tenant context headers for server components
  if (tenantSlug) {
    response.headers.set("x-tenant-slug", tenantSlug);
  }
  if (session?.user?.id) {
    response.headers.set("x-user-id", session.user.id);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
