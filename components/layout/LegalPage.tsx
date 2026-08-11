import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { wideContainer } from "@/lib/utils";

/**
 * Marks a value that a human still has to fill in. Rendered loudly on purpose:
 * a legal page that silently ships with invented details is worse than one that
 * visibly says it is unfinished.
 */
export function TODO({ children }: { children: React.ReactNode }) {
  return (
    <mark className="rounded bg-amber-200 px-1.5 py-0.5 font-semibold text-plum">
      [ЗА ПОПЪЛВАНЕ: {children}]
    </mark>
  );
}

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  return (
    <>
      <Header />
      <main className={`${wideContainer} py-16 sm:py-24`}>
        <article className="mx-auto max-w-3xl">
          <h1 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-muted">Последна актуализация: {lastUpdated}</p>

          <div
            role="note"
            className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm leading-relaxed text-plum"
          >
            <strong className="font-semibold">Чернова.</strong> Този документ е работен вариант и{" "}
            <strong>не е правно одобрен</strong>. Всички маркирани полета трябва да бъдат попълнени, а
            текстът — прегледан от юрист, преди сайтът да приема реални заявки.
          </div>

          <div className="mt-10 flex flex-col gap-8 leading-relaxed text-muted [&_a]:text-accent [&_a]:underline [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2">
            {children}
          </div>

          <p className="mt-12 border-t border-border pt-6 text-sm">
            <Link href="/" className="text-accent underline">
              ← Обратно към началната страница
            </Link>
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
