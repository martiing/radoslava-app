import { NextResponse, type NextRequest } from "next/server";

/**
 * Content-Security-Policy with a per-request nonce.
 *
 * The nonce is what makes this policy worth having: without it, Next.js needs
 * 'unsafe-inline' on script-src for its hydration and streaming payloads, which
 * would defeat the point. Next picks the nonce up from this header and stamps
 * it onto the scripts it injects.
 *
 * Trade-off: a nonce changes per request, so every page that needs one must be
 * rendered dynamically. Each page opts in by awaiting `connection()` — without
 * that, the page is prerendered at build time, its scripts carry no nonce, and
 * this policy would block them. See app/page.tsx.
 *
 * Known relaxation: style-src keeps 'unsafe-inline'. Tailwind v4 and the
 * inline <style> inside the <noscript> block in app/layout.tsx both need it,
 * and style injection is a much weaker primitive than script injection.
 */
function buildCsp(nonce: string) {
  const isDev = process.env.NODE_ENV === "development";

  const directives = [
    "default-src 'self'",
    // 'strict-dynamic' lets Next's nonced bootstrap script load its own chunks.
    // The https: and 'unsafe-inline' entries are ignored by browsers that
    // support 'strict-dynamic' and act as a fallback for those that do not.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: 'unsafe-inline'${
      isDev ? " 'unsafe-eval'" : ""
    }`,
    "style-src 'self' 'unsafe-inline'",
    // next/font/google self-hosts the font files at build time, so no external
    // font origin is needed here.
    "font-src 'self'",
    "img-src 'self' data: blob:",
    // Turnstile posts its challenge results back to Cloudflare.
    "connect-src 'self' https://challenges.cloudflare.com",
    // The Turnstile widget renders inside an iframe.
    "frame-src https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "manifest-src 'self'",
  ];

  if (!isDev) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

export function proxy(request: NextRequest) {
  const nonce = crypto.randomUUID().replaceAll("-", "");
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except static assets and prefetches — those are served
     * straight from the CDN and gain nothing from a per-request nonce.
     */
    {
      source: "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
