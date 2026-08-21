import "server-only";

/**
 * Access tokens for the participant's plan page.
 *
 * The plan page used to be reachable at /plan/{participantId} — an unguessable
 * URL and nothing else. URLs leak: into browser history, into referrer headers,
 * into screenshots and forwarded messages. This replaces the raw id with a
 * token that is signed, scoped and time-limited.
 *
 * What the signature does and does not do:
 *
 *   - It proves integrity. The participant id and expiry inside cannot be
 *     changed, and the token cannot be pointed at another participant, without
 *     the server's secret.
 *   - It does NOT hide anything. The payload is plain text; anyone holding the
 *     token can read the id. Treat the token itself as the secret.
 *
 * Nor is it revocable on its own. Rotating PLAN_ACCESS_SECRET invalidates every
 * outstanding token at once, which is the blunt option; per-participant
 * revocation would need a counter column to sign alongside the id. Worth adding
 * if links ever get shared widely.
 *
 * Access is not authorization. A valid token says "this link was issued for
 * this participant"; whether she may see a plan today is a separate question
 * about her stage, asked at the page.
 *
 * Known residual exposure, accepted for launch: the token lives in the URL, so
 * it survives in browser history, in the platform's access logs, and in
 * anything the recipient forwards. `Referrer-Policy: no-referrer` stops it
 * leaking onward to linked sites; it does not make the URL itself private.
 * Moving the token to a POST body or exchanging it for a cookie would close
 * that, at the cost of a link Radoslava can no longer just paste into Viber.
 */

/** Bumping this invalidates every token of the previous shape. */
const TOKEN_VERSION = "v1";

/**
 * Scopes the token to this one purpose. A quiz session token is a different
 * shape entirely and cannot be replayed here, but the audience makes the
 * separation explicit rather than incidental — and survives a future token
 * type that happens to share the layout.
 */
const TOKEN_AUDIENCE = "plan_access";

/**
 * Long enough to cover the four-week programme plus slack, so Radoslava is not
 * reissuing links mid-challenge. Every extra day is another day a leaked link
 * keeps working, which is the trade being made.
 */
const TOKEN_DURATION_MS = 45 * 24 * 60 * 60 * 1000;

const TOKEN_PART_COUNT = 5;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * An HMAC is only as strong as its key. A short secret is guessable offline,
 * and a guessed secret mints tokens for any participant, so the floor is
 * enforced here rather than left to a comment in .env.example that nobody
 * reads while pasting a value into Vercel.
 */
const MIN_SECRET_BYTES = 32;

/** Returns the secret, or null when it is absent or too short to trust. */
function readSecret(): string | null {
  const secret = process.env.PLAN_ACCESS_SECRET;
  if (!secret) return null;

  return new TextEncoder().encode(secret).length >= MIN_SECRET_BYTES ? secret : null;
}

function requireSecret(): string {
  const secret = readSecret();
  if (!secret) {
    throw new Error(
      `PLAN_ACCESS_SECRET is missing or shorter than ${MIN_SECRET_BYTES} bytes. See .env.example.`
    );
  }
  return secret;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Compares in constant time so a wrong signature cannot be found byte by byte. */
function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return mismatch === 0;
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toHex(signature);
}

/**
 * Issues a plan link token.
 *
 * Throws on a missing secret or a malformed id: this runs in the admin panel,
 * where a loud failure is what you want. Verification, which runs on a public
 * request, fails quietly instead.
 */
export async function createPlanAccessToken(
  participantId: string,
  now: Date = new Date()
): Promise<string> {
  if (!UUID_PATTERN.test(participantId)) {
    throw new Error("createPlanAccessToken expects a participant UUID.");
  }

  const secret = requireSecret();
  const expiresAt = now.getTime() + TOKEN_DURATION_MS;
  const payload = `${TOKEN_VERSION}.${TOKEN_AUDIENCE}.${participantId}.${expiresAt}`;

  return `${payload}.${await sign(payload, secret)}`;
}

/**
 * Returns the participant id the token was issued for, or null.
 *
 * Every rejection returns null with no detail, so the caller cannot
 * accidentally tell a forged token from an expired one from a token for
 * somebody else. The token is never logged — it is a credential.
 */
export async function verifyPlanAccessToken(
  token: unknown,
  now: Date = new Date()
): Promise<string | null> {
  if (typeof token !== "string" || token.length === 0 || token.length > 512) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== TOKEN_PART_COUNT) {
    return null;
  }

  const [version, audience, participantId, expiresAtRaw, signature] = parts;

  // A quiz session token has three parts and no audience, so it dies here.
  if (version !== TOKEN_VERSION || audience !== TOKEN_AUDIENCE) {
    return null;
  }

  if (!UUID_PATTERN.test(participantId)) {
    return null;
  }

  const expiresAt = Number(expiresAtRaw);
  // Rejected at the exact expiry instant: a window that has run out is closed.
  if (!Number.isInteger(expiresAt) || now.getTime() >= expiresAt) {
    return null;
  }

  // A missing or weak secret must not become an open door, and must not look
  // different from a bad token. Loud in the logs, silent in the response.
  const secret = readSecret();
  if (!secret) {
    console.error("[plan] access_secret_invalid_or_missing");
    return null;
  }

  const expectedSignature = await sign(
    `${version}.${audience}.${participantId}.${expiresAtRaw}`,
    secret
  );

  if (!timingSafeEqualHex(expectedSignature, signature)) {
    return null;
  }

  return participantId;
}
