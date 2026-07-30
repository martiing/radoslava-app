import type { QuizAnswers, TrainingTrack } from "@/types/quiz";

export type NutritionTier = "calorie_deficit" | "maintenance_recomp";
export type TrainingLevel = "beginner" | "intermediate" | "advanced";

/** Two tiers, not per-participant macros — same "reasonable heuristic, not clinical" spirit as the goal-realism scoring. */
export function getNutritionTier(goal: QuizAnswers["goal"]): NutritionTier {
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
