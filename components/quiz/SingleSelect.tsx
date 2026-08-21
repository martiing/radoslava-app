"use client";

import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SingleSelectProps<TValue extends string> {
  legend: string;
  name: string;
  options: ReadonlyArray<{ value: TValue; label: string; icon?: LucideIcon }>;
  value: TValue | null;
  onChange: (value: TValue) => void;
  error?: string;
  layout?: "grid" | "row";
}

export function SingleSelect<TValue extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  error,
  layout = "grid",
}: SingleSelectProps<TValue>) {
  const errorId = `${name}-error`;

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="text-lg font-semibold text-foreground">{legend}</legend>
      <div
        role="radiogroup"
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "grid gap-3",
          layout === "grid" ? "sm:grid-cols-2" : "grid-cols-1"
        )}
      >
        {options.map((option) => {
          const isSelected = value === option.value;
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(option.value)}
              className={cn(
                "group relative flex items-center gap-3 rounded-2xl border px-4 py-4 text-left text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/15",
                isSelected
                  ? "border-accent bg-accent-soft text-accent-hover shadow-sm"
                  : "border-border bg-surface/80 text-foreground hover:border-accent/40 hover:bg-accent-soft/20"
              )}
            >
              {Icon && (
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-200",
                    isSelected ? "bg-accent text-white" : "bg-accent-soft/60 text-accent-hover"
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
              )}
              <span className="flex-1">{option.label}</span>
              {isSelected && (
                <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-accent-hover" strokeWidth={2.5} />
              )}
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
