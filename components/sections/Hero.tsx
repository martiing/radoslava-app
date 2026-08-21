import { CalendarDays, CalendarClock, Wallet } from "lucide-react";
import { siteConfig } from "@/content/site-config";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { wideContainer } from "@/lib/utils";

export function Hero() {
  const { hero } = siteConfig;

  const stats = [
    { icon: CalendarDays, label: "Начало", value: hero.startDate },
    { icon: CalendarClock, label: "Записване до", value: hero.registrationDeadline },
    { icon: Wallet, label: "Цена", value: hero.price },
  ];

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className={`${wideContainer} scroll-mt-24 overflow-x-clip px-6 pt-8 pb-10 sm:pt-12 sm:pb-14`}
    >
      <div className="grid items-center gap-8 sm:grid-cols-[1.1fr_1fr] sm:gap-10 lg:gap-14">
        <div>
          <div className="animate-fade-up" style={{ animationDelay: "0ms" }}>
            <Badge>{hero.eyebrow}</Badge>
          </div>
          <h1
            id="hero-heading"
            className="animate-fade-up mt-4 font-display text-[2rem] font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            style={{ animationDelay: "80ms" }}
          >
            {hero.headline}
          </h1>

          <div
            className="animate-fade-up relative mx-auto mt-6 w-full max-w-md sm:hidden"
            style={{ animationDelay: "140ms" }}
          >
            <div
              aria-hidden="true"
              className="animate-blob-drift absolute -inset-4 -z-10 rounded-full bg-gradient-to-br from-accent-bright via-accent to-lime opacity-30 blur-2xl"
            />
            <PlaceholderImage
              src={hero.photoSrc}
              alt="Радослава"
              label="Снимка на Радослава — предстои"
              aspectRatio="5/4"
              sizes="calc(100vw - 3rem)"
              priority
              rounded="rounded-[1.75rem]"
              className="shadow-xl shadow-accent/10"
            />
          </div>

          <p
            className="animate-fade-up mt-4 max-w-md text-base leading-relaxed text-muted sm:text-lg"
            style={{ animationDelay: "180ms" }}
          >
            {hero.subheadline}
          </p>

          <div className="animate-fade-up mt-6 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "280ms" }}>
            <Button href="#registration" variant="primary">
              {hero.ctaPrimaryLabel}
            </Button>
            <Button href="#offer" variant="secondary">
              <span className="sm:hidden">Виж как работи</span>
              <span className="hidden sm:inline">{hero.ctaSecondaryLabel}</span>
            </Button>
          </div>

          <dl className="animate-fade-up mt-7 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3" style={{ animationDelay: "380ms" }}>
            {stats.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex min-w-0 flex-col items-center gap-1.5 rounded-2xl border border-white/60 bg-surface/60 px-2 py-3 text-center backdrop-blur-sm sm:flex-row sm:gap-2.5 sm:px-4 sm:py-2.5 sm:text-left"
              >
                <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-accent sm:h-5 sm:w-5" strokeWidth={1.75} />
                <div className="leading-tight">
                  <dt className="text-[9px] uppercase tracking-wide text-muted sm:text-[11px]">{label}</dt>
                  <dd className="mt-1 text-xs font-semibold text-foreground sm:mt-0 sm:text-sm">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        <div
          className="animate-fade-up relative mx-auto hidden w-full max-w-[17rem] sm:block sm:max-w-[21rem] lg:max-w-[24rem]"
          style={{ animationDelay: "150ms" }}
        >
          <div
            aria-hidden="true"
            className="animate-blob-drift absolute -inset-4 -z-10 rounded-full bg-gradient-to-br from-accent-bright via-accent to-lime opacity-30 blur-2xl sm:-inset-6"
          />
          <PlaceholderImage
            src={hero.photoSrc}
            alt="Радослава"
            label="Снимка на Радослава — предстои"
            aspectRatio="1320/1994"
            sizes="(min-width: 1024px) 24rem, (min-width: 640px) 21rem, 17rem"
            priority
            rounded="rounded-[2rem]"
            className="shadow-xl shadow-accent/10"
          />
        </div>
      </div>
    </section>
  );
}
