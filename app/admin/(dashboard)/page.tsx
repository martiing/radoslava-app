import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { STAGE_LABELS, GOAL_REALISM_LABELS, type ParticipantStage } from "@/lib/admin/stages";

export const dynamic = "force-dynamic";

interface ParticipantRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  stage: ParticipantStage;
  goal_realism: string | null;
  goal_realism_override: string | null;
  created_at: string;
}

export default async function AdminParticipantsPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>;
}) {
  const { stage: stageFilter } = await searchParams;
  const supabase = getSupabaseServerClient();

  let query = supabase
    .from("participants")
    .select("id, name, email, phone, stage, goal_realism, goal_realism_override, created_at")
    .order("created_at", { ascending: false });

  if (stageFilter) {
    query = query.eq("stage", stageFilter);
  }

  const { data: participants, error } = await query;

  if (error) {
    return <p className="text-red-600">Грешка при зареждане: {error.message}</p>;
  }

  const rows = (participants ?? []) as ParticipantRow[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Участнички ({rows.length})</h1>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/admin" className={!stageFilter ? "font-semibold underline" : "text-neutral-500"}>
            Всички
          </Link>
          {Object.entries(STAGE_LABELS).map(([stage, label]) => (
            <Link
              key={stage}
              href={`/admin?stage=${stage}`}
              className={stageFilter === stage ? "font-semibold underline" : "text-neutral-500"}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Име</th>
              <th className="px-4 py-3 font-medium">Контакт</th>
              <th className="px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3 font-medium">Оценка на целта</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((participant) => (
              <tr key={participant.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/participants/${participant.id}`} className="font-medium hover:underline">
                    {participant.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-500">
                  <div>{participant.email}</div>
                  <div>{participant.phone}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium">
                    {STAGE_LABELS[participant.stage] ?? participant.stage}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {(() => {
                    const realism = participant.goal_realism_override ?? participant.goal_realism;
                    if (!realism) return <span className="text-neutral-400">—</span>;
                    return (
                      <span>
                        {GOAL_REALISM_LABELS[realism] ?? realism}
                        {participant.goal_realism_override && (
                          <span className="ml-1 text-xs text-neutral-400">(коригирано)</span>
                        )}
                      </span>
                    );
                  })()}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-neutral-400">
                  Няма участнички в тази категория.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
