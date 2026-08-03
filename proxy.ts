import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin/session";

function buildCsp(nonce: string) {
  const isDev = process.env.NODE_ENV === "development";
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: 'unsafe-inline'${
      isDev ? " 'unsafe-eval'" : ""
    }`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    "img-src 'self' data: blob:",
    "connect-src 'self' https://challenges.cloudflare.com",
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

export async function proxy(request: NextRequest) {
  const nonce = crypto.randomUUID().replaceAll("-", "");
  const csp = buildCsp(nonce);
  const pathname = request.nextUrl.pathname;

  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminLogin = pathname === "/admin/login";

  if (isAdminRoute && !isAdminLogin) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!(await verifyAdminSessionToken(token))) {
      return withCsp(NextResponse.redirect(new URL("/admin/login", request.url)), csp);
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  return withCsp(NextResponse.next({ request: { headers: requestHeaders } }), csp);
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
