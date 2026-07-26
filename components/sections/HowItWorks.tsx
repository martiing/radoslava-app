import { Route } from "lucide-react";
import { siteConfig } from "@/content/site-config";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SectionIcon } from "@/components/ui/SectionIcon";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export function HowItWorks() {
  const { howItWorks } = siteConfig;

  return (
    <SectionContainer id="how-it-works" headingId="how-it-works-heading" tone="dark">
      <RevealOnScroll>
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <SectionIcon icon={Route} tone="inverted" />
          <h2 id="how-it-works-heading" className="w-full font-display text-3xl font-semibold text-white sm:text-4xl">
            {howItWorks.heading}
          </h2>
        </div>
      </RevealOnScroll>

      <ol className="relative mx-auto mt-14 flex max-w-6xl flex-col gap-10 sm:flex-row sm:gap-6">
        <div aria-hidden="true" className="absolute left-6 top-6 hidden h-px bg-white/15 sm:block sm:right-6" />
        {howItWorks.steps.map((step, index) => (
          <RevealOnScroll key={step.title} delayMs={index * 80} className="flex-1">
            <li className="flex flex-col items-center text-center sm:items-center">
              <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent font-display text-lg font-semibold text-white ring-8 ring-plum">
                {index + 1}
              </span>
              <h3 className="mt-4 w-full text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-2 w-full max-w-[16rem] text-white/60">{step.description}</p>
            </li>
          </RevealOnScroll>
        ))}
      </ol>
    </SectionContainer>
  );
}
