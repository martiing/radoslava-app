import { cn, wideContainer } from "@/lib/utils";

type SectionTone = "light" | "tint" | "dark";

interface SectionContainerProps {
  id: string;
  headingId: string;
  className?: string;
  children: React.ReactNode;
  tone?: SectionTone;
}

const toneClasses: Record<SectionTone, string> = {
  light: "border-white/50 bg-surface/45",
  tint: "border-accent/15 bg-accent-soft/35",
  dark: "border-white/10 bg-plum",
};

export function SectionContainer({ id, headingId, className, children, tone = "light" }: SectionContainerProps) {
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        wideContainer,
        "my-6 scroll-mt-24 rounded-[2.5rem] border px-8 py-14 shadow-[0_1px_3px_rgba(27,22,38,0.04)] backdrop-blur-xl transition-colors duration-300 sm:my-10 sm:px-14 sm:py-20 lg:px-20",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </section>
  );
}
