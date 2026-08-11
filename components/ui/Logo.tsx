import { cn } from "@/lib/utils";

interface LogoProps {
  shortName: string;
  fullName: string;
  mobileName?: string;
  className?: string;
  tone?: "default" | "inverted";
}

/** Compact horizontal lockup for the sticky header. */
export function Logo({ shortName, fullName, mobileName, className, tone = "default" }: LogoProps) {
  return (
    <span className={cn("inline-flex items-baseline gap-2.5", className)}>
      <span
        className={cn(
          "font-brand text-2xl font-semibold tracking-[-0.03em]",
          tone === "inverted" ? "text-white" : "text-accent"
        )}
      >
        {shortName}
      </span>
      <span
        className={cn(
          "text-[10px] font-semibold uppercase tracking-[0.16em] sm:tracking-[0.2em]",
          tone === "inverted" ? "text-white/70" : "text-muted"
        )}
      >
        <span className="sm:hidden">{mobileName ?? fullName}</span>
        <span className="hidden sm:inline">{fullName}</span>
      </span>
    </span>
  );
}

/** Larger stacked lockup for the footer / splash contexts. */
export function LogoStacked({ shortName, fullName, className, tone = "default" }: LogoProps) {
  return (
    <div className={cn("flex flex-col items-start", className)}>
      <span
        className={cn(
          "font-brand text-4xl font-semibold tracking-[-0.04em] sm:text-5xl",
          tone === "inverted" ? "text-accent-bright" : "text-accent"
        )}
      >
        {shortName}
      </span>
      <span
        className={cn(
          "mt-1 text-xs font-semibold uppercase tracking-[0.3em]",
          tone === "inverted" ? "text-white/70" : "text-muted"
        )}
      >
        {fullName}
      </span>
    </div>
  );
}
