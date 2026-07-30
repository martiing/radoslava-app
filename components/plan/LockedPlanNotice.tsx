import { Card } from "@/components/ui/Card";
import { PLAN_PAGE_COPY } from "@/content/program-content";
import { siteConfig } from "@/content/site-config";

export function LockedPlanNotice() {
  return (
    <Card className="mx-auto max-w-xl text-center">
      <h1 className="font-display text-2xl font-semibold text-foreground">{PLAN_PAGE_COPY.notYet.heading}</h1>
      <p className="mt-4 text-base text-muted">
        {PLAN_PAGE_COPY.notYet.body}{" "}
        <a href={`mailto:${siteConfig.footer.contactEmail}`} className="text-accent hover:text-accent-hover">
          {siteConfig.footer.contactEmail}
        </a>
        .
      </p>
    </Card>
  );
}
