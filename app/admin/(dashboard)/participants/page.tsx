import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { STAGE_LABELS, GOAL_REALISM_LABELS, type ParticipantStage } from "@/lib/admin/stages";
import {
  MAX_PARTICIPANT_SEARCH_LENGTH,
  filterParticipantsByQuery,
  parseParticipantListFilters,
} from "@/lib/admin/participant-list";
import { StageBadge } from "@/components/admin/StageBadge";

export const dynamic = "force-dynamic";

/**
 * How many rows the screen loads. High enough that the cap is invisible for
 * the foreseeable cohort sizes, low enough to keep the page responsive.
 */
const PARTICIPANT_LIST_LIMIT = 500;

interface ParticipantRow {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  stage: ParticipantStage;
  goal_realism: string | null;
  goal_realism_override: string | null;
  created_at: string;
}

export default async function AdminParticipantsPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string | string[]; q?: string | string[] }>;
}) {
  const { stage, q } = await searchParams;
  const parsedFilters = parseParticipantListFilters(stage, q);

  if (!parsedFilters.ok) {
    return <p className="text-red-600">{parsedFilters.message}</p>;
  }

  const { stage: stageFilter, query: searchQuery } = parsedFilters.filters;
  const supabase = getSupabaseServerClient();

  // Deliberately capped, unlike the CSV export.
  //
  // Search below runs over the rows fetched here, so a capped list means a
  // capped search. That is acceptable for a screen someone scrolls, but only
  // if it says so — a quietly truncated list reads as "no such participant".
  // The export pages through everything and stays complete.
  let query = supabase
    .from("participants")
    .select("id, name, email, phone, stage, goal_realism, goal_realism_override, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .limit(PARTICIPANT_LIST_LIMIT);

  if (stageFilter) {
    query = query.eq("stage", stageFilter);
  }
  const { data: participants, error, count } = await query;

  if (error) {
    console.error("[admin] participant_list_failed:", { code: error.code });
    return <p className="text-red-600">Възникна грешка при зареждането.</p>;
  }

  const loaded = (participants ?? []) as ParticipantRow[];
  const totalMatching = count ?? loaded.length;
  const isTruncated = totalMatching > loaded.length;
  const rows = filterParticipantsByQuery(loaded, searchQuery);
  const exportQuery = new URLSearchParams();
  if (stageFilter) exportQuery.set("stage", stageFilter);
  if (searchQuery) exportQuery.set("q", searchQuery);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">
          Участнички ({rows.length}
          {isTruncated ? ` от ${totalMatching}` : ""})
        </h1>
        <div className="flex items-center gap-3">
          <form className="flex items-center gap-2">
            {stageFilter && <input type="hidden" name="stage" value={stageFilter} />}
            <input
              type="search"
              name="q"
              defaultValue={searchQuery}
              maxLength={MAX_PARTICIPANT_SEARCH_LENGTH}
              placeholder="Търси по име, имейл, телефон..."
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded-lg border border-neutral-300 px-3 py-2 text-sm">
              Търси
            </button>
          </form>
          <a
            href={`/admin/participants/export?${exportQuery.toString()}`}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm hover:border-neutral-900"
          >
            Свали CSV
          </a>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link href="/admin/participants" className={!stageFilter ? "font-semibold underline" : "text-neutral-500"}>
          Всички
        </Link>
        {Object.entries(STAGE_LABELS).map(([stage, label]) => (
          <Link
            key={stage}
            href={`/admin/participants?stage=${stage}`}
            className={stageFilter === stage ? "font-semibold underline" : "text-neutral-500"}
          >
            {label}
          </Link>
        ))}
      </div>

      {isTruncated && (
        <p
          role="status"
          className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          Показани са първите {loaded.length} от {totalMatching} записа.{" "}
          <strong>Търсенето в тази страница обхваща само заредените записи</strong>, така че
          участничка извън тях няма да се намери тук. Свалянето на CSV не е ограничено — то
          съдържа всички записи по текущия филтър.
        </p>
      )}

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
                  {participant.email && <div>{participant.email}</div>}
                  <div>{participant.phone}</div>
                </td>
                <td className="px-4 py-3">
                  <StageBadge stage={participant.stage} />
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
