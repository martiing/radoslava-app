import { HeartHandshake } from "lucide-react";
import { siteConfig } from "@/content/site-config";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SectionIcon } from "@/components/ui/SectionIcon";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { ObstacleChips } from "@/components/offer/ObstacleChips";

export function FitCheck() {
  const { fitCheck } = siteConfig;

  return (
    <SectionContainer id="fit-check" headingId="fit-check-heading" tone="dark">
      <RevealOnScroll>
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <SectionIcon icon={HeartHandshake} tone="inverted" />
          <h2 id="fit-check-heading" className="w-full font-display text-3xl font-semibold text-white sm:text-4xl">
            {fitCheck.heading}
          </h2>
          <p className="mt-4 w-full text-lg text-white/70">{fitCheck.subhead}</p>
        </div>
      </RevealOnScroll>

      <RevealOnScroll delayMs={100}>
        <div className="mx-auto mt-10 max-w-3xl">
          <ObstacleChips chips={fitCheck.chips} chipsLabel={fitCheck.chipsLabel} defaultPanelText={fitCheck.defaultPanelText} />
        </div>
      </RevealOnScroll>
    </SectionContainer>
  );
}
