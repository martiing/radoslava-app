import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { createHash } from "node:crypto";

/**
 * Rate limiting for the public registration form.
 *
 * Two independent limits, both must pass:
 *   - per IP:    catches a single machine hammering the form
 *   - per email: catches a distributed attempt to spam one address, and stops
 *                someone from probing the duplicate-detection path repeatedly
 *
 * Availability trade-off: if Upstash itself is unreachable we FAIL OPEN and let
 * the request through. A Redis outage must not take the lead form offline —
 * Turnstile and the honeypot still stand in front of it. Hitting an actual
 * limit, by contrast, always FAILS CLOSED.
 */

const IP_LIMIT = { requests: 5, window: "10 m" } as const;
const EMAIL_LIMIT = { requests: 3, window: "24 h" } as const;
const ADMIN_LOGIN_LIMIT = { requests: 5, window: "15 m" } as const;

let ipLimiter: Ratelimit | null = null;
let emailLimiter: Ratelimit | null = null;
let adminLoginLimiter: Ratelimit | null = null;
let initialised = false;

function getLimiters() {
  if (initialised) {
    return { ipLimiter, emailLimiter, adminLoginLimiter };
  }
  initialised = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.error(
      "[security] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set — rate limiting is DISABLED."
    );
    return { ipLimiter: null, emailLimiter: null, adminLoginLimiter: null };
  }

  const redis = new Redis({ url, token });

  ipLimiter = new Ratelimit({
    redis,
    prefix: "ratelimit:register:ip",
    limiter: Ratelimit.slidingWindow(IP_LIMIT.requests, IP_LIMIT.window),
    analytics: false,
  });

  emailLimiter = new Ratelimit({
    redis,
    prefix: "ratelimit:register:email",
    limiter: Ratelimit.slidingWindow(EMAIL_LIMIT.requests, EMAIL_LIMIT.window),
    analytics: false,
  });

  adminLoginLimiter = new Ratelimit({
    redis,
    prefix: "ratelimit:admin-login:ip",
    limiter: Ratelimit.slidingWindow(ADMIN_LOGIN_LIMIT.requests, ADMIN_LOGIN_LIMIT.window),
    analytics: false,
  });

  return { ipLimiter, emailLimiter, adminLoginLimiter };
}

export async function checkAdminLoginRateLimit(ip: string | null): Promise<RateLimitResult> {
  const { adminLoginLimiter: limiter } = getLimiters();

  if (!limiter) {
    return { allowed: true, degraded: true };
  }

  try {
    const result = await limiter.limit(hashIdentifier(ip ?? "unknown"));
    return { allowed: result.success, degraded: false };
  } catch (error) {
    console.error("[security] Admin login rate limit check failed, allowing request:", {
      reason: error instanceof Error ? error.message : "unknown",
    });
    return { allowed: true, degraded: true };
  }
}

/**
 * Hash identifiers before they reach Redis. We never need the plaintext IP or
 * email to enforce a limit, and not storing them keeps this path free of
 * personal data (GDPR data minimisation).
 */
function hashIdentifier(value: string) {
  return createHash("sha256").update(value.toLowerCase()).digest("hex").slice(0, 32);
}

export interface RateLimitResult {
  allowed: boolean;
  /** True when the check could not run at all, so the caller knows it is unprotected. */
  degraded: boolean;
}

export async function checkRegistrationRateLimit(
  ip: string | null,
  email: string
): Promise<RateLimitResult> {
  const { ipLimiter: ipRl, emailLimiter: emailRl } = getLimiters();

  if (!ipRl || !emailRl) {
    return { allowed: true, degraded: true };
  }

  try {
    // The IP is only ever hashed; an unknown IP falls back to a shared bucket,
    // which is deliberately strict rather than a free pass.
    const ipKey = hashIdentifier(ip ?? "unknown");
    const emailKey = hashIdentifier(email);

    const [ipResult, emailResult] = await Promise.all([
      ipRl.limit(ipKey),
      emailRl.limit(emailKey),
    ]);

    return { allowed: ipResult.success && emailResult.success, degraded: false };
  } catch (error) {
    console.error("[security] Rate limit check failed, allowing request:", {
      reason: error instanceof Error ? error.message : "unknown",
    });
    return { allowed: true, degraded: true };
  }
}
