import type { EntitlementDecision, EntitlementInput } from "@/types/billing";

/**
 * Decides whether a subscription grants access to paid content right now.
 *
 * This is the single place that answers that question. It is a pure function
 * over a normalized snapshot so the rules can be read, argued with and tested
 * without a database, a network call or a Stripe fixture.
 *
 * Deadlines are end-exclusive: access stops at the instant a period, grace or
 * reconciliation window ends. Every window here is a permission to keep
 * serving, and a permission that has run out is no longer a permission.
 */
export function evaluateEntitlement(
  subscription: EntitlementInput | null,
  now: Date
): EntitlementDecision {
  if (!subscription) {
    return { granted: false, reason: "no_subscription" };
  }

  const { status, currentPeriodEnd, cancelAtPeriodEnd, graceUntil, reconciliationUntil } =
    subscription;

  switch (status) {
    case "active":
      // Once the subscription is set to stop there is no renewal coming, so
      // the period end is a real deadline and nothing extends it.
      if (cancelAtPeriodEnd) {
        return isBefore(now, currentPeriodEnd)
          ? { granted: true, reason: "canceling_at_period_end" }
          : { granted: false, reason: "subscription_ended" };
      }

      if (isBefore(now, currentPeriodEnd)) {
        return { granted: true, reason: "active" };
      }

      // The period end has passed on a record that still says "active". Either
      // the renewal webhook has not landed yet, or we have stopped hearing
      // from the provider entirely. The first deserves patience; the second
      // must not become free service forever, so the patience is bounded.
      if (isBefore(now, reconciliationUntil)) {
        return { granted: true, reason: "pending_reconciliation" };
      }

      return { granted: false, reason: "billing_state_stale" };

    case "trialing":
      // A trial has no renewal to wait for, so its end is always enforced and
      // the reconciliation window does not apply. A missing end date cannot be
      // verified and is treated as expired rather than as unlimited.
      return isBefore(now, currentPeriodEnd)
        ? { granted: true, reason: "trialing" }
        : { granted: false, reason: "trial_ended" };

    case "past_due":
      // The card failed and is being retried. Access continues only for as
      // long as we explicitly decided to tolerate it.
      return isBefore(now, graceUntil)
        ? { granted: true, reason: "in_grace_period" }
        : { granted: false, reason: "grace_period_expired" };

    case "paused":
      return { granted: false, reason: "paused" };

    case "canceled":
      // Terminal. A canceled subscription never grants access, whatever
      // `currentPeriodEnd` still says — a subscription that should run to the
      // end of its paid period stays `active` with `cancelAtPeriodEnd` set,
      // and only becomes `canceled` once that period is actually over.
      return { granted: false, reason: "subscription_ended" };

    // Kept apart from `incomplete` because the two mean different things in a
    // funnel report — abandoned at checkout versus still in progress — while
    // meaning exactly the same thing here: access never started.
    case "incomplete":
    case "incomplete_expired":
      return { granted: false, reason: "payment_incomplete" };

    case "unpaid":
      return { granted: false, reason: "unpaid" };

    default:
      return assertNever(status);
  }
}

/** True when `deadline` exists and `now` has not reached it. */
function isBefore(now: Date, deadline: Date | null): boolean {
  return deadline !== null && now.getTime() < deadline.getTime();
}

/**
 * Fails to compile if a subscription status is added without a rule above,
 * and throws rather than silently granting if one reaches here at runtime
 * through untyped data.
 */
function assertNever(value: never): never {
  throw new Error(`Unhandled subscription status: ${JSON.stringify(value)}`);
}
