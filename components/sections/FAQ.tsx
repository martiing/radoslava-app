import { CircleHelp } from "lucide-react";
import { siteConfig } from "@/content/site-config";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SectionIcon } from "@/components/ui/SectionIcon";
import { Accordion } from "@/components/ui/Accordion";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export function FAQ() {
  const { faq } = siteConfig;

  return (
    <SectionContainer id="faq" headingId="faq-heading" tone="dark">
      <RevealOnScroll>
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <SectionIcon icon={CircleHelp} tone="inverted" />
          <h2 id="faq-heading" className="w-full font-display text-3xl font-semibold text-white sm:text-4xl">
            {faq.heading}
          </h2>
        </div>
      </RevealOnScroll>

      <div className="mx-auto mt-10 max-w-3xl">
        <Accordion items={faq.items} tone="dark" />
      </div>
    </SectionContainer>
  );
}
