export type ParticipantStage =
  | "registered"
  | "quiz_completed"
  | "emailed"
  | "messaged_viber"
  | "paid"
  | "added_to_group"
  | "completed"
  | "cancelled";

export const STAGE_ORDER: ParticipantStage[] = [
  "registered",
  "quiz_completed",
  "emailed",
  "messaged_viber",
  "paid",
  "added_to_group",
  "completed",
];

export const STAGE_LABELS: Record<ParticipantStage, string> = {
  registered: "Регистрирана",
  quiz_completed: "Попълнен въпросник",
  emailed: "Изпратен имейл",
  messaged_viber: "Писано във Viber",
  paid: "Платено",
  added_to_group: "Добавена в групата",
  completed: "Завършила предизвикателството",
  cancelled: "Отказала се",
};

/** Tailwind classes per stage, ordered roughly cold -> warm -> done, so the pipeline reads at a glance. */
export const STAGE_COLORS: Record<ParticipantStage, string> = {
  registered: "bg-neutral-100 text-neutral-600",
  quiz_completed: "bg-sky-100 text-sky-700",
  emailed: "bg-indigo-100 text-indigo-700",
  messaged_viber: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  added_to_group: "bg-green-100 text-green-800",
  completed: "bg-violet-100 text-violet-700",
  cancelled: "bg-red-100 text-red-700",
};

export const GOAL_REALISM_LABELS: Record<string, string> = {
  realistic: "Реалистична",
  ambitious: "Амбициозна",
  unrealistic: "Нереалистична",
};

/** The manual, Radoslava-driven transitions surfaced as buttons on the participant detail page. */
export const MANUAL_STAGE_TRANSITIONS: { stage: ParticipantStage; label: string }[] = [
  { stage: "messaged_viber", label: "Отбележи като писано във Viber" },
  { stage: "paid", label: "Отбележи като платено" },
  { stage: "added_to_group", label: "Отбележи като добавена в групата" },
  { stage: "completed", label: "Отбележи като завършила" },
  { stage: "cancelled", label: "Отбележи като отказала се" },
];

const STAGE_TIMESTAMP_COLUMN: Partial<Record<ParticipantStage, string>> = {
  quiz_completed: "quiz_completed_at",
  emailed: "emailed_at",
  messaged_viber: "messaged_viber_at",
  paid: "paid_at",
  added_to_group: "added_to_group_at",
};

export function getStageTimestampColumn(stage: ParticipantStage): string | undefined {
  return STAGE_TIMESTAMP_COLUMN[stage];
}
