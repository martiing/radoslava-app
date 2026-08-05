import { describe, expect, it } from "vitest";
import {
  TIER_KEYS,
  getTier,
  hasAtLeastTier,
  isTierKey,
  listTiers,
  resolveTierKey,
} from "@/lib/platform/tier-catalog";

describe("tier keys", () => {
  it("are ordered from cheapest to most personal", () => {
    expect(TIER_KEYS).toEqual(["foundation", "growth", "transformation"]);
  });

  it("expose strictly ascending ranks", () => {
    const ranks = listTiers().map((tier) => tier.rank);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
    expect(new Set(ranks).size).toBe(ranks.length);
  });
});

describe("isTierKey", () => {
  it("accepts every published key", () => {
    for (const key of TIER_KEYS) {
      expect(isTierKey(key)).toBe(true);
    }
  });

  it("rejects unknown strings and non-strings", () => {
    expect(isTierKey("premium")).toBe(false);
    expect(isTierKey("Foundation")).toBe(false);
    expect(isTierKey("")).toBe(false);
    expect(isTierKey(null)).toBe(false);
    expect(isTierKey(2)).toBe(false);
  });
});

describe("resolveTierKey", () => {
  it("returns the key when it is valid", () => {
    expect(resolveTierKey("growth")).toBe("growth");
  });

  // A silent fallback would either downgrade a paying customer or hand out
  // the top tier for free. Both are worse than throwing.
  it("throws on an unknown value instead of falling back", () => {
    expect(() => resolveTierKey("vip")).toThrow(/Unknown tier key/);
    expect(() => resolveTierKey(undefined)).toThrow(/Unknown tier key/);
  });

  it("names the accepted keys in the error", () => {
    expect(() => resolveTierKey("vip")).toThrow(/foundation, growth, transformation/);
  });
});

describe("hasAtLeastTier", () => {
  it("is true for the same tier", () => {
    expect(hasAtLeastTier("growth", "growth")).toBe(true);
  });

  it("is true when the subscriber is above the requirement", () => {
    expect(hasAtLeastTier("transformation", "foundation")).toBe(true);
  });

  it("is false when the subscriber is below the requirement", () => {
    expect(hasAtLeastTier("foundation", "growth")).toBe(false);
  });
});

describe("getTier", () => {
  it("returns the definition for a key", () => {
    expect(getTier("foundation")).toEqual({ key: "foundation", rank: 1 });
  });
});
