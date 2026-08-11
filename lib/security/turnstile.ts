import "server-only";
import { describeError } from "@/lib/security/describe-error";

/**
 * Cloudflare Turnstile verification.
 *
 * Unlike the rate limiter, this FAILS CLOSED: if the secret is missing in
 * production we reject the submission rather than quietly accepting bot
 * traffic. That means TURNSTILE_SECRET_KEY must be set in Vercel *before*
 * this code is deployed — see SECURITY.md.
 *
 * In development the check is skipped when no secret is configured, so the
 * form stays usable locally without a Cloudflare account.
 */

const VERIFY_ENDPOINT = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const VERIFY_TIMEOUT_MS = 5000;

export async function verifyTurnstileToken(
  token: unknown,
  ip: string | null
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[security] TURNSTILE_SECRET_KEY is not set in production — rejecting submission."
      );
      return false;
    }
    console.warn("[security] TURNSTILE_SECRET_KEY not set — skipping check (development only).");
    return true;
  }

  if (typeof token !== "string" || token.length === 0 || token.length > 2048) {
    return false;
  }

  const body = new URLSearchParams({ secret, response: token });
  if (ip) {
    body.set("remoteip", ip);
  }

  try {
    const response = await fetch(VERIFY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("[security] Turnstile siteverify returned", response.status);
      return false;
    }

    const result = (await response.json()) as { success?: boolean; "error-codes"?: string[] };

    if (!result.success) {
      console.warn("[security] Turnstile rejected a submission:", {
        errors: result["error-codes"] ?? [],
      });
      return false;
    }

    return true;
  } catch (error) {
    // A Cloudflare outage or timeout must not become an open door.
    console.error("[security] Turnstile verification failed:", describeError(error));
    return false;
  }
}
