import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin/session";

function buildCsp(nonce: string) {
  const isDev = process.env.NODE_ENV === "development";
  let supabaseOrigin: string | null = null;

  try {
    supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
      : null;
  } catch {
    // A malformed URL will fail explicitly when a portal client is created.
  }

  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: 'unsafe-inline'${
      isDev ? " 'unsafe-eval'" : ""
    }`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    "img-src 'self' data: blob:",
    `connect-src 'self' https://challenges.cloudflare.com${
      supabaseOrigin ? ` ${supabaseOrigin}` : ""
    }`,
    "frame-src https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "manifest-src 'self'",
  ];

  if (!isDev) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}

function withCsp(response: NextResponse, csp: string) {
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

function copyAuthCookiesAndCacheHeaders(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));

  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = source.headers.get(header);
    if (value) target.headers.set(header, value);
  }

  return target;
}

export async function proxy(request: NextRequest) {
  const nonce = crypto.randomUUID().replaceAll("-", "");
  const csp = buildCsp(nonce);
  const pathname = request.nextUrl.pathname;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const createPassThroughResponse = () =>
    withCsp(NextResponse.next({ request: { headers: requestHeaders } }), csp);

  // The plan page is reached with a bearer token in the URL. Keep it out of
  // caches, out of search indexes, and out of the referrer header of anything
  // it links to — a referrer would hand the token to the destination.
  //
  // Set here rather than in next.config.ts so Referrer-Policy replaces the
  // site-wide value for this path instead of being emitted alongside it.
  const isPlanRoute = pathname === "/plan" || pathname.startsWith("/plan/");
  if (isPlanRoute) {
    const response = createPassThroughResponse();
    response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
    response.headers.set("Referrer-Policy", "no-referrer");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminLogin = pathname === "/admin/login";

  if (isAdminRoute && !isAdminLogin) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!(await verifyAdminSessionToken(token))) {
      return withCsp(NextResponse.redirect(new URL("/admin/login", request.url)), csp);
    }
  }

  const isPortalRoute = pathname === "/portal" || pathname.startsWith("/portal/");
  if (isPortalRoute) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !publishableKey) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. See .env.example."
      );
    }

    let authResponse = createPassThroughResponse();
    const supabase = createServerClient(url, publishableKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headersToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          authResponse = createPassThroughResponse();
          cookiesToSet.forEach(({ name, value, options }) => {
            authResponse.cookies.set(name, value, options);
          });
          Object.entries(headersToSet).forEach(([name, value]) => {
            authResponse.headers.set(name, value);
          });
        },
      },
    });

    // getClaims verifies the JWT signature; getSession must not be trusted for
    // authorization because its cookie payload can be spoofed by a client.
    const { data, error } = await supabase.auth.getClaims();
    const isAuthenticated = !error && typeof data?.claims?.sub === "string";
    const isPublicPortalRoute =
      pathname === "/portal/login" ||
      pathname === "/portal/register" ||
      pathname === "/portal/forgot-password";

    if (!isAuthenticated && !isPublicPortalRoute) {
      const loginUrl = new URL("/portal/login", request.url);
      loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
      return withCsp(
        copyAuthCookiesAndCacheHeaders(authResponse, NextResponse.redirect(loginUrl)),
        csp
      );
    }

    return authResponse;
  }

  return createPassThroughResponse();
}

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
