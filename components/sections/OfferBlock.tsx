import { MessageCircleQuestion, Repeat, Salad, ShieldCheck, SlidersHorizontal, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { siteConfig } from "@/content/site-config";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { DayPreviewToggle } from "@/components/offer/DayPreviewToggle";

const VALUE_ICONS: LucideIcon[] = [Salad, SlidersHorizontal, TrendingUp, MessageCircleQuestion, Repeat];

export function OfferBlock() {
  const { offerBlock } = siteConfig;

  return (
    <SectionContainer id="offer" headingId="offer-heading" tone="tint">
      <RevealOnScroll>
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <Badge>{offerBlock.eyebrow}</Badge>
          <h2
            id="offer-heading"
            className="mt-4 w-full font-display text-3xl font-semibold text-foreground sm:text-4xl"
          >
            {offerBlock.heading}
          </h2>
          <p className="mt-4 w-full text-lg text-muted">{offerBlock.subhead}</p>
        </div>
      </RevealOnScroll>

      <RevealOnScroll delayMs={80}>
        <p className="mx-auto mt-10 max-w-4xl text-center text-sm font-semibold uppercase tracking-wide text-accent-hover">
          {offerBlock.valuesLabel}
        </p>
      </RevealOnScroll>

      <ul className="mx-auto mt-5 grid max-w-4xl gap-x-10 gap-y-5 sm:grid-cols-2">
        {offerBlock.values.map((value, index) => {
          const Icon = VALUE_ICONS[index % VALUE_ICONS.length];
          return (
            <RevealOnScroll key={value.text} delayMs={140 + index * 60}>
              <li className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface/80 text-accent-hover">
                  <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <p className="text-foreground">{value.text}</p>
              </li>
            </RevealOnScroll>
          );
        })}
      </ul>

      <RevealOnScroll delayMs={140 + offerBlock.values.length * 60}>
        <div className="mx-auto mt-12 max-w-2xl">
          <DayPreviewToggle copy={offerBlock.dayPreview} />
        </div>
      </RevealOnScroll>

      <RevealOnScroll delayMs={200 + offerBlock.values.length * 60}>
        <div className="mx-auto mt-12 flex max-w-2xl flex-col items-center gap-6 rounded-[1.75rem] border border-white/70 bg-surface/80 p-8 text-center shadow-xl shadow-accent/5 backdrop-blur-xl sm:p-10">
          <div>
            <div className="flex items-baseline justify-center gap-2">
              <span className="font-display text-5xl font-bold text-foreground">{offerBlock.price.amount}</span>
              <span className="text-base font-medium text-muted">{offerBlock.price.period}</span>
            </div>
            <p className="mt-2 text-sm text-muted">{offerBlock.price.note}</p>
          </div>

          <Button href="#registration" className="w-full sm:w-auto">
            {offerBlock.ctaLabel}
          </Button>

          <div className="flex items-center gap-2.5 text-sm text-muted">
            <ShieldCheck aria-hidden="true" className="h-5 w-5 shrink-0 text-accent-hover" strokeWidth={1.75} />
            <span>{offerBlock.guarantee}</span>
          </div>
        </div>
      </RevealOnScroll>
    </SectionContainer>
  );
}
