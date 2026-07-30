export type QuizGoal = "weight_loss" | "tone_and_shape" | "strength" | "energy_habits" | "general_health";

export type PrimaryFocus = "nutrition" | "training" | "accountability" | "mindset";

export type GoalRealism = "realistic" | "ambitious" | "unrealistic";

export type TrainingTrack = "gym" | "home";

export interface QuizAnswers {
  goal: QuizGoal;
  currentWeightKg?: number;
  targetWeightKg?: number;
  activityLevel: number;
  weeklyCommitment: number;
  /** Optional: not collected before this field was added, so older quiz_answers rows may omit it. */
  trainingTrack?: TrainingTrack;
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
