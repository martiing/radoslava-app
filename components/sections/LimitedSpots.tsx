import { Hourglass } from "lucide-react";
import { siteConfig } from "@/content/site-config";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SectionIcon } from "@/components/ui/SectionIcon";
import { Button } from "@/components/ui/Button";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export function LimitedSpots() {
  const { limitedSpots } = siteConfig;

  return (
    <SectionContainer id="limited-spots" headingId="limited-spots-heading" tone="dark">
      <RevealOnScroll>
        <div className="mx-auto flex max-w-2xl flex-col items-center rounded-[1.75rem] border border-white/70 bg-surface/95 p-8 text-center shadow-2xl sm:p-12">
          <SectionIcon icon={Hourglass} />
          <h2 id="limited-spots-heading" className="w-full font-display text-3xl font-semibold text-foreground">
            {limitedSpots.heading}
          </h2>
          <p className="mt-4 w-full text-lg leading-relaxed text-muted">{limitedSpots.reasonText}</p>
          <div className="mt-6 flex w-full flex-col gap-1 text-sm font-medium text-foreground">
            <p>{limitedSpots.registrationDeadline}</p>
          </div>
          <Button href="#registration" className="mt-8">
            {limitedSpots.ctaLabel}
          </Button>
        </div>
      </RevealOnScroll>
    </SectionContainer>
  );
}
