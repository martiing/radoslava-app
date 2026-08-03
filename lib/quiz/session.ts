import "server-only";

const QUIZ_SESSION_DURATION_MS = 1000 * 60 * 60 * 6;

function getSecret(): string {
  const secret = process.env.QUIZ_SESSION_SECRET;
  if (!secret) {
    throw new Error("Missing QUIZ_SESSION_SECRET environment variable. See .env.example.");
  }
  return secret;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return mismatch === 0;
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toHex(signature);
}

export async function createQuizSessionToken(participantId: string): Promise<string> {
  const expiresAt = Date.now() + QUIZ_SESSION_DURATION_MS;
  const payload = `${participantId}.${expiresAt}`;
  return `${payload}.${await sign(payload)}`;
}

export async function verifyQuizSessionToken(token: string): Promise<string | null> {
  const [participantId, expiresAtRaw, signature] = token.split(".");
  if (!participantId || !expiresAtRaw || !signature) return null;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || Date.now() >= expiresAt) return null;

  const payload = `${participantId}.${expiresAtRaw}`;
  const expectedSignature = await sign(payload);
  if (!timingSafeEqualHex(expectedSignature, signature)) return null;

  return participantId;
}
