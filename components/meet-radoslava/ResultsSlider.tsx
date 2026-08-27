"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import type { ResultClient } from "@/types/content";

interface ResultsSliderProps {
  clients: ResultClient[];
  disclaimer: string;
}

const SWIPE_THRESHOLD_PX = 40;

export function ResultsSlider({ clients, disclaimer }: ResultsSliderProps) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const client = clients[index];

  function goTo(nextIndex: number) {
    setIndex((nextIndex + clients.length) % clients.length);
  }

  function handleTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0].clientX;
  }

  function handleTouchEnd(event: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > SWIPE_THRESHOLD_PX) {
      goTo(delta > 0 ? index - 1 : index + 1);
    }
    touchStartX.current = null;
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowLeft") goTo(index - 1);
    if (event.key === "ArrowRight") goTo(index + 1);
  }

  return (
    <div className="min-w-0" onKeyDown={handleKeyDown}>
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="min-w-0 overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 sm:p-8"
      >
        <div key={index} className="animate-fade-up flex min-w-0 flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <PlaceholderImage
                src={client.beforeSrc}
                alt={`${client.name} — преди`}
                label="Преди"
                aspectRatio="3/4"
                rounded="rounded-xl"
              />
              <p className="mt-2 text-center text-xs font-semibold uppercase tracking-wide text-white/50">Преди</p>
            </div>
            <div>
              <PlaceholderImage
                src={client.afterSrc}
                alt={`${client.name} — след`}
                label="След"
                aspectRatio="3/4"
                rounded="rounded-xl"
              />
              <p className="mt-2 text-center text-xs font-semibold uppercase tracking-wide text-white/50">След</p>
            </div>
          </div>

          <p className="min-w-0 break-words text-sm leading-relaxed text-white sm:text-base">&ldquo;{client.quote}&rdquo;</p>
          <p className="font-semibold text-white">{client.name}</p>
        </div>

        <div className="mt-6 flex min-w-0 items-center justify-between gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Предишен резултат"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-all duration-300 hover:border-accent-bright/40 hover:bg-white/10"
          >
            <ChevronLeft aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
          </button>

          <p className="text-sm font-semibold tabular-nums text-white/70 sm:hidden" aria-live="polite">
            {index + 1} / {clients.length}
          </p>

          <div role="tablist" aria-label="Резултати на клиентки" className="hidden items-center gap-2 sm:flex">
            {clients.map((dotClient, dotIndex) => (
              <button
                key={dotClient.name}
                type="button"
                role="tab"
                aria-selected={dotIndex === index}
                aria-label={`Резултат на ${dotClient.name}`}
                onClick={() => goTo(dotIndex)}
                className="group flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bright"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-2.5 rounded-full transition-all duration-300",
                    dotIndex === index ? "w-6 bg-accent-bright" : "w-2.5 bg-white/25 group-hover:bg-white/40"
                  )}
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Следващ резултат"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-all duration-300 hover:border-accent-bright/40 hover:bg-white/10"
          >
            <ChevronRight aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-white/50">{disclaimer}</p>
    </div>
  );
}
