import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  findUnconfiguredTiers,
  getStripePriceEnvVar,
  getStripePriceId,
} from "@/lib/billing/stripe-price-config";
import { TIER_KEYS } from "@/lib/platform/tier-catalog";

const VALID = {
  foundation: "price_foundation_123",
  growth: "price_growth_123",
  transformation: "price_transformation_123",
} as const;

function setAll(values: Partial<Record<(typeof TIER_KEYS)[number], string | undefined>>) {
  for (const tier of TIER_KEYS) {
    vi.stubEnv(getStripePriceEnvVar(tier), values[tier]);
  }
}

beforeEach(() => {
  // Start from a known-empty environment so a real .env cannot mask a bug.
  setAll({});
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getStripePriceEnvVar", () => {
  it("names one distinct variable per tier", () => {
    const names = TIER_KEYS.map(getStripePriceEnvVar);
    expect(names).toEqual([
      "STRIPE_PRICE_FOUNDATION",
      "STRIPE_PRICE_GROWTH",
      "STRIPE_PRICE_TRANSFORMATION",
    ]);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("getStripePriceId", () => {
  it("returns the configured price ID", () => {
    setAll(VALID);
    expect(getStripePriceId("growth")).toBe(VALID.growth);
  });

  // Copy-pasting out of the Stripe dashboard picks up surrounding whitespace,
  // and a trailing newline in a Vercel variable is invisible in the UI.
  it("trims surrounding whitespace", () => {
    vi.stubEnv("STRIPE_PRICE_FOUNDATION", "  price_foundation_123\n");
    expect(getStripePriceId("foundation")).toBe("price_foundation_123");
  });

  it("throws when the variable is missing", () => {
    expect(() => getStripePriceId("foundation")).toThrow(/Missing STRIPE_PRICE_FOUNDATION/);
  });

  it("throws when the variable is empty or whitespace only", () => {
    vi.stubEnv("STRIPE_PRICE_GROWTH", "   ");
    expect(() => getStripePriceId("growth")).toThrow(/Missing STRIPE_PRICE_GROWTH/);
  });

  // The two mistakes that actually happen in practice.
  it("rejects a Product ID pasted instead of a Price ID", () => {
    vi.stubEnv("STRIPE_PRICE_GROWTH", "prod_ABC123");
    expect(() => getStripePriceId("growth")).toThrow(/does not look like a Stripe Price ID/);
  });

  it("rejects a dashboard URL pasted instead of a Price ID", () => {
    vi.stubEnv("STRIPE_PRICE_GROWTH", "https://dashboard.stripe.com/prices/price_123");
    expect(() => getStripePriceId("growth")).toThrow(/does not look like a Stripe Price ID/);
  });

  it("names the offending variable in the malformed-value error", () => {
    vi.stubEnv("STRIPE_PRICE_TRANSFORMATION", "nope");
    expect(() => getStripePriceId("transformation")).toThrow(/STRIPE_PRICE_TRANSFORMATION/);
  });
});

describe("findUnconfiguredTiers", () => {
  it("reports every tier when nothing is configured", () => {
    expect(findUnconfiguredTiers()).toEqual([...TIER_KEYS]);
  });

  it("reports nothing when every tier is configured", () => {
    setAll(VALID);
    expect(findUnconfiguredTiers()).toEqual([]);
  });

  it("reports only the tier that is missing", () => {
    setAll({ ...VALID, growth: undefined });
    expect(findUnconfiguredTiers()).toEqual(["growth"]);
  });

  // A malformed value is as unbuyable as a missing one, so it must surface
  // in the same health check rather than waiting for a customer to hit it.
  it("reports a tier whose value is malformed", () => {
    setAll({ ...VALID, transformation: "prod_ABC123" });
    expect(findUnconfiguredTiers()).toEqual(["transformation"]);
  });
});
