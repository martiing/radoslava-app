export type QuizGoal = "weight_loss" | "tone_and_shape" | "strength" | "energy_habits" | "general_health";

export type PrimaryFocus = "nutrition" | "training" | "accountability" | "mindset";

export type GoalRealism = "realistic" | "ambitious" | "unrealistic";

export interface QuizAnswers {
  goal: QuizGoal;
  currentWeightKg?: number;
  targetWeightKg?: number;
  activityLevel: number;
  weeklyCommitment: number;
  primaryFocus: PrimaryFocus;
  hasLimitations: boolean;
  limitationsNote?: string;
  expectations: string;
  extraNotes?: string;
}

export interface GoalRealismResult {
  goalRealism: GoalRealism;
  goalRealismScore: number;
  impliedKgPerWeek: number | null;
}

export interface QuizOption<TValue extends string> {
  value: TValue;
  label: string;
}
