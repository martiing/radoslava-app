import type { GoalRealism, GoalRealismResult, QuizAnswers } from "@/types/quiz";

const REALISM_ORDER: GoalRealism[] = ["realistic", "ambitious", "unrealistic"];

function stepRealism(current: GoalRealism, steps: number): GoalRealism {
  const index = REALISM_ORDER.indexOf(current);
  const nextIndex = Math.min(Math.max(index + steps, 0), REALISM_ORDER.length - 1);
  return REALISM_ORDER[nextIndex];
}

/**
 * Flags whether a participant's stated goal is achievable within the
 * one-month challenge. For weight-loss goals this is grounded in a
 * sustainable-rate calculation (kg/week); for other goals there's no
 * numeric target to check against, so it falls back to a coarser read of
 * her current activity level and stated weekly time commitment.
 *
 * The raw score/implied rate is returned alongside the label so the admin
 * dashboard can show *why* something was flagged, not just the flag.
 */
export function computeGoalRealism(answers: QuizAnswers): GoalRealismResult {
  const { activityLevel, weeklyCommitment } = answers;
  const lowReadiness = activityLevel <= 2 && weeklyCommitment <= 2;
  const highReadiness = activityLevel >= 3 && weeklyCommitment >= 4;

  if (
    answers.goal === "weight_loss" &&
    typeof answers.currentWeightKg === "number" &&
    typeof answers.targetWeightKg === "number" &&
    answers.currentWeightKg > answers.targetWeightKg
  ) {
    const impliedKgPerWeek = (answers.currentWeightKg - answers.targetWeightKg) / 4;

    let goalRealism: GoalRealism;
    if (impliedKgPerWeek <= 1) goalRealism = "realistic";
    else if (impliedKgPerWeek <= 1.5) goalRealism = "ambitious";
    else goalRealism = "unrealistic";

    if (lowReadiness) goalRealism = stepRealism(goalRealism, 1);
    else if (highReadiness) goalRealism = stepRealism(goalRealism, -1);

    return {
      goalRealism,
      goalRealismScore: Number(impliedKgPerWeek.toFixed(2)),
      impliedKgPerWeek: Number(impliedKgPerWeek.toFixed(2)),
    };
  }

  // Non-weight-loss goal (or an incomplete/non-loss weight pair): fall back
  // to readiness alone. There's no numeric target to call "unrealistic".
  const goalRealism: GoalRealism = lowReadiness ? "ambitious" : "realistic";
  const goalRealismScore = activityLevel + weeklyCommitment;

  return { goalRealism, goalRealismScore, impliedKgPerWeek: null };
}
