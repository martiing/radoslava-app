import { Frown } from "lucide-react";
import { siteConfig } from "@/content/site-config";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SectionIcon } from "@/components/ui/SectionIcon";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export function PainPoints() {
  const { painPoints } = siteConfig;

  return (
    <SectionContainer id="pain-points" headingId="pain-points-heading">
      <RevealOnScroll>
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <SectionIcon icon={Frown} />
          <h2
            id="pain-points-heading"
            className="w-full font-display text-3xl font-semibold text-foreground sm:text-4xl"
          >
            {painPoints.heading}
          </h2>
          <p className="mt-4 w-full text-lg text-muted">{painPoints.intro}</p>
        </div>
      </RevealOnScroll>

      <ul className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
        {painPoints.items.map((item, index) => (
          <RevealOnScroll key={item.text} delayMs={index * 60}>
            <li className="flex items-start gap-3 rounded-2xl border border-white/60 bg-surface/60 px-5 py-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:bg-surface/80 hover:shadow-lg hover:shadow-accent/10">
              <span
                aria-hidden="true"
                className={`mt-1 h-2 w-2 shrink-0 rounded-full ${index % 2 === 0 ? "bg-accent" : "bg-lime"}`}
              />
              <span className="text-foreground">{item.text}</span>
            </li>
          </RevealOnScroll>
        ))}
      </ul>
    </SectionContainer>
  );
}
