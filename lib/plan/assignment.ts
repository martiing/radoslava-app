import type { QuizAnswers, QuizGoal, TrainingTrack } from "@/types/quiz";
import type { IntakeExperienceLevel, IntakeGoal, IntakeTrainingTrack } from "@/types/intake";

export type NutritionTier = "calorie_deficit" | "maintenance_recomp";
export type TrainingLevel = "beginner" | "intermediate" | "advanced";

/** Two tiers, not per-participant macros — same "reasonable heuristic, not clinical" spirit as the goal-realism scoring. */
export function getNutritionTier(goal: QuizGoal | IntakeGoal): NutritionTier {
  return goal === "weight_loss" ? "calorie_deficit" : "maintenance_recomp";
}

export function getTrainingLevel(activityLevel: number): TrainingLevel {
  if (activityLevel <= 2) return "beginner";
  if (activityLevel === 3) return "intermediate";
  return "advanced";
}

/** Falls back to "home" for participants who completed the quiz before this question existed. */
export function getTrainingTrack(answers: Pick<QuizAnswers, "trainingTrack">): TrainingTrack {
  return answers.trainingTrack ?? "home";
}

export function getTrainingPlanKey(answers: QuizAnswers): `${TrainingLevel}_${TrainingTrack}` {
  return `${getTrainingLevel(answers.activityLevel)}_${getTrainingTrack(answers)}`;
}

/**
 * Used by the 5-question intake, which collects experience level directly
 * instead of deriving it from an activity-frequency scale. No "both" plan
 * content exists yet, so a participant who trains both at the gym and at
 * home is assigned the home plan (least equipment required, so it still
 * works for her).
 */
export function getTrainingPlanKeyFromLevel(
  level: IntakeExperienceLevel,
  track: IntakeTrainingTrack
): `${TrainingLevel}_${TrainingTrack}` {
  const resolvedTrack: TrainingTrack = track === "both" ? "home" : track;
  return `${level}_${resolvedTrack}`;
}
