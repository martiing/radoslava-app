import { Dumbbell } from "lucide-react";
import { siteConfig } from "@/content/site-config";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SectionIcon } from "@/components/ui/SectionIcon";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export function WhyRadoslava() {
  const { aboutRadoslava } = siteConfig;

  return (
    <SectionContainer id="why-radoslava" headingId="why-radoslava-heading">
      <div className="mx-auto grid max-w-5xl items-start gap-10 sm:grid-cols-2 sm:gap-14">
        <RevealOnScroll>
          <PlaceholderImage
            src={aboutRadoslava.photoSrc}
            alt="Радослава"
            label="Снимка на Радослава — предстои"
            aspectRatio="1/1"
          />
        </RevealOnScroll>

        <RevealOnScroll delayMs={80}>
          <SectionIcon icon={Dumbbell} />
          <h2
            id="why-radoslava-heading"
            className="font-display text-3xl font-semibold text-foreground sm:text-4xl"
          >
            {aboutRadoslava.heading}
          </h2>

          <div className="mt-5 space-y-4 text-lg leading-relaxed text-muted">
            {aboutRadoslava.story.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <dl className="mt-8 grid grid-cols-1 gap-4 border-t border-border pt-6 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-muted">Квалификации</dt>
              <dd className="mt-1 font-medium text-foreground">{aboutRadoslava.qualifications}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Опит</dt>
              <dd className="mt-1 font-medium text-foreground">{aboutRadoslava.experience}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Подпомогнати клиенти</dt>
              <dd className="mt-1 font-medium text-foreground">{aboutRadoslava.clientCount}</dd>
            </div>
          </dl>
        </RevealOnScroll>
      </div>
    </SectionContainer>
  );
}
