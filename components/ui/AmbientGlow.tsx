import { cn } from "@/lib/utils";

interface AmbientGlowProps {
  className?: string;
  variant?: "warm" | "cool";
}

/** Decorative blurred color field behind a section, so glass panels have something to blur. */
export function AmbientGlow({ className, variant = "warm" }: AmbientGlowProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-blob-drift absolute -z-10 rounded-full opacity-25 blur-3xl",
        variant === "warm" ? "bg-gradient-to-br from-accent-bright to-accent" : "bg-gradient-to-br from-lime to-accent-bright",
        className
      )}
    />
  );
}
