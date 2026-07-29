"use client";

import { cn } from "@/lib/utils";

interface SingleSelectProps<TValue extends string> {
  legend: string;
  name: string;
  options: ReadonlyArray<{ value: TValue; label: string }>;
  value: TValue | null;
  onChange: (value: TValue) => void;
  error?: string;
}

export function SingleSelect<TValue extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  error,
}: SingleSelectProps<TValue>) {
  const errorId = `${name}-error`;

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-medium text-foreground">{legend}</legend>
      <div
        role="radiogroup"
        aria-describedby={error ? errorId : undefined}
        className="flex flex-wrap gap-2"
      >
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(option.value)}
              className={cn(
                "rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/15",
                isSelected
                  ? "border-accent bg-accent-soft text-accent-hover"
                  : "border-border bg-surface/80 text-foreground hover:border-accent/40"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {error && (
        <p id={errorId} className="text-sm text-accent">
          {error}
        </p>
      )}
    </fieldset>
  );
}
