import { describe, expect, it } from "vitest";
import { isCanonicalBulgarianPhone, normalizeBulgarianPhone } from "@/lib/validation/phone";

const CANONICAL = "+359888123456";

describe("normalizeBulgarianPhone", () => {
  // The whole point: every spelling of one number must produce one key.
  // Without this, the unique index, the duplicate check and the rate limit
  // are all bypassed by typing the number differently.
  it("collapses every accepted spelling to the same value", () => {
    const spellings = [
      "0888123456",
      "0888 123 456",
      "0888-123-456",
      "(0888) 123 456",
      "+359888123456",
      "+359 888 123 456",
      "00359888123456",
      "  0888123456  ",
    ];

    for (const spelling of spellings) {
      expect(normalizeBulgarianPhone(spelling)).toBe(CANONICAL);
    }
  });

  it("leaves an already-canonical number unchanged", () => {
    expect(normalizeBulgarianPhone(CANONICAL)).toBe(CANONICAL);
  });

  it("rejects numbers with the wrong digit count", () => {
    expect(normalizeBulgarianPhone("088812345")).toBeNull();
    expect(normalizeBulgarianPhone("08881234567")).toBeNull();
    expect(normalizeBulgarianPhone("+35988812345")).toBeNull();
  });

  it("rejects a foreign country code", () => {
    expect(normalizeBulgarianPhone("+49888123456")).toBeNull();
    expect(normalizeBulgarianPhone("+1888123456")).toBeNull();
  });

  it("rejects non-numeric input", () => {
    expect(normalizeBulgarianPhone("")).toBeNull();
    expect(normalizeBulgarianPhone("не е телефон")).toBeNull();
    expect(normalizeBulgarianPhone("0888abc456")).toBeNull();
  });

  // Separator stripping must not turn a wrong number into a right one.
  it("does not accept a number that is only valid once digits are invented", () => {
    expect(normalizeBulgarianPhone("0888 123 45")).toBeNull();
  });
});

describe("isCanonicalBulgarianPhone", () => {
  it("accepts the canonical form", () => {
    expect(isCanonicalBulgarianPhone(CANONICAL)).toBe(true);
  });

  it("rejects the national and 00 forms", () => {
    expect(isCanonicalBulgarianPhone("0888123456")).toBe(false);
    expect(isCanonicalBulgarianPhone("00359888123456")).toBe(false);
  });

  it("matches what normalizeBulgarianPhone produces", () => {
    const normalized = normalizeBulgarianPhone("0888 123 456");
    expect(normalized).not.toBeNull();
    expect(isCanonicalBulgarianPhone(normalized as string)).toBe(true);
  });
});
