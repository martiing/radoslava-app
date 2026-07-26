import { cn } from "@/lib/utils";

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-white/60 bg-surface/60 p-7 shadow-[0_1px_2px_rgba(27,22,38,0.05)] backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-1 hover:border-accent/30 hover:bg-surface/80 hover:shadow-xl hover:shadow-accent/10 sm:p-9",
        className
      )}
    >
      {children}
    </div>
  );
}
