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
