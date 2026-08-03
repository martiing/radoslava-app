import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { siteConfig } from "@/content/site-config";
import { portalContent } from "@/content/portal-content";
import { Logo } from "@/components/ui/Logo";

interface PortalAuthShellProps {
  title: string;
  description: string;
  alternateText: string;
  alternateHref: string;
  alternateLabel: string;
  children: React.ReactNode;
}

export function PortalAuthShell({
  title,
  description,
  alternateText,
  alternateHref,
  alternateLabel,
  children,
}: PortalAuthShellProps) {
  return (
    <main className="min-h-screen bg-background lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(34rem,1.1fr)]">
      <section className="relative hidden overflow-hidden bg-plum px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-20 h-80 w-80 rounded-full bg-accent/25 blur-3xl"
        />
        <Link href="/" className="relative w-fit rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bright">
          <Logo
            shortName={siteConfig.header.brandShort}
            fullName={siteConfig.header.brandFull}
            tone="inverted"
          />
        </Link>

        <div className="relative max-w-xl py-16">
          <p className="font-display text-xs font-bold uppercase tracking-[0.24em] text-accent-bright">
            {portalContent.auth.eyebrow}
          </p>
          <h1 className="mt-5 font-display text-4xl font-bold leading-tight xl:text-5xl">
            {portalContent.auth.heading}
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-white/70">
            {portalContent.auth.description}
          </p>
          <ul className="mt-8 grid gap-3 text-sm text-white/85">
            {portalContent.auth.benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3">
                <CheckCircle2 aria-hidden="true" className="h-5 w-5 text-lime" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/45">© 2026 {siteConfig.header.brandFull}</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-lg">
          <Link
            href="/"
            className="mb-10 inline-flex rounded-md lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Logo
              shortName={siteConfig.header.brandShort}
              fullName={siteConfig.header.brandFull}
            />
          </Link>

          <div className="rounded-[2rem] border border-border bg-surface p-6 shadow-[0_24px_70px_rgba(27,22,38,0.09)] sm:p-9">
            <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-accent">
              {portalContent.auth.eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{title}</h2>
            <p className="mt-3 leading-6 text-muted">{description}</p>

            <div className="mt-8">{children}</div>

            <p className="mt-7 border-t border-border pt-6 text-center text-sm text-muted">
              {alternateText}{" "}
              <Link
                href={alternateHref}
                className="font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {alternateLabel}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
