export interface WeekUnlockStatus {
  week: 1 | 2 | 3 | 4;
  unlocksAt: Date;
  isUnlocked: boolean;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Purely a function of calendar time vs. the shared cohort start date —
 * never per-participant, never persisted. "Stays unlocked once unlocked"
 * falls out for free since `now` only moves forward.
 */
export function getWeekUnlockStatuses(startDateIso: string, now: Date = new Date()): WeekUnlockStatus[] {
  const start = new Date(startDateIso);

  return ([1, 2, 3, 4] as const).map((week) => {
    const unlocksAt = new Date(start.getTime() + (week - 1) * WEEK_MS);
    return { week, unlocksAt, isUnlocked: now.getTime() >= unlocksAt.getTime() };
  });
}
