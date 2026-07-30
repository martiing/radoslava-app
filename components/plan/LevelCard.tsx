import { Lock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PLAN_PAGE_COPY, type WeekTheme } from "@/content/program-content";
import type { WeekUnlockStatus } from "@/lib/plan/weeks";

const dateFormatter = new Intl.DateTimeFormat("bg-BG", { day: "numeric", month: "long" });

export function LevelCard({ status, theme }: { status: WeekUnlockStatus; theme: WeekTheme }) {
  return (
    <Card className={status.isUnlocked ? "" : "opacity-70"}>
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-display text-lg font-semibold text-foreground">{theme.title}</h3>
        {status.isUnlocked ? (
          <Badge>{PLAN_PAGE_COPY.unlockedLabel}</Badge>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-border/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
            <Lock aria-hidden="true" className="h-3 w-3" />
            {PLAN_PAGE_COPY.lockedLabel}
          </span>
        )}
      </div>

      {status.isUnlocked ? (
        <p className="mt-4 text-base text-muted">{theme.focusHabit}</p>
      ) : (
        <p className="mt-4 text-sm text-muted">
          {PLAN_PAGE_COPY.unlocksOnPrefix} {dateFormatter.format(status.unlocksAt)}
        </p>
      )}
    </Card>
  );
}
