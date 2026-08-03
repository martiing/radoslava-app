import type { NextConfig } from "next";

/**
 * Static security headers. The Content-Security-Policy is *not* here — it needs
 * a per-request nonce and is set in proxy.ts instead.
 */
const securityHeaders = [
  // Two years, with a view to HSTS preloading. Only submit to the preload list
  // once every subdomain of the production domain is HTTPS-only.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Redundant with CSP frame-ancestors, kept for older browsers.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig: NextConfig = {
  // Do not advertise the framework version to scanners.
  poweredByHeader: false,

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
