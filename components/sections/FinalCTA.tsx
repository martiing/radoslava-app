import { Rocket } from "lucide-react";
import { siteConfig } from "@/content/site-config";
import { Button } from "@/components/ui/Button";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SectionIcon } from "@/components/ui/SectionIcon";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { AmbientGlow } from "@/components/ui/AmbientGlow";

export function FinalCTA() {
  const { finalCta } = siteConfig;

  return (
    <SectionContainer id="final-cta" headingId="final-cta-heading" className="relative overflow-hidden">
      <AmbientGlow variant="warm" className="left-1/2 top-0 h-96 w-96 -translate-x-1/2" />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <RevealOnScroll className="flex w-full flex-col items-center">
          <SectionIcon icon={Rocket} />
          <h2 id="final-cta-heading" className="w-full font-display text-3xl font-semibold text-foreground sm:text-4xl">
            {finalCta.headline}
          </h2>
          <p className="mt-4 w-full text-lg text-muted">{finalCta.body}</p>
          <Button href="#registration" className="mt-8">
            {finalCta.ctaLabel}
          </Button>
        </RevealOnScroll>
      </div>
    </SectionContainer>
  );
}
