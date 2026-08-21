"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

interface AccordionItemData {
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItemData[];
  tone?: "light" | "dark";
}

export function Accordion({ items, tone = "light" }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();
  const isDark = tone === "dark";

  return (
    <div
      className={cn(
        "divide-y overflow-hidden rounded-[1.75rem] border shadow-sm backdrop-blur-xl",
        isDark ? "divide-white/10 border-white/10 bg-white/5" : "divide-border border-white/70 bg-surface/70"
      )}
    >
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const buttonId = `${baseId}-trigger-${index}`;
        const panelId = `${baseId}-panel-${index}`;

        return (
          <div key={buttonId}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className={cn(
                  "flex min-h-11 w-full items-center justify-between gap-3 px-4 py-4 text-left text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset sm:gap-4 sm:px-6 sm:py-5 sm:text-base",
                  isDark ? "text-white hover:bg-white/5" : "text-foreground hover:bg-accent-soft/30"
                )}
              >
                <span>{item.question}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-lg font-light transition-all duration-300",
                    isOpen
                      ? "rotate-45 bg-accent text-white"
                      : isDark
                        ? "bg-white/10 text-accent-bright"
                        : "bg-accent-soft text-accent-hover"
                  )}
                >
                  +
                </span>
              </button>
            </h3>
            <div
              className={cn(
                "grid transition-all duration-300 ease-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={cn("px-4 pb-4 text-sm leading-relaxed sm:px-6 sm:pb-5 sm:text-base", isDark ? "text-white/60" : "text-muted")}
                >
                  {item.answer}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
