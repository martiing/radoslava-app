/**
 * Who may see a plan.
 *
 * Separate from the access token on purpose. A valid token proves a link was
 * issued for a participant; this answers whether that participant is entitled
 * to the content at all. Both must pass.
 *
 * Shared between the plan page and the admin panel so the two can never drift:
 * the panel must not hand out a credential for a stage the page would refuse,
 * or Radoslava ends up sending links that 404.
 */

import type { ParticipantStage } from "@/lib/admin/stages";

const STAGES_WITH_PLAN_ACCESS: ReadonlySet<ParticipantStage> = new Set([
  "added_to_group",
  "completed",
]);

/**
 * Takes an already-narrowed stage rather than a string, so a value that never
 * passed `isParticipantStage` cannot reach this decision. A typo would
 * otherwise compile and silently deny access to everyone.
 */
export function hasPlanAccess(stage: ParticipantStage): boolean {
  return STAGES_WITH_PLAN_ACCESS.has(stage);
}
