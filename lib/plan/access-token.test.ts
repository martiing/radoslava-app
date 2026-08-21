import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPlanAccessToken, verifyPlanAccessToken } from "@/lib/plan/access-token";

const PARTICIPANT_ID = "3f2a1b4c-5d6e-4f70-8a91-b2c3d4e5f607";
const OTHER_PARTICIPANT_ID = "11111111-2222-4333-8444-555555555555";
const NOW = new Date("2026-08-05T12:00:00.000Z");

/** Exactly at the enforced floor; anything shorter must be refused. */
const VALID_SECRET = "x".repeat(32);
const OTHER_SECRET = "y".repeat(32);
const SHORT_SECRET = "x".repeat(31);

beforeEach(() => {
  vi.stubEnv("PLAN_ACCESS_SECRET", VALID_SECRET);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

/** Rebuilds a token with one field swapped, keeping the original signature. */
function tamper(token: string, index: number, replacement: string): string {
  const parts = token.split(".");
  parts[index] = replacement;
  return parts.join(".");
}

describe("a freshly issued token", () => {
  it("verifies and returns the participant id", async () => {
    const token = await createPlanAccessToken(PARTICIPANT_ID, NOW);
    expect(await verifyPlanAccessToken(token, NOW)).toBe(PARTICIPANT_ID);
  });

  it("carries the version and audience in the clear", async () => {
    const token = await createPlanAccessToken(PARTICIPANT_ID, NOW);
    const [version, audience, id] = token.split(".");

    expect(version).toBe("v1");
    expect(audience).toBe("plan_access");
    // The payload is signed, not encrypted — the id is readable by design.
    expect(id).toBe(PARTICIPANT_ID);
  });

  it("refuses to be issued for something that is not a UUID", async () => {
    await expect(createPlanAccessToken("not-a-uuid", NOW)).rejects.toThrow(/participant UUID/);
  });
});

describe("tampering", () => {
  it("rejects a swapped participant id", async () => {
    const token = await createPlanAccessToken(PARTICIPANT_ID, NOW);
    const forged = tamper(token, 2, OTHER_PARTICIPANT_ID);

    expect(await verifyPlanAccessToken(forged, NOW)).toBeNull();
  });

  it("rejects an extended expiry", async () => {
    const token = await createPlanAccessToken(PARTICIPANT_ID, NOW);
    const farFuture = String(NOW.getTime() + 10 * 365 * 24 * 60 * 60 * 1000);
    const forged = tamper(token, 3, farFuture);

    expect(await verifyPlanAccessToken(forged, NOW)).toBeNull();
  });

  it("rejects a changed audience", async () => {
    const token = await createPlanAccessToken(PARTICIPANT_ID, NOW);
    const forged = tamper(token, 1, "quiz_session");

    expect(await verifyPlanAccessToken(forged, NOW)).toBeNull();
  });

  it("rejects a changed version", async () => {
    const token = await createPlanAccessToken(PARTICIPANT_ID, NOW);
    const forged = tamper(token, 0, "v2");

    expect(await verifyPlanAccessToken(forged, NOW)).toBeNull();
  });

  it("rejects a corrupted signature", async () => {
    const token = await createPlanAccessToken(PARTICIPANT_ID, NOW);
    const parts = token.split(".");
    const signature = parts[4];
    const flipped = (signature[0] === "a" ? "b" : "a") + signature.slice(1);

    expect(await verifyPlanAccessToken(tamper(token, 4, flipped), NOW)).toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await createPlanAccessToken(PARTICIPANT_ID, NOW);
    vi.stubEnv("PLAN_ACCESS_SECRET", OTHER_SECRET);

    expect(await verifyPlanAccessToken(token, NOW)).toBeNull();
  });
});

describe("expiry", () => {
  it("accepts the token one millisecond before it expires", async () => {
    const token = await createPlanAccessToken(PARTICIPANT_ID, NOW);
    const expiresAt = Number(token.split(".")[3]);
    const justBefore = new Date(expiresAt - 1);

    expect(await verifyPlanAccessToken(token, justBefore)).toBe(PARTICIPANT_ID);
  });

  // A window that has run out is closed, not closing.
  it("rejects the token at the exact expiry instant", async () => {
    const token = await createPlanAccessToken(PARTICIPANT_ID, NOW);
    const expiresAt = Number(token.split(".")[3]);

    expect(await verifyPlanAccessToken(token, new Date(expiresAt))).toBeNull();
  });

  it("rejects the token after it expires", async () => {
    const token = await createPlanAccessToken(PARTICIPANT_ID, NOW);
    const expiresAt = Number(token.split(".")[3]);

    expect(await verifyPlanAccessToken(token, new Date(expiresAt + 1))).toBeNull();
  });
});

describe("malformed input", () => {
  const cases: Array<[string, unknown]> = [
    ["an empty string", ""],
    ["a non-string", 12345],
    ["null", null],
    ["undefined", undefined],
    ["too few parts", "v1.plan_access.3f2a1b4c-5d6e-4f70-8a91-b2c3d4e5f607.999"],
    ["too many parts", "v1.plan_access.3f2a1b4c-5d6e-4f70-8a91-b2c3d4e5f607.999.sig.extra"],
    ["a non-UUID id", "v1.plan_access.not-a-uuid.99999999999.deadbeef"],
    ["a non-numeric expiry", "v1.plan_access.3f2a1b4c-5d6e-4f70-8a91-b2c3d4e5f607.soon.deadbeef"],
    ["an absurdly long token", `v1.plan_access.${"a".repeat(600)}.1.2`],
  ];

  for (const [description, value] of cases) {
    it(`rejects ${description}`, async () => {
      expect(await verifyPlanAccessToken(value, NOW)).toBeNull();
    });
  }

  // The quiz issues `participantId.expiresAt.signature` — three parts, no
  // audience. It must never open a plan page.
  it("rejects a quiz-shaped token", async () => {
    const quizShaped = `${PARTICIPANT_ID}.${NOW.getTime() + 10000}.abcdef`;
    expect(await verifyPlanAccessToken(quizShaped, NOW)).toBeNull();
  });
});

describe("missing or weak secret", () => {
  it("fails closed on verification rather than throwing", async () => {
    const token = await createPlanAccessToken(PARTICIPANT_ID, NOW);
    vi.stubEnv("PLAN_ACCESS_SECRET", undefined);

    // Same null as any other rejection: a misconfigured server must not be
    // distinguishable from a bad token by the person holding it.
    expect(await verifyPlanAccessToken(token, NOW)).toBeNull();
  });

  it("throws when issuing, where the failure should be loud", async () => {
    vi.stubEnv("PLAN_ACCESS_SECRET", undefined);
    await expect(createPlanAccessToken(PARTICIPANT_ID, NOW)).rejects.toThrow(
      /PLAN_ACCESS_SECRET/
    );
  });

  // A short secret is guessable offline, and a guessed secret mints tokens for
  // anyone. Treated exactly like a missing one.
  it("refuses to issue with a secret below the floor", async () => {
    vi.stubEnv("PLAN_ACCESS_SECRET", SHORT_SECRET);
    await expect(createPlanAccessToken(PARTICIPANT_ID, NOW)).rejects.toThrow(/32 bytes/);
  });

  it("fails closed on verification with a secret below the floor", async () => {
    const token = await createPlanAccessToken(PARTICIPANT_ID, NOW);
    vi.stubEnv("PLAN_ACCESS_SECRET", SHORT_SECRET);

    expect(await verifyPlanAccessToken(token, NOW)).toBeNull();
  });

  it("accepts a secret exactly at the floor", async () => {
    vi.stubEnv("PLAN_ACCESS_SECRET", VALID_SECRET);
    const token = await createPlanAccessToken(PARTICIPANT_ID, NOW);

    expect(await verifyPlanAccessToken(token, NOW)).toBe(PARTICIPANT_ID);
  });
});
