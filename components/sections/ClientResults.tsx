import { Star, Trophy } from "lucide-react";
import { siteConfig } from "@/content/site-config";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SectionIcon } from "@/components/ui/SectionIcon";
import { Card } from "@/components/ui/Card";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export function ClientResults() {
  const { clientResults } = siteConfig;

  return (
    <SectionContainer id="client-results" headingId="client-results-heading">
      <RevealOnScroll>
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <SectionIcon icon={Trophy} />
          <h2
            id="client-results-heading"
            className="w-full font-display text-3xl font-semibold text-foreground sm:text-4xl"
          >
            {clientResults.heading}
          </h2>
          <p className="mt-4 w-full text-lg text-muted">{clientResults.intro}</p>
        </div>
      </RevealOnScroll>

      <ul className="mx-auto mt-10 flex max-w-6xl flex-col gap-6 sm:grid sm:grid-cols-3 sm:items-start">
        {clientResults.testimonials.map((testimonial, index) => {
          const isFeatured = index === 1;
          return (
            <RevealOnScroll key={testimonial.id} delayMs={index * 80}>
              <li className={isFeatured ? "h-full sm:-translate-y-4" : "h-full"}>
                <Card
                  className={
                    isFeatured
                      ? "flex h-full flex-col gap-4 border-accent/30 shadow-lg shadow-accent/15"
                      : "flex h-full flex-col gap-4"
                  }
                >
                  {isFeatured && (
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
                      <Star aria-hidden="true" className="h-3.5 w-3.5" fill="currentColor" strokeWidth={0} />
                      Топ резултат
                    </span>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <PlaceholderImage
                      src={testimonial.beforeSrc}
                      alt={`${testimonial.name} — преди`}
                      label="Преди"
                      aspectRatio="3/4"
                    />
                    <PlaceholderImage
                      src={testimonial.afterSrc}
                      alt={`${testimonial.name} — след`}
                      label="След"
                      aspectRatio="3/4"
                    />
                  </div>
                  <p className="text-foreground">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="mt-auto text-sm text-muted">
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p>{testimonial.timeframe}</p>
                  </div>
                </Card>
              </li>
            </RevealOnScroll>
          );
        })}
      </ul>

      <p className="mx-auto mt-8 text-center text-sm text-muted">{clientResults.disclaimer}</p>
    </SectionContainer>
  );
}
