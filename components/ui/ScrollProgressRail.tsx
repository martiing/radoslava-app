"use client";

import { useEffect, useRef, useState } from "react";

const WEEK_LABELS = ["Седмица 1", "Седмица 2", "Седмица 3", "Седмица 4"];

export function ScrollProgressRail() {
  const [progress, setProgress] = useState(0);
  const ticking = useRef(false);

  useEffect(() => {
    function measure() {
      const scrollTop = window.scrollY;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? scrollTop / scrollable : 0;
      setProgress(Math.min(1, Math.max(0, ratio)));
      ticking.current = false;
    }

    function onScroll() {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(measure);
      }
    }

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <>
      {/* Mobile / tablet: slim top progress bar, tracking the whole page's read-through. */}
      <div
        aria-hidden="true"
        className="fixed left-0 top-0 z-50 h-1 w-full bg-border/60 lg:hidden"
      >
        <div
          className="h-full bg-gradient-to-r from-accent to-lime"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Desktop: a vertical "4 weeks" rail — the page's own progress echoes the program's structure. */}
      <div
        aria-hidden="true"
        className="fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 lg:flex lg:flex-col lg:items-center lg:gap-0"
      >
        <div className="relative h-64 w-px bg-border">
          <div
            className="absolute left-0 top-0 w-px bg-gradient-to-b from-accent to-lime"
            style={{ height: `${progress * 100}%` }}
          />
          {WEEK_LABELS.map((label, index) => {
            const stepRatio = index / (WEEK_LABELS.length - 1);
            const reached = progress >= stepRatio - 0.02;
            return (
              <div
                key={label}
                className="absolute left-1/2 -translate-x-1/2"
                style={{ top: `${stepRatio * 100}%` }}
              >
                <span
                  className="group relative block h-2.5 w-2.5 -translate-y-1/2 rounded-full border transition-colors duration-300"
                  style={{
                    backgroundColor: reached ? "var(--accent)" : "var(--surface)",
                    borderColor: reached ? "var(--accent)" : "var(--border)",
                  }}
                >
                  <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-full bg-plum px-2.5 py-1 font-sans text-[11px] font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    {label}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
