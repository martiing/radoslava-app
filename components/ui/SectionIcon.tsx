import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionIconProps {
  icon: LucideIcon;
  className?: string;
  tone?: "accent" | "lime" | "inverted";
}

export function SectionIcon({ icon: Icon, className, tone = "accent" }: SectionIconProps) {
  return (
    <span
      className={cn(
        "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl",
        tone === "accent" && "bg-accent-soft text-accent-hover",
        tone === "lime" && "bg-lime/20 text-lime",
        tone === "inverted" && "bg-white/10 text-accent-bright",
        className
      )}
    >
      <Icon aria-hidden="true" className="h-6 w-6" strokeWidth={1.75} />
    </span>
  );
}
