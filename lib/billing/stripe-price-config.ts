import "server-only";
import { TIER_KEYS, type TierKey } from "@/lib/platform/tier-catalog";

/**
 * Maps subscription tiers to Stripe Price IDs, read from the environment.
 *
 * Price IDs are environment-specific — test mode and live mode issue
 * different ones — so hardcoding them would either charge test cards in
 * production or real cards in development.
 *
 * Keeping them in the environment means changing a price needs no code
 * change and no review. It does still need a new deployment: Vercel injects
 * environment variables at build time, so an edited value only takes effect
 * once the project is redeployed.
 *
 * No network calls happen here. This module only resolves configuration; the
 * Stripe SDK client is a separate concern.
 */

const ENV_VARS: Record<TierKey, string> = {
  foundation: "STRIPE_PRICE_FOUNDATION",
  growth: "STRIPE_PRICE_GROWTH",
  transformation: "STRIPE_PRICE_TRANSFORMATION",
};

/** Every Stripe Price ID starts with this; anything else is a wrong value. */
const PRICE_ID_PREFIX = "price_";

/**
 * Resolves the Stripe Price ID for a tier.
 *
 * Throws when the variable is missing or malformed. A checkout session built
 * with a bad price fails at Stripe anyway, but only after the customer has
 * clicked "subscribe" — failing here names the variable instead.
 *
 * The prefix check catches the two mistakes that actually happen: pasting a
 * Product ID (`prod_…`) instead of a Price ID, and pasting a whole Stripe
 * dashboard URL.
 */
export function getStripePriceId(tier: TierKey): string {
  const variable = ENV_VARS[tier];
  const value = process.env[variable]?.trim();

  if (!value) {
    throw new Error(`Missing ${variable}. Set a Stripe Price ID for the "${tier}" tier.`);
  }

  if (!value.startsWith(PRICE_ID_PREFIX)) {
    throw new Error(
      `${variable} does not look like a Stripe Price ID (expected it to start with "${PRICE_ID_PREFIX}").`
    );
  }

  return value;
}

/**
 * Returns the tiers whose Price ID is missing or malformed.
 *
 * Meant for a startup or health check: a tier with a broken price is a tier
 * nobody can buy, and that should surface before a customer finds it.
 * Returns an empty array when every tier is configured.
 */
export function findUnconfiguredTiers(): TierKey[] {
  return TIER_KEYS.filter((tier) => {
    const value = process.env[ENV_VARS[tier]]?.trim();
    return !value || !value.startsWith(PRICE_ID_PREFIX);
  });
}

/** The environment variable backing a tier, for error messages and docs. */
export function getStripePriceEnvVar(tier: TierKey): string {
  return ENV_VARS[tier];
}
