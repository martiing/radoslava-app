import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PLAN_PAGE_COPY, type PlanLink } from "@/content/program-content";

interface PlanResourceCardProps {
  heading: string;
  title: string;
  summary: string;
  link: PlanLink;
}

export function PlanResourceCard({ heading, title, summary, link }: PlanResourceCardProps) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-wider text-accent-hover">{heading}</p>
      <h3 className="mt-2 font-display text-xl font-semibold text-foreground">{title}</h3>
      <p className="mt-3 text-base text-muted">{summary}</p>
      <div className="mt-6">
        {link.href ? (
          <Button href={link.href} target="_blank" rel="noopener noreferrer">
            {link.label}
          </Button>
        ) : (
          <p className="text-sm italic text-muted">{PLAN_PAGE_COPY.linkPendingLabel}</p>
        )}
      </div>
    </Card>
  );
}
