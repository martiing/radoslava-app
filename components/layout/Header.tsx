import Link from "next/link";
import { siteConfig } from "@/content/site-config";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { wideContainer } from "@/lib/utils";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className={`${wideContainer} flex items-center justify-between py-4`}>
        <Link
          href="/#hero"
          className="inline-flex min-h-11 items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <Logo
            shortName={siteConfig.header.brandShort}
            fullName={siteConfig.header.brandFull}
            mobileName={siteConfig.header.brandMobile}
          />
        </Link>
        <Button href="/#registration" className="!px-4 text-xs sm:!px-7 sm:text-sm">
          {siteConfig.header.ctaLabel}
        </Button>
      </div>
    </header>
  );
}
