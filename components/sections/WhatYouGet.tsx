import { Gift, MessageCircleQuestion, Salad, TrendingUp, Users, Video, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { siteConfig } from "@/content/site-config";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SectionIcon } from "@/components/ui/SectionIcon";
import { Badge } from "@/components/ui/Badge";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

const BENEFIT_ICONS: LucideIcon[] = [Salad, Zap, TrendingUp, Video, MessageCircleQuestion, Users];

export function WhatYouGet() {
  const { whatYouGet } = siteConfig;

  return (
    <SectionContainer id="what-you-get" headingId="what-you-get-heading" tone="tint">
      <RevealOnScroll>
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <SectionIcon icon={Gift} />
          <h2
            id="what-you-get-heading"
            className="font-display text-3xl font-semibold text-foreground sm:text-4xl"
          >
            {whatYouGet.heading}
          </h2>
        </div>
      </RevealOnScroll>

      <ul className="mx-auto mt-10 grid max-w-4xl gap-x-10 gap-y-6 sm:grid-cols-2">
        {whatYouGet.benefits.map((benefit, index) => {
          const Icon = BENEFIT_ICONS[index % BENEFIT_ICONS.length];
          return (
            <RevealOnScroll key={benefit.title} delayMs={index * 60}>
              <li className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface/80 text-accent-hover">
                  <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                  <p className="mt-1 text-muted">{benefit.description}</p>
                </div>
              </li>
            </RevealOnScroll>
          );
        })}
      </ul>

      <RevealOnScroll delayMs={whatYouGet.benefits.length * 60}>
        <div className="mx-auto mt-10 flex max-w-4xl flex-wrap items-center justify-center gap-3">
          <Badge>Бонус</Badge>
          <p className="text-foreground">{whatYouGet.bonus}</p>
        </div>
      </RevealOnScroll>
    </SectionContainer>
  );
}
