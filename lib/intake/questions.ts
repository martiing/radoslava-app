import type { IntakeExperienceLevel, IntakeGoal, IntakeOption, IntakeTrainingTrack } from "@/types/intake";

/**
 * Bulgarian copy for the 5-question registration intake. Kept separate from
 * content/site-config.ts because it's shaped around question/option data
 * rather than the landing-page SiteConfig sections (same reasoning as
 * lib/quiz/questions.ts for the earlier 9-question quiz).
 */

export const INTAKE_GOAL_OPTIONS: IntakeOption<IntakeGoal>[] = [
  { value: "weight_loss", label: "Отслабване" },
  { value: "tone_and_shape", label: "Стягане и тонус" },
  { value: "muscle_gain", label: "Мускулна маса" },
  { value: "general_health", label: "Общо здраве и форма" },
];

export const INTAKE_TRACK_OPTIONS: IntakeOption<IntakeTrainingTrack>[] = [
  { value: "gym", label: "Във фитнес" },
  { value: "home", label: "У дома" },
  { value: "both", label: "И двете" },
];

export const INTAKE_LEVEL_OPTIONS: IntakeOption<IntakeExperienceLevel>[] = [
  { value: "beginner", label: "Начинаеща" },
  { value: "intermediate", label: "Средно ниво" },
  { value: "advanced", label: "Напреднала" },
];

export const INTAKE_COPY = {
  name: { label: "Име" },
  phone: { label: "Телефон (за връзка във Viber)" },
  goal: { question: "Основна цел" },
  trainingTrack: { question: "Къде ще тренираш" },
  experienceLevel: { question: "Ниво на опит" },
} as const;
