import { describe, expect, it } from "vitest";
import { evaluateEntitlement } from "@/lib/billing/entitlement";
import { SUBSCRIPTION_STATUSES, type EntitlementInput } from "@/types/billing";

const NOW = new Date("2026-08-05T12:00:00.000Z");
const EARLIER = new Date("2026-08-01T12:00:00.000Z");
const LATER = new Date("2026-09-01T12:00:00.000Z");

/** One millisecond before and after NOW, for end-exclusive boundary checks. */
const JUST_BEFORE_NOW = new Date(NOW.getTime() - 1);
const JUST_AFTER_NOW = new Date(NOW.getTime() + 1);

function subscription(overrides: Partial<EntitlementInput> = {}): EntitlementInput {
  return {
    status: "active",
    currentPeriodEnd: LATER,
    cancelAtPeriodEnd: false,
    graceUntil: null,
    reconciliationUntil: null,
    ...overrides,
  };
}

describe("no subscription", () => {
  it("denies access", () => {
    expect(evaluateEntitlement(null, NOW)).toEqual({
      granted: false,
      reason: "no_subscription",
    });
  });
});

describe("active", () => {
  it("grants access inside the paid period", () => {
    expect(evaluateEntitlement(subscription(), NOW)).toEqual({
      granted: true,
      reason: "active",
    });
  });

  // A renewal and the webhook reporting it do not land together, so a short
  // window of trust prevents locking out someone who has just paid.
  it("grants access after the period end while inside the reconciliation window", () => {
    expect(
      evaluateEntitlement(
        subscription({ currentPeriodEnd: EARLIER, reconciliationUntil: LATER }),
        NOW
      )
    ).toEqual({ granted: true, reason: "pending_reconciliation" });
  });

  // Without a bound, a subscription whose webhooks stopped arriving would
  // keep access forever and an outage would become free service.
  it("denies access once the reconciliation window has passed", () => {
    expect(
      evaluateEntitlement(
        subscription({ currentPeriodEnd: EARLIER, reconciliationUntil: EARLIER }),
        NOW
      )
    ).toEqual({ granted: false, reason: "billing_state_stale" });
  });

  it("denies access after the period end when no reconciliation window was set", () => {
    expect(
      evaluateEntitlement(
        subscription({ currentPeriodEnd: EARLIER, reconciliationUntil: null }),
        NOW
      )
    ).toEqual({ granted: false, reason: "billing_state_stale" });
  });

  it("denies access when the period end is unknown and no window was set", () => {
    expect(
      evaluateEntitlement(subscription({ currentPeriodEnd: null, reconciliationUntil: null }), NOW)
    ).toEqual({ granted: false, reason: "billing_state_stale" });
  });

  it("falls back to the reconciliation window when the period end is unknown", () => {
    expect(
      evaluateEntitlement(
        subscription({ currentPeriodEnd: null, reconciliationUntil: LATER }),
        NOW
      ).granted
    ).toBe(true);
  });
});

describe("active, set to cancel at period end", () => {
  it("keeps access until the paid period is over", () => {
    expect(
      evaluateEntitlement(subscription({ cancelAtPeriodEnd: true, currentPeriodEnd: LATER }), NOW)
    ).toEqual({ granted: true, reason: "canceling_at_period_end" });
  });

  it("denies access once the paid period has passed", () => {
    expect(
      evaluateEntitlement(subscription({ cancelAtPeriodEnd: true, currentPeriodEnd: EARLIER }), NOW)
    ).toEqual({ granted: false, reason: "subscription_ended" });
  });

  it("denies access when the period end is unknown", () => {
    expect(
      evaluateEntitlement(subscription({ cancelAtPeriodEnd: true, currentPeriodEnd: null }), NOW)
        .granted
    ).toBe(false);
  });

  // No renewal is coming, so nothing extends the deadline.
  it("ignores the reconciliation window", () => {
    expect(
      evaluateEntitlement(
        subscription({
          cancelAtPeriodEnd: true,
          currentPeriodEnd: EARLIER,
          reconciliationUntil: LATER,
        }),
        NOW
      )
    ).toEqual({ granted: false, reason: "subscription_ended" });
  });
});

describe("trialing", () => {
  it("grants access before the trial ends", () => {
    expect(evaluateEntitlement(subscription({ status: "trialing" }), NOW)).toEqual({
      granted: true,
      reason: "trialing",
    });
  });

  it("denies access after the trial ends", () => {
    expect(
      evaluateEntitlement(subscription({ status: "trialing", currentPeriodEnd: EARLIER }), NOW)
    ).toEqual({ granted: false, reason: "trial_ended" });
  });

  // An unverifiable trial end is treated as expired, not as unlimited.
  it("denies access when the trial end is unknown", () => {
    expect(
      evaluateEntitlement(subscription({ status: "trialing", currentPeriodEnd: null }), NOW)
    ).toEqual({ granted: false, reason: "trial_ended" });
  });

  it("ignores the reconciliation window", () => {
    expect(
      evaluateEntitlement(
        subscription({
          status: "trialing",
          currentPeriodEnd: EARLIER,
          reconciliationUntil: LATER,
        }),
        NOW
      ).granted
    ).toBe(false);
  });
});

describe("past_due", () => {
  it("grants access inside the explicit grace window", () => {
    expect(
      evaluateEntitlement(subscription({ status: "past_due", graceUntil: LATER }), NOW)
    ).toEqual({ granted: true, reason: "in_grace_period" });
  });

  it("denies access once the grace window has passed", () => {
    expect(
      evaluateEntitlement(subscription({ status: "past_due", graceUntil: EARLIER }), NOW)
    ).toEqual({ granted: false, reason: "grace_period_expired" });
  });

  it("denies access when no grace was granted", () => {
    expect(
      evaluateEntitlement(subscription({ status: "past_due", graceUntil: null }), NOW)
    ).toEqual({ granted: false, reason: "grace_period_expired" });
  });

  // Grace is our decision about a failed card; the billing period is the
  // provider's schedule. A long remaining period must not extend tolerance,
  // and neither must the reconciliation window.
  it("ignores the billing period and the reconciliation window", () => {
    expect(
      evaluateEntitlement(
        subscription({
          status: "past_due",
          currentPeriodEnd: LATER,
          reconciliationUntil: LATER,
          graceUntil: EARLIER,
        }),
        NOW
      ).granted
    ).toBe(false);
  });
});

describe("paused", () => {
  it("denies access", () => {
    expect(evaluateEntitlement(subscription({ status: "paused" }), NOW)).toEqual({
      granted: false,
      reason: "paused",
    });
  });
});

describe("canceled", () => {
  it("denies access", () => {
    expect(evaluateEntitlement(subscription({ status: "canceled" }), NOW)).toEqual({
      granted: false,
      reason: "subscription_ended",
    });
  });

  // A subscription that should run to the end of its paid period stays
  // `active` with `cancelAtPeriodEnd`. Reaching `canceled` means it is over,
  // so no remaining window may resurrect access.
  it("denies access even with a future period end, grace and reconciliation window", () => {
    expect(
      evaluateEntitlement(
        subscription({
          status: "canceled",
          currentPeriodEnd: LATER,
          graceUntil: LATER,
          reconciliationUntil: LATER,
        }),
        NOW
      ).granted
    ).toBe(false);
  });
});

describe("never-started and exhausted subscriptions", () => {
  // Distinct statuses for reporting, identical decision here.
  it("denies an incomplete first payment", () => {
    expect(evaluateEntitlement(subscription({ status: "incomplete" }), NOW)).toEqual({
      granted: false,
      reason: "payment_incomplete",
    });
  });

  it("denies an expired incomplete first payment the same way", () => {
    expect(evaluateEntitlement(subscription({ status: "incomplete_expired" }), NOW)).toEqual({
      granted: false,
      reason: "payment_incomplete",
    });
  });

  it("denies an unpaid subscription", () => {
    expect(evaluateEntitlement(subscription({ status: "unpaid" }), NOW)).toEqual({
      granted: false,
      reason: "unpaid",
    });
  });
});

describe("deadline boundaries are end-exclusive", () => {
  it("denies access at the exact moment a grace window ends", () => {
    expect(
      evaluateEntitlement(subscription({ status: "past_due", graceUntil: NOW }), NOW).granted
    ).toBe(false);
  });

  it("grants access one millisecond before a grace window ends", () => {
    expect(
      evaluateEntitlement(subscription({ status: "past_due", graceUntil: NOW }), JUST_BEFORE_NOW)
        .granted
    ).toBe(true);
  });

  it("denies access at the exact moment a trial ends", () => {
    expect(
      evaluateEntitlement(subscription({ status: "trialing", currentPeriodEnd: NOW }), NOW).granted
    ).toBe(false);
  });

  it("grants access one millisecond before a trial ends", () => {
    expect(
      evaluateEntitlement(
        subscription({ status: "trialing", currentPeriodEnd: NOW }),
        JUST_BEFORE_NOW
      ).granted
    ).toBe(true);
  });

  it("denies access at the exact moment a canceling subscription's period ends", () => {
    expect(
      evaluateEntitlement(
        subscription({ cancelAtPeriodEnd: true, currentPeriodEnd: NOW }),
        NOW
      ).granted
    ).toBe(false);
  });

  it("grants access one millisecond before a canceling subscription's period ends", () => {
    expect(
      evaluateEntitlement(
        subscription({ cancelAtPeriodEnd: true, currentPeriodEnd: NOW }),
        JUST_BEFORE_NOW
      ).granted
    ).toBe(true);
  });

  it("denies access at the exact moment a reconciliation window ends", () => {
    expect(
      evaluateEntitlement(
        subscription({ currentPeriodEnd: EARLIER, reconciliationUntil: NOW }),
        NOW
      ).granted
    ).toBe(false);
  });

  it("grants access one millisecond before a reconciliation window ends", () => {
    expect(
      evaluateEntitlement(
        subscription({ currentPeriodEnd: EARLIER, reconciliationUntil: JUST_AFTER_NOW }),
        NOW
      ).granted
    ).toBe(true);
  });
});

describe("coverage", () => {
  // Walks the exported constant, so adding a status without a rule fails here
  // as well as at the type level.
  it("returns a decision for every published status", () => {
    for (const status of SUBSCRIPTION_STATUSES) {
      const decision = evaluateEntitlement(subscription({ status }), NOW);
      expect(typeof decision.granted).toBe("boolean");
      expect(decision.reason).toBeTruthy();
    }
  });

  it("grants access only to trialing, active and grace-period subscriptions", () => {
    const granted = SUBSCRIPTION_STATUSES.filter(
      (status) => evaluateEntitlement(subscription({ status, graceUntil: LATER }), NOW).granted
    );

    expect(granted).toEqual(["trialing", "active", "past_due"]);
  });
});
