import { Rocket } from "lucide-react";
import { siteConfig } from "@/content/site-config";
import { Button } from "@/components/ui/Button";
import { SectionIcon } from "@/components/ui/SectionIcon";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { AmbientGlow } from "@/components/ui/AmbientGlow";

export function FinalCTA() {
  const { finalCta } = siteConfig;

  return (
    <section aria-labelledby="final-cta-heading" className="relative overflow-hidden bg-plum">
      <AmbientGlow variant="cool" className="left-1/2 top-0 h-96 w-96 -translate-x-1/2 opacity-20" />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center sm:py-28">
        <RevealOnScroll className="flex flex-col items-center">
          <SectionIcon icon={Rocket} tone="inverted" />
          <h2 id="final-cta-heading" className="font-display text-3xl font-semibold text-white sm:text-4xl">
            {finalCta.headline}
          </h2>
          <p className="mt-4 text-lg text-white/80">{finalCta.body}</p>
          <Button href="#registration" className="mt-8">
            {finalCta.ctaLabel}
          </Button>
        </RevealOnScroll>
      </div>
    </section>
  );
}
