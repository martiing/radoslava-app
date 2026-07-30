import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { PLAN_PAGE_COPY } from "@/content/program-content";

export default function PlanNotFound() {
  return (
    <>
      <Header />
      <main>
        <SectionContainer id="plan-not-found" headingId="plan-not-found-heading">
          <Card className="mx-auto max-w-xl text-center">
            <h1 id="plan-not-found-heading" className="font-display text-2xl font-semibold text-foreground">
              {PLAN_PAGE_COPY.notFound.heading}
            </h1>
            <p className="mt-4 text-base text-muted">{PLAN_PAGE_COPY.notFound.body}</p>
          </Card>
        </SectionContainer>
      </main>
      <Footer />
    </>
  );
}
