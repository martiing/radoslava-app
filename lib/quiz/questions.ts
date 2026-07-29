import type { PrimaryFocus, QuizGoal, QuizOption } from "@/types/quiz";

/**
 * Bulgarian copy for the registration quiz. Kept separate from
 * content/site-config.ts because it's shaped around quiz question/option
 * data rather than the landing-page SiteConfig sections.
 */

export const GOAL_OPTIONS: QuizOption<QuizGoal>[] = [
  { value: "weight_loss", label: "Отслабване" },
  { value: "tone_and_shape", label: "Оформяне на тялото" },
  { value: "strength", label: "Сила и издръжливост" },
  { value: "energy_habits", label: "Повече енергия и по-добри навици" },
  { value: "general_health", label: "Общо здраве и самочувствие" },
];

export const FOCUS_OPTIONS: QuizOption<PrimaryFocus>[] = [
  { value: "nutrition", label: "Хранене" },
  { value: "training", label: "Тренировки" },
  { value: "accountability", label: "Подкрепа и отговорност" },
  { value: "mindset", label: "Нагласа и мотивация" },
];

export const QUIZ_COPY = {
  goal: {
    question: "Каква е основната ти цел за следващия месец?",
  },
  weight: {
    question: "Кажи ни малко повече за теглото си.",
    currentLabel: "Текущо тегло (кг)",
    targetLabel: "Целево тегло след месец (кг)",
  },
  activityLevel: {
    question: "Колко тренировки на седмица правиш в момента?",
    minLabel: "Нито една",
    maxLabel: "5 или повече",
  },
  weeklyCommitment: {
    question: "Колко реалистично е за теб да отделяш 3–4 часа седмично през следващия месец?",
    minLabel: "Трудно постижимо",
    maxLabel: "Напълно постижимо",
  },
  primaryFocus: {
    question: "Къде имаш най-голяма нужда от помощ?",
  },
  limitations: {
    question: "Имаш ли здравословни ограничения или травми, за които трябва да знаем?",
    yesLabel: "Да",
    noLabel: "Не",
    noteLabel: "Разкажи ни накратко",
  },
  expectations: {
    question: "Какво очакваш да постигнеш до края на предизвикателството?",
  },
  extraNotes: {
    question: "Нещо друго, което искаш да ни кажеш преди началото? (по желание)",
  },
} as const;
