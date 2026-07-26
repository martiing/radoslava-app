import { siteConfig } from "@/content/site-config";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { wideContainer } from "@/lib/utils";

export function Hero() {
  const { hero } = siteConfig;

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className={`${wideContainer} scroll-mt-24 overflow-x-clip px-6 pt-12 pb-16 sm:pt-20 sm:pb-24`}
    >
      <div className="grid items-center gap-10 sm:grid-cols-2 sm:gap-14 lg:gap-20">
        <div>
          <div className="animate-fade-up" style={{ animationDelay: "0ms" }}>
            <Badge>{hero.eyebrow}</Badge>
          </div>
          <h1
            id="hero-heading"
            className="animate-fade-up mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl"
            style={{ animationDelay: "80ms" }}
          >
            {hero.headline}
          </h1>
          <p
            className="animate-fade-up mt-5 max-w-md text-lg leading-relaxed text-muted"
            style={{ animationDelay: "180ms" }}
          >
            {hero.subheadline}
          </p>

          <div className="animate-fade-up mt-8 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "280ms" }}>
            <Button href="#registration" variant="primary">
              {hero.ctaPrimaryLabel}
            </Button>
            <Button href="#challenge" variant="secondary">
              {hero.ctaSecondaryLabel}
            </Button>
          </div>

          <dl
            className="animate-fade-up mt-8 grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-muted sm:max-w-sm"
            style={{ animationDelay: "380ms" }}
          >
            <div className="col-span-2 min-w-0">
              <dt className="sr-only">Ограничен брой места</dt>
              <dd className="break-words font-medium text-foreground">
                Ограничен брой места: {hero.capacity}
              </dd>
            </div>
            <div className="min-w-0">
              <dt>Начало</dt>
              <dd className="break-words font-medium text-foreground">{hero.startDate}</dd>
            </div>
            <div className="min-w-0">
              <dt>Записване до</dt>
              <dd className="break-words font-medium text-foreground">{hero.registrationDeadline}</dd>
            </div>
            <div className="min-w-0">
              <dt>Цена</dt>
              <dd className="break-words font-medium text-foreground">{hero.price}</dd>
            </div>
          </dl>
        </div>

        <div className="animate-fade-up relative" style={{ animationDelay: "150ms" }}>
          <div
            aria-hidden="true"
            className="animate-blob-drift absolute -inset-4 -z-10 rounded-full bg-gradient-to-br from-accent-bright via-accent to-lime opacity-30 blur-3xl sm:-inset-8"
          />
          <PlaceholderImage
            src={hero.photoSrc}
            alt="Радослава"
            label="Снимка на Радослава — предстои"
            aspectRatio="4/5"
            sizes="(min-width: 640px) 45vw, 100vw"
            priority
          />
        </div>
      </div>
    </section>
  );
}
