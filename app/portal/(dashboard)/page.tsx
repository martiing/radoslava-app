import { ArrowRight, BadgeCheck, CreditCard, Dumbbell } from "lucide-react";
import { connection } from "next/server";
import { portalContent } from "@/content/portal-content";
import { getAuthenticatedParticipant } from "@/lib/client/auth";

export default async function PortalHomePage() {
  // Auth cookies and the per-request CSP nonce both require dynamic rendering.
  await connection();
  const participant = await getAuthenticatedParticipant();

  return (
    <div className="grid gap-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-plum px-6 py-9 text-white sm:px-10 sm:py-12">
        <div aria-hidden="true" className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative max-w-2xl">
          <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-accent-bright">
            Клиентски портал
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            {participant ? `Здравей, ${participant.name.split(" ")[0]}!` : portalContent.dashboard.title}
          </h1>
          <p className="mt-4 max-w-xl leading-7 text-white/70">{portalContent.dashboard.description}</p>
        </div>
      </section>

      <section aria-labelledby="next-steps-heading">
        <h2 id="next-steps-heading" className="text-xl font-semibold">
          Следващи стъпки
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: BadgeCheck,
              title: "Сигурен профил",
              text: "Supabase Auth защитава входа и сесията ти.",
              ready: true,
            },
            {
              icon: CreditCard,
              title: "Избор на абонамент",
              text: "Ще бъде добавен след потвърждение на трите пакета.",
              ready: false,
            },
            {
              icon: Dumbbell,
              title: "Личен план",
              text: "Ще се отключва автоматично при активен абонамент.",
              ready: false,
            },
          ].map((step) => (
            <article key={step.title} className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                  <step.icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <span className={step.ready ? "text-xs font-bold text-accent" : "text-xs font-semibold text-muted"}>
                  {step.ready ? "Готово" : "Предстои"}
                </span>
              </div>
              <h3 className="mt-5 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{step.text}</p>
              {!step.ready && <ArrowRight aria-hidden="true" className="mt-5 h-4 w-4 text-muted/60" />}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
