import { STAGE_COLORS, STAGE_LABELS, type ParticipantStage } from "@/lib/admin/stages";
import { cn } from "@/lib/utils";

export function StageBadge({ stage }: { stage: ParticipantStage }) {
  const colorClasses = STAGE_COLORS[stage] ?? "bg-neutral-100 text-neutral-600";
  const label = STAGE_LABELS[stage] ?? stage;

  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-medium", colorClasses)}>
      {label}
    </span>
  );
}
