"use client";

import { useState } from "react";
import { Check, Dumbbell, Home, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SiteConfig } from "@/types/content";

type Track = "home" | "gym";

interface DayPreviewToggleProps {
  copy: SiteConfig["offerBlock"]["dayPreview"];
}

export function DayPreviewToggle({ copy }: DayPreviewToggleProps) {
  const [track, setTrack] = useState<Track>("home");
  const isHome = track === "home";

  return (
    <div className="rounded-[1.75rem] border border-white/70 bg-surface/70 p-6 backdrop-blur-xl sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="font-display text-lg font-semibold text-foreground">{copy.heading}</h3>
        <div role="group" aria-label={copy.heading} className="inline-flex rounded-full border border-border bg-background/60 p-1">
          <button
            type="button"
            aria-pressed={isHome}
            onClick={() => setTrack("home")}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-300",
              isHome ? "bg-accent text-white shadow-sm" : "text-muted hover:text-foreground"
            )}
          >
            {copy.toggleHomeLabel}
          </button>
          <button
            type="button"
            aria-pressed={!isHome}
            onClick={() => setTrack("gym")}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-300",
              !isHome ? "bg-accent text-white shadow-sm" : "text-muted hover:text-foreground"
            )}
          >
            {copy.toggleGymLabel}
          </button>
        </div>
      </div>

      <ul className="mt-6 flex flex-col gap-4">
        <li className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-hover">
            <Utensils aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <span className="text-foreground">{copy.mealLine}</span>
        </li>
        <li className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-hover transition-colors duration-300">
            {isHome ? (
              <Home aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
            ) : (
              <Dumbbell aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
            )}
          </span>
          <span aria-live="polite" className="text-foreground">
            {isHome ? copy.workoutHomeLine : copy.workoutGymLine}
          </span>
        </li>
        <li className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime/30 text-accent-hover">
            <Check aria-hidden="true" className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="text-muted">{copy.doneLine}</span>
        </li>
      </ul>
    </div>
  );
}
