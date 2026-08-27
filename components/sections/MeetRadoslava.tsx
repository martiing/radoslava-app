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
    <SectionContainer id="meet-radoslava" headingId="meet-radoslava-heading" tone="dark" className="px-4 sm:px-14 lg:px-20">
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

      <div className="mx-auto mt-8 grid min-w-0 max-w-5xl items-start gap-8 sm:mt-12 sm:grid-cols-2 sm:gap-14">
        <RevealOnScroll delayMs={80} className="min-w-0">
          <PlaceholderImage
            src={meetRadoslava.photoSrc}
            alt="Радослава"
            label="Снимка на Радослава — предстои"
            aspectRatio="1/1"
          />

          <details className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70 sm:hidden">
            <summary className="cursor-pointer font-semibold text-white">Историята на Радослава</summary>
            <p className="mt-3 text-sm leading-relaxed">{meetRadoslava.bio}</p>
          </details>
          <p className="mt-6 hidden text-base leading-relaxed text-white/70 sm:block">{meetRadoslava.bio}</p>

          <div className="mt-5 border-t border-white/10 pt-5 sm:mt-6 sm:pt-6">
            <span className="flex w-full max-w-full items-start gap-2 rounded-2xl bg-accent px-4 py-2 text-left text-sm font-semibold leading-snug text-white sm:inline-flex sm:w-auto sm:items-center sm:rounded-full sm:py-1.5">
              <Award aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 sm:mt-0" strokeWidth={2} />
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

        <RevealOnScroll delayMs={140} className="min-w-0">
          <ResultsSlider clients={meetRadoslava.results.clients} disclaimer={meetRadoslava.results.disclaimer} />
        </RevealOnScroll>
      </div>
    </SectionContainer>
  );
}
