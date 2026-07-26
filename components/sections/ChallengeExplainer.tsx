import { CalendarDays } from "lucide-react";
import { siteConfig } from "@/content/site-config";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SectionIcon } from "@/components/ui/SectionIcon";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export function ChallengeExplainer() {
  const { challenge } = siteConfig;

  return (
    <SectionContainer id="challenge" headingId="challenge-heading" tone="dark">
      <RevealOnScroll>
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <SectionIcon icon={CalendarDays} tone="inverted" />
          <h2 id="challenge-heading" className="font-display text-3xl font-semibold text-white sm:text-4xl">
            {challenge.heading}
          </h2>
          <p className="mt-4 text-lg text-white/70">{challenge.intro}</p>
        </div>
      </RevealOnScroll>

      <ul className="mx-auto mt-10 grid max-w-6xl gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {challenge.features.map((feature, index) => (
          <RevealOnScroll key={feature.title} delayMs={index * 60}>
            <li className="h-full">
              <div className="h-full rounded-[1.75rem] border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent-bright/30 hover:bg-white/10 sm:p-9">
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-white/60">{feature.description}</p>
              </div>
            </li>
          </RevealOnScroll>
        ))}
      </ul>

      <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-white/50">{challenge.disclaimer}</p>
    </SectionContainer>
  );
}
