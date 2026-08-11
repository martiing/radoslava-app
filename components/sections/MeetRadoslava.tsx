import { Award, Dumbbell } from "lucide-react";
import { siteConfig } from "@/content/site-config";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SectionIcon } from "@/components/ui/SectionIcon";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { ResultsSlider } from "@/components/meet-radoslava/ResultsSlider";

export function MeetRadoslava() {
  const { meetRadoslava } = siteConfig;

  return (
    <SectionContainer id="meet-radoslava" headingId="meet-radoslava-heading" tone="dark">
      <RevealOnScroll>
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <SectionIcon icon={Dumbbell} tone="inverted" />
          <h2
            id="meet-radoslava-heading"
            className="w-full font-display text-3xl font-semibold text-white sm:text-4xl"
          >
            {meetRadoslava.heading}
          </h2>
          <p className="mt-4 w-full text-lg text-white/70">{meetRadoslava.subhead}</p>
        </div>
      </RevealOnScroll>

      <div className="mx-auto mt-12 grid max-w-5xl items-start gap-10 sm:grid-cols-2 sm:gap-14">
        <RevealOnScroll delayMs={80}>
          <PlaceholderImage
            src={meetRadoslava.photoSrc}
            alt="Радослава"
            label="Снимка на Радослава — предстои"
            aspectRatio="1/1"
          />

          <p className="mt-6 text-base leading-relaxed text-white/70">{meetRadoslava.bio}</p>

          <div className="mt-6 border-t border-white/10 pt-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-white">
              <Award aria-hidden="true" className="h-4 w-4 shrink-0" strokeWidth={2} />
              {meetRadoslava.credentialBadge}
            </span>

            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
              {meetRadoslava.credentials.map((credential) => (
                <li key={credential} className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
                  {credential}
                </li>
              ))}
            </ul>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delayMs={140}>
          <ResultsSlider clients={meetRadoslava.results.clients} disclaimer={meetRadoslava.results.disclaimer} />
        </RevealOnScroll>
      </div>
    </SectionContainer>
  );
}
