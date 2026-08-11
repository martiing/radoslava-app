"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SiteConfig } from "@/types/content";

interface ObstacleChipsProps {
  chips: SiteConfig["fitCheck"]["chips"];
  chipsLabel: string;
  defaultPanelText: string;
}

export function ObstacleChips({ chips, chipsLabel, defaultPanelText }: ObstacleChipsProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = chips.find((chip) => chip.id === selectedId) ?? null;

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-white/60">{chipsLabel}</p>

      <div role="group" aria-label={chipsLabel} className="flex flex-wrap justify-center gap-3">
        {chips.map((chip) => {
          const isSelected = chip.id === selectedId;
          return (
            <button
              key={chip.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedId(chip.id)}
              className={cn(
                "rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-300",
                isSelected
                  ? "border-accent-bright bg-accent-bright/90 text-white shadow-md shadow-accent-bright/20"
                  : "border-white/15 bg-white/5 text-white/80 hover:-translate-y-0.5 hover:border-accent-bright/30 hover:bg-white/10"
              )}
            >
              {chip.problem}
            </button>
          );
        })}
      </div>

      <div
        aria-live="polite"
        className="flex min-h-26 w-full items-center justify-center rounded-[1.75rem] border border-white/10 bg-white/5 px-6 py-6 text-center backdrop-blur-sm transition-all duration-300 sm:p-8"
      >
        {selected ? (
          <p className="flex items-start gap-3 text-left text-white">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime/30 text-lime">
              <Check aria-hidden="true" className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <span>{selected.solution}</span>
          </p>
        ) : (
          <p className="text-white/60">{defaultPanelText}</p>
        )}
      </div>
    </div>
  );
}
