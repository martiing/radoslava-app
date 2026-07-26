import { siteConfig } from "@/content/site-config";
import { LogoStacked } from "@/components/ui/Logo";
import { wideContainer } from "@/lib/utils";

export function Footer() {
  const { footer, header } = siteConfig;

  return (
    <footer className="bg-plum">
      <div className={`${wideContainer} py-12 text-sm text-white/60`}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <LogoStacked shortName={header.brandShort} fullName={header.brandFull} tone="inverted" />
            <p className="mt-4 text-white/80">{footer.projectName}</p>
            <p className="mt-2">
              <a href={`mailto:${footer.contactEmail}`} className="transition-colors hover:text-accent-bright">
                {footer.contactEmail}
              </a>
            </p>
            <p className="mt-1">
              <a
                href={footer.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-accent-bright"
              >
                Instagram
              </a>
            </p>
          </div>
          <nav aria-label="Правна информация" className="flex flex-col gap-2 sm:items-end">
            <a href={footer.privacyPolicyHref} className="transition-colors hover:text-accent-bright">
              Политика за поверителност
            </a>
            <a href={footer.termsHref} className="transition-colors hover:text-accent-bright">
              Общи условия
            </a>
          </nav>
        </div>
        <p className="mt-8 max-w-2xl border-t border-white/10 pt-6 leading-relaxed">
          {footer.medicalDisclaimer}
        </p>
      </div>
    </footer>
  );
}
