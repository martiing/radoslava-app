import type { TrainingLevel } from "@/lib/plan/assignment";

export type IntakeGoal = "weight_loss" | "tone_and_shape" | "muscle_gain" | "general_health";

export type IntakeTrainingTrack = "gym" | "home" | "both";

export type IntakeExperienceLevel = TrainingLevel;

export interface IntakeOption<TValue extends string> {
  value: TValue;
  label: string;
}
