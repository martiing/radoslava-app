import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { createHash } from "node:crypto";
import { describeError } from "@/lib/security/describe-error";

/**
 * Rate limiting for the public registration form.
 *
 * Two independent limits, checked at different points rather than together:
 *
 *   - per IP, before Turnstile: catches a single machine hammering the form
 *     cheaply, without spending a Cloudflare verification on it.
 *   - per phone, after Turnstile: catches repeated submissions for one number.
 *
 * The order matters. The phone limit is only reachable once a request has
 * proved it is human, and its rejection is deliberately indistinguishable from
 * success at the caller (see registerAction) — otherwise the limit itself
 * becomes an oracle telling an attacker which numbers are already registered.
 *
 * Availability trade-off: if Upstash itself is unreachable we FAIL OPEN and let
 * the request through. A Redis outage must not take the lead form offline —
 * Turnstile and the honeypot still stand in front of it. Hitting an actual
 * limit, by contrast, always FAILS CLOSED.
 */

const IP_LIMIT = { requests: 5, window: "10 m" } as const;
const PHONE_LIMIT = { requests: 3, window: "24 h" } as const;
const PORTAL_REGISTER_IP_LIMIT = { requests: 5, window: "10 m" } as const;
const PORTAL_REGISTER_EMAIL_LIMIT = { requests: 3, window: "24 h" } as const;
const ADMIN_LOGIN_LIMIT = { requests: 5, window: "15 m" } as const;
const CLIENT_LOGIN_IP_LIMIT = { requests: 10, window: "15 m" } as const;
const CLIENT_LOGIN_EMAIL_LIMIT = { requests: 5, window: "15 m" } as const;

let ipLimiter: Ratelimit | null = null;
let phoneLimiter: Ratelimit | null = null;
let adminLoginLimiter: Ratelimit | null = null;
let clientLoginIpLimiter: Ratelimit | null = null;
let clientLoginEmailLimiter: Ratelimit | null = null;
let portalRegisterIpLimiter: Ratelimit | null = null;
let portalRegisterEmailLimiter: Ratelimit | null = null;
let initialised = false;

function getLimiters() {
  if (initialised) {
    return {
      ipLimiter,
      phoneLimiter,
      adminLoginLimiter,
      clientLoginIpLimiter,
      clientLoginEmailLimiter,
      portalRegisterIpLimiter,
      portalRegisterEmailLimiter,
    };
  }
  initialised = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.error(
      "[security] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set — rate limiting is DISABLED."
    );
    return {
      ipLimiter: null,
      phoneLimiter: null,
      adminLoginLimiter: null,
      clientLoginIpLimiter: null,
      clientLoginEmailLimiter: null,
      portalRegisterIpLimiter: null,
      portalRegisterEmailLimiter: null,
    };
  }

  const redis = new Redis({ url, token });

  ipLimiter = new Ratelimit({
    redis,
    prefix: "ratelimit:register:ip",
    limiter: Ratelimit.slidingWindow(IP_LIMIT.requests, IP_LIMIT.window),
    analytics: false,
  });

  phoneLimiter = new Ratelimit({
    redis,
    prefix: "ratelimit:register:phone",
    limiter: Ratelimit.slidingWindow(PHONE_LIMIT.requests, PHONE_LIMIT.window),
    analytics: false,
  });

  adminLoginLimiter = new Ratelimit({
    redis,
    prefix: "ratelimit:admin-login:ip",
    limiter: Ratelimit.slidingWindow(ADMIN_LOGIN_LIMIT.requests, ADMIN_LOGIN_LIMIT.window),
    analytics: false,
  });

  clientLoginIpLimiter = new Ratelimit({
    redis,
    prefix: "ratelimit:client-login:ip",
    limiter: Ratelimit.slidingWindow(CLIENT_LOGIN_IP_LIMIT.requests, CLIENT_LOGIN_IP_LIMIT.window),
    analytics: false,
  });

  clientLoginEmailLimiter = new Ratelimit({
    redis,
    prefix: "ratelimit:client-login:email",
    limiter: Ratelimit.slidingWindow(
      CLIENT_LOGIN_EMAIL_LIMIT.requests,
      CLIENT_LOGIN_EMAIL_LIMIT.window
    ),
    analytics: false,
  });

  portalRegisterIpLimiter = new Ratelimit({
    redis,
    prefix: "ratelimit:portal-register:ip",
    limiter: Ratelimit.slidingWindow(
      PORTAL_REGISTER_IP_LIMIT.requests,
      PORTAL_REGISTER_IP_LIMIT.window
    ),
    analytics: false,
  });

  portalRegisterEmailLimiter = new Ratelimit({
    redis,
    prefix: "ratelimit:portal-register:email",
    limiter: Ratelimit.slidingWindow(
      PORTAL_REGISTER_EMAIL_LIMIT.requests,
      PORTAL_REGISTER_EMAIL_LIMIT.window
    ),
    analytics: false,
  });

  return {
    ipLimiter,
    phoneLimiter,
    adminLoginLimiter,
    clientLoginIpLimiter,
    clientLoginEmailLimiter,
    portalRegisterIpLimiter,
    portalRegisterEmailLimiter,
  };
}

/**
 * Portal account creation keeps budgets separate from the challenge intake.
 *
 * Sharing the challenge limiters would let one flow spend the other's
 * allowance: a burst of portal sign-ups would start rejecting people trying to
 * join the challenge, for no reason they could see.
 *
 * Split into two gates for the same reason the intake is — see registerAction.
 * The IP gate runs first and cheaply; the email gate runs only after Turnstile,
 * and its rejection must be silent, or anyone can burn another person's budget
 * and read the difference as "this address is registered".
 */
export async function checkPortalRegistrationIpRateLimit(
  ip: string | null
): Promise<RateLimitResult> {
  const { portalRegisterIpLimiter: limiter } = getLimiters();

  if (!limiter) {
    return { allowed: true, degraded: true };
  }

  try {
    const result = await limiter.limit(hashIdentifier(ip ?? "unknown"));
    return { allowed: result.success, degraded: false };
  } catch (error) {
    console.error(
      "[security] Portal registration IP rate limit check failed, allowing request:",
      describeError(error)
    );
    return { allowed: true, degraded: true };
  }
}

export async function checkPortalRegistrationEmailRateLimit(
  email: string
): Promise<RateLimitResult> {
  const { portalRegisterEmailLimiter: limiter } = getLimiters();

  if (!limiter) {
    return { allowed: true, degraded: true };
  }

  try {
    const result = await limiter.limit(hashIdentifier(email));
    return { allowed: result.success, degraded: false };
  } catch (error) {
    console.error(
      "[security] Portal registration email rate limit check failed, allowing request:",
      describeError(error)
    );
    return { allowed: true, degraded: true };
  }
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
    console.error("[security] Admin login rate limit check failed, allowing request:", describeError(error));
    return { allowed: true, degraded: true };
  }
}

export async function checkClientLoginRateLimit(
  ip: string | null,
  email: string
): Promise<RateLimitResult> {
  const { clientLoginIpLimiter: ipRl, clientLoginEmailLimiter: emailRl } = getLimiters();

  if (!ipRl || !emailRl) {
    return { allowed: true, degraded: true };
  }

  try {
    const [ipResult, emailResult] = await Promise.all([
      ipRl.limit(hashIdentifier(ip ?? "unknown")),
      emailRl.limit(hashIdentifier(email)),
    ]);
    return { allowed: ipResult.success && emailResult.success, degraded: false };
  } catch (error) {
    console.error("[security] Client login rate limit check failed, allowing request:", describeError(error));
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

/**
 * First gate on the registration form, before Turnstile is consulted.
 *
 * An unknown IP falls back to a shared bucket, which is deliberately strict
 * rather than a free pass.
 */
export async function checkRegistrationIpRateLimit(ip: string | null): Promise<RateLimitResult> {
  const { ipLimiter: limiter } = getLimiters();

  if (!limiter) {
    return { allowed: true, degraded: true };
  }

  try {
    const result = await limiter.limit(hashIdentifier(ip ?? "unknown"));
    return { allowed: result.success, degraded: false };
  } catch (error) {
    console.error("[security] Registration IP rate limit check failed, allowing request:", describeError(error));
    return { allowed: true, degraded: true };
  }
}

/**
 * Second gate, reached only after Turnstile has passed.
 *
 * The caller must treat a rejection here as a *silent* outcome — see
 * registerAction. Surfacing it would tell an attacker that a given number has
 * already been submitted, which is exactly the disclosure the identical
 * duplicate response exists to prevent.
 *
 * Expects the phone number already in canonical form (lib/validation/phone.ts);
 * two spellings of one number would otherwise get two separate budgets.
 */
export async function checkRegistrationPhoneRateLimit(
  canonicalPhone: string
): Promise<RateLimitResult> {
  const { phoneLimiter: limiter } = getLimiters();

  if (!limiter) {
    return { allowed: true, degraded: true };
  }

  try {
    const result = await limiter.limit(hashIdentifier(canonicalPhone));
    return { allowed: result.success, degraded: false };
  } catch (error) {
    console.error("[security] Registration phone rate limit check failed, allowing request:", describeError(error));
    return { allowed: true, degraded: true };
  }
}
