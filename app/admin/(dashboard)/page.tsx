import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { STAGE_LABELS, STAGE_ORDER, type ParticipantStage } from "@/lib/admin/stages";

export const dynamic = "force-dynamic";

interface DashboardParticipant {
  id: string;
  name: string;
  stage: ParticipantStage;
  goal_realism: string | null;
  goal_realism_override: string | null;
  has_limitations: boolean;
}

export default async function AdminDashboardPage() {
  const supabase = getSupabaseServerClient();
  const { data: participants, error } = await supabase
    .from("participants")
    .select("id, name, stage, goal_realism, goal_realism_override, has_limitations");

  if (error) {
    return <p className="text-red-600">Грешка при зареждане: {error.message}</p>;
  }

  const rows = (participants ?? []) as DashboardParticipant[];
  const total = rows.length;

  const counts: Record<ParticipantStage, number> = {
    registered: 0,
    quiz_completed: 0,
    emailed: 0,
    messaged_viber: 0,
    paid: 0,
    added_to_group: 0,
    completed: 0,
    cancelled: 0,
  };
  for (const row of rows) counts[row.stage] += 1;

  // Funnel counts are cumulative: everyone at a later stage also passed
  // through every earlier one, so "paid" should include "added_to_group" etc.
  const cumulativeCounts: Record<ParticipantStage, number> = { ...counts };
  for (let i = STAGE_ORDER.length - 2; i >= 0; i -= 1) {
    cumulativeCounts[STAGE_ORDER[i]] += cumulativeCounts[STAGE_ORDER[i + 1]];
  }

  const needsAttention = rows.filter((row) => {
    const realism = row.goal_realism_override ?? row.goal_realism;
    return realism === "unrealistic" || row.has_limitations;
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">Табло</h1>
        <p className="text-sm text-neutral-500">{total} участнички общо · {counts.cancelled} отказали се</p>
      </div>

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-neutral-700">Фуния на регистрациите</h2>
        <div className="mt-4 flex flex-col gap-3">
          {STAGE_ORDER.map((stage) => {
            const count = cumulativeCounts[stage];
            const percent = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <Link
                key={stage}
                href={`/admin/participants?stage=${stage}`}
                className="flex items-center gap-4 text-sm hover:opacity-80"
              >
                <span className="w-40 shrink-0 text-neutral-600">{STAGE_LABELS[stage]}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                  <span className="block h-full rounded-full bg-accent" style={{ width: `${percent}%` }} />
                </span>
                <span className="w-16 shrink-0 text-right font-medium">
                  {count} <span className="text-neutral-400">({percent}%)</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-neutral-700">Изисква внимание ({needsAttention.length})</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Нереалистична цел или здравословни ограничения — препоръчително е личен последващ контакт.
        </p>
        <ul className="mt-4 flex flex-col divide-y divide-neutral-100">
          {needsAttention.map((row) => (
            <li key={row.id} className="flex items-center justify-between py-2 text-sm">
              <Link href={`/admin/participants/${row.id}`} className="font-medium hover:underline">
                {row.name}
              </Link>
              <span className="flex gap-2 text-xs text-neutral-500">
                {(row.goal_realism_override ?? row.goal_realism) === "unrealistic" && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-700">Нереалистична цел</span>
                )}
                {row.has_limitations && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">Ограничения</span>
                )}
              </span>
            </li>
          ))}
          {needsAttention.length === 0 && <li className="py-2 text-sm text-neutral-400">Няма за момента.</li>}
        </ul>
      </section>
    </div>
  );
}
