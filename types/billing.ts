import type { TierKey } from "@/lib/platform/tier-catalog";

/**
 * Our own subscription vocabulary — not the payment provider's object.
 *
 * Provider payloads are translated into this shape at the boundary, for two
 * reasons: the entitlement rules stay readable without knowing Stripe, and a
 * provider-side rename cannot silently change who gets access. The shape also
 * carries two fields Stripe does not have (`graceUntil`, `reconciliationUntil`),
 * because how long we tolerate a failed payment — and how long we trust a
 * record we may not have refreshed — are our decisions, not theirs.
 *
 * The list is the source of truth for the type, so a new status cannot be
 * added without the switch in evaluateEntitlement failing to compile and the
 * coverage tests failing to pass.
 */
export const SUBSCRIPTION_STATUSES = [
  /** Inside a free trial. Access ends with `currentPeriodEnd`. */
  "trialing",
  /** Paid and current. */
  "active",
  /** A renewal payment failed and is being retried. */
  "past_due",
  /** Intentionally suspended, by the customer or by us. */
  "paused",
  /** Over. Not coming back without a new subscription. */
  "canceled",
  /** The first payment never completed, so access never started. */
  "incomplete",
  /** The first payment was abandoned and the window closed. */
  "incomplete_expired",
  /** Retries are exhausted and the invoice is still unpaid. */
  "unpaid",
] as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export interface SubscriptionSnapshot {
  status: SubscriptionStatus;
  tierKey: TierKey;
  /** End of the paid (or trial) period. Null when no period is running. */
  currentPeriodEnd: Date | null;
  /** True when the subscription runs to `currentPeriodEnd` and then stops. */
  cancelAtPeriodEnd: boolean;
  /**
   * How long a `past_due` subscription keeps access while payment is retried.
   * Deliberately explicit rather than derived from `currentPeriodEnd`: the
   * billing period ending and our tolerance for a failed card are unrelated
   * decisions, and tying them together makes the grace window impossible to
   * tune without changing billing.
   *
   * Null means no grace at all.
   */
  graceUntil: Date | null;
  /**
   * How long an otherwise-current subscription keeps access after its period
   * end has passed without a refreshed record.
   *
   * A renewal and the webhook reporting it do not land at the same instant,
   * so a short window of trust prevents locking out someone who has just
   * paid. It is bounded on purpose: without it, a subscription whose webhooks
   * stopped arriving would keep access forever, and a delivery outage would
   * become free service instead of an incident.
   *
   * Null means no tolerance — access stops at `currentPeriodEnd`.
   */
  reconciliationUntil: Date | null;
}

/**
 * The fields the entitlement decision actually reads.
 *
 * Narrower than `SubscriptionSnapshot` on purpose — `tierKey` answers *what*
 * a subscriber gets, not *whether* they get anything, and passing it here
 * would invite rules that conflate the two. A full snapshot is structurally
 * assignable to this type, so callers need no conversion.
 */
export type EntitlementInput = Pick<
  SubscriptionSnapshot,
  "status" | "currentPeriodEnd" | "cancelAtPeriodEnd" | "graceUntil" | "reconciliationUntil"
>;

export type EntitlementReason =
  | "active"
  | "trialing"
  | "in_grace_period"
  | "pending_reconciliation"
  | "canceling_at_period_end"
  | "no_subscription"
  | "subscription_ended"
  | "trial_ended"
  | "grace_period_expired"
  | "billing_state_stale"
  | "paused"
  | "payment_incomplete"
  | "unpaid";

export interface EntitlementDecision {
  granted: boolean;
  /**
   * Why. Carried so the admin panel and support can answer "why is she
   * locked out" without re-deriving the rules, and so a denial is never
   * indistinguishable from a bug.
   */
  reason: EntitlementReason;
}
