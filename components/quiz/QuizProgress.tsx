interface QuizProgressProps {
  step: number;
  totalSteps: number;
}

export function QuizProgress({ step, totalSteps }: QuizProgressProps) {
  const percent = Math.round(((step + 1) / totalSteps) * 100);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs font-medium text-muted">
        <span>
          Въпрос {step + 1} от {totalSteps}
        </span>
        <span>{percent}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
