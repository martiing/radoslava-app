import { SectionContainer } from "@/components/ui/SectionContainer";
import type { LegalPageContent } from "@/content/legal-content";

export function LegalPageBody({ content }: { content: LegalPageContent }) {
  return (
    <SectionContainer id="legal-content" headingId="legal-heading">
      <div className="mx-auto max-w-2xl">
        <h1 id="legal-heading" className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
          {content.heading}
        </h1>
        <p className="mt-2 text-sm text-muted">{content.updatedAt}</p>
        <p className="mt-6 text-lg text-muted">{content.intro}</p>

        <div className="mt-10 flex flex-col gap-8">
          {content.sections.map((section) => (
            <div key={section.title}>
              <h2 className="font-display text-xl font-semibold text-foreground">{section.title}</h2>
              <div className="mt-3 flex flex-col gap-3 text-base leading-relaxed text-muted">
                {section.body.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
