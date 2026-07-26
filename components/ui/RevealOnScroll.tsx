"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

let sharedObserver: IntersectionObserver | null = null;
const callbacks = new WeakMap<Element, () => void>();

function getObserver() {
  if (sharedObserver) return sharedObserver;

  sharedObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const callback = callbacks.get(entry.target);
          callback?.();
          sharedObserver?.unobserve(entry.target);
          callbacks.delete(entry.target);
        }
      }
    },
    { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
  );

  return sharedObserver;
}

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}

export function RevealOnScroll({ children, className, delayMs = 0 }: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = getObserver();
    callbacks.set(node, () => setVisible(true));
    observer.observe(node);

    return () => {
      observer.unobserve(node);
      callbacks.delete(node);
    };
  }, []);

  return (
    <div
      ref={ref}
      data-reveal
      className={cn(
        "transition-all duration-700 ease-out will-change-transform",
        visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-8 scale-[0.96] opacity-0",
        className
      )}
      style={{ transitionDelay: visible ? `${delayMs}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
