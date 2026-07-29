import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { STAGE_LABELS, GOAL_REALISM_LABELS, MANUAL_STAGE_TRANSITIONS } from "@/lib/admin/stages";
import {
  updateParticipantStage,
  addParticipantNote,
  overrideGoalRealism,
  resendPersonalizedEmail,
} from "@/app/actions/admin/participants";
import type { QuizAnswers } from "@/types/quiz";

export const dynamic = "force-dynamic";

const QUIZ_ANSWER_LABELS: Record<keyof QuizAnswers, string> = {
  goal: "Основна цел",
  currentWeightKg: "Текущо тегло (кг)",
  targetWeightKg: "Целево тегло (кг)",
  activityLevel: "Ниво на активност (1-5)",
  weeklyCommitment: "Реалистичен ангажимент (1-5)",
  primaryFocus: "Най-голяма нужда от помощ",
  hasLimitations: "Здравословни ограничения",
  limitationsNote: "Бележка за ограничения",
  expectations: "Очаквания",
  extraNotes: "Допълнителни бележки",
};

export default async function AdminParticipantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseServerClient();

  const [{ data: participant, error }, { data: events }] = await Promise.all([
    supabase.from("participants").select("*").eq("id", id).single(),
    supabase
      .from("participant_events")
      .select("id, created_at, kind, message")
      .eq("participant_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (error || !participant) {
    notFound();
  }

  const quizAnswers = participant.quiz_answers as QuizAnswers | null;
  const currentRealism = participant.goal_realism_override ?? participant.goal_realism;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/admin" className="text-sm text-neutral-500 hover:underline">
          ← Всички участнички
        </Link>
        <h1 className="mt-2 text-xl font-semibold">{participant.name}</h1>
        <p className="text-sm text-neutral-500">
          {participant.email} · {participant.phone}
        </p>
        <span className="mt-2 inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium">
          {STAGE_LABELS[participant.stage as keyof typeof STAGE_LABELS] ?? participant.stage}
        </span>
      </div>

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-neutral-700">Смяна на статус</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {MANUAL_STAGE_TRANSITIONS.map(({ stage, label }) => (
            <form key={stage} action={updateParticipantStage.bind(null, participant.id, stage)}>
              <button
                type="submit"
                className="rounded-full border border-neutral-300 px-4 py-2 text-sm hover:border-neutral-900"
              >
                {label}
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-neutral-700">Въпросник</h2>
        {quizAnswers ? (
          <>
            <div className="mt-3 flex items-center gap-3 text-sm">
              <span>
                Оценка на целта:{" "}
                <strong>{currentRealism ? (GOAL_REALISM_LABELS[currentRealism] ?? currentRealism) : "—"}</strong>
                {participant.goal_realism_score !== null && (
                  <span className="text-neutral-400"> (score: {participant.goal_realism_score})</span>
                )}
              </span>
              <form action={overrideGoalRealism} className="flex items-center gap-2">
                <input type="hidden" name="participantId" value={participant.id} />
                <select
                  name="goalRealismOverride"
                  defaultValue={participant.goal_realism_override ?? ""}
                  className="rounded-lg border border-neutral-300 px-2 py-1 text-sm"
                >
                  <option value="">Без корекция</option>
                  <option value="realistic">Реалистична</option>
                  <option value="ambitious">Амбициозна</option>
                  <option value="unrealistic">Нереалистична</option>
                </select>
                <button type="submit" className="rounded-lg border border-neutral-300 px-3 py-1 text-sm">
                  Запази
                </button>
              </form>
            </div>
            <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              {(Object.keys(QUIZ_ANSWER_LABELS) as (keyof QuizAnswers)[]).map((key) => {
                const value = quizAnswers[key];
                if (value === undefined || value === "" || value === null) return null;
                return (
                  <div key={key}>
                    <dt className="text-neutral-500">{QUIZ_ANSWER_LABELS[key]}</dt>
                    <dd className="font-medium">{String(value)}</dd>
                  </div>
                );
              })}
            </dl>
            <form action={resendPersonalizedEmail.bind(null, participant.id)} className="mt-4">
              <button type="submit" className="rounded-lg border border-neutral-300 px-4 py-2 text-sm">
                Изпрати персонализирания имейл отново
              </button>
            </form>
          </>
        ) : (
          <p className="mt-2 text-sm text-neutral-400">Все още не е попълнен.</p>
        )}
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-neutral-700">Бележка</h2>
        <form action={addParticipantNote} className="mt-3 flex flex-col gap-2">
          <input type="hidden" name="participantId" value={participant.id} />
          <textarea
            name="message"
            rows={2}
            required
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            placeholder="Добави бележка за тази участничка..."
          />
          <button type="submit" className="self-start rounded-lg border border-neutral-300 px-4 py-2 text-sm">
            Добави
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-neutral-700">История</h2>
        <ul className="mt-3 flex flex-col gap-3 text-sm">
          {(events ?? []).map((event) => (
            <li key={event.id} className="flex justify-between gap-4 border-b border-neutral-100 pb-2">
              <span>{event.message}</span>
              <span className="shrink-0 text-neutral-400">{new Date(event.created_at).toLocaleString("bg-BG")}</span>
            </li>
          ))}
          {(!events || events.length === 0) && <li className="text-neutral-400">Няма записи все още.</li>}
        </ul>
      </section>
    </div>
  );
}
