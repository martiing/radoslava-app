/**
 * Subscription tiers, as stable identifiers.
 *
 * Deliberately free of prices, Stripe identifiers, marketing copy and any
 * knowledge of which coach is being sold. Those are all configuration that
 * changes independently: the North Star document still treats the tier names
 * and the €50/€100/€150 amounts as a working hypothesis to be tested, while
 * these keys are written into the database and must outlive every one of
 * those revisions.
 *
 * Money and Stripe identifiers live in lib/billing/stripe-price-config.ts,
 * which is server-only. This module is pure so it can be shared freely.
 */

export const TIER_KEYS = ["foundation", "growth", "transformation"] as const;

export type TierKey = (typeof TIER_KEYS)[number];

export interface TierDefinition {
  key: TierKey;
  /**
   * Position in the ladder, ascending. Used for "does this tier include at
   * least X" checks; never persisted, never shown to a user.
   */
  rank: number;
}

const TIERS: Record<TierKey, TierDefinition> = {
  foundation: { key: "foundation", rank: 1 },
  growth: { key: "growth", rank: 2 },
  transformation: { key: "transformation", rank: 3 },
};

export function isTierKey(value: unknown): value is TierKey {
  return typeof value === "string" && (TIER_KEYS as readonly string[]).includes(value);
}

export function getTier(key: TierKey): TierDefinition {
  return TIERS[key];
}

/**
 * Parses an untrusted value (database column, webhook payload, form field)
 * into a tier key.
 *
 * Throws rather than falling back to the cheapest tier: a silent fallback
 * would quietly downgrade a paying customer, and a silent upgrade would give
 * away the top tier. Both failures are worse than a loud one.
 */
export function resolveTierKey(value: unknown): TierKey {
  if (!isTierKey(value)) {
    throw new Error(
      `Unknown tier key: ${JSON.stringify(value)}. Expected one of ${TIER_KEYS.join(", ")}.`
    );
  }

  return value;
}

/** True when `actual` sits at or above `required` in the ladder. */
export function hasAtLeastTier(actual: TierKey, required: TierKey): boolean {
  return TIERS[actual].rank >= TIERS[required].rank;
}

/** Tier keys in ascending order. */
export function listTiers(): TierDefinition[] {
  return TIER_KEYS.map((key) => TIERS[key]);
}
