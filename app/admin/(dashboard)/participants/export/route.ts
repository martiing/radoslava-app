import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { toSafeCsvValue } from "@/lib/admin/csv";
import { fetchAllRows } from "@/lib/admin/paginate";
import {
  filterParticipantsByQuery,
  parseParticipantListFilters,
} from "@/lib/admin/participant-list";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { STAGE_LABELS, GOAL_REALISM_LABELS } from "@/lib/admin/stages";

interface ExportRow {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  stage: string;
  goal_realism: string | null;
  goal_realism_override: string | null;
  primary_focus: string | null;
  has_limitations: boolean;
  created_at: string;
}

const EXPORT_COLUMNS =
  "id, name, email, phone, stage, goal_realism, goal_realism_override, primary_focus, has_limitations, created_at";

/**
 * Written as a code point rather than a literal character: a bare U+FEFF is
 * invisible in a diff, and tooling that trims leading whitespace can silently
 * remove it. Without it Excel guesses the encoding and mangles Cyrillic names.
 */
const UTF8_BOM = String.fromCharCode(0xfeff);

export async function GET(request: NextRequest) {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const stageValues = searchParams.getAll("stage");
  const queryValues = searchParams.getAll("q");
  const parsedFilters = parseParticipantListFilters(
    stageValues.length > 1 ? stageValues : stageValues[0],
    queryValues.length > 1 ? queryValues : queryValues[0]
  );
  if (!parsedFilters.ok) {
    return NextResponse.json({ error: parsedFilters.message }, { status: 400 });
  }

  const { stage, query: searchQuery } = parsedFilters.filters;
  const supabase = getSupabaseServerClient();

  // The export must be complete, so it pages through everything rather than
  // taking whatever one response happens to contain.
  //
  // `created_at` alone is not a total order — two participants can share a
  // timestamp, and rows that tie can swap places between requests, which shows
  // up as a duplicate in one page and a missing row in another. `id` breaks
  // every tie.
  const result = await fetchAllRows<ExportRow>(async (from, to) => {
    let query = supabase
      .from("participants")
      .select(EXPORT_COLUMNS)
      .order("created_at", { ascending: false })
      .order("id", { ascending: true })
      .range(from, to);

    if (stage) query = query.eq("stage", stage);

    const { data, error } = await query;
    return { data: data as ExportRow[] | null, error };
  });

  if (!result.ok) {
    console.error("[admin] participant_export_failed:", {
      reason: result.reason,
      code: result.code,
    });
    return NextResponse.json({ error: "Възникна грешка при експортирането." }, { status: 500 });
  }

  const participants = filterParticipantsByQuery(result.rows, searchQuery);

  const header = ["Име", "Имейл", "Телефон", "Статус", "Оценка на целта", "Фокус", "Ограничения", "Регистрирана на"];
  const lines = [header.map(toSafeCsvValue).join(",")];

  for (const participant of participants) {
    const realism = participant.goal_realism_override ?? participant.goal_realism;
    lines.push(
      [
        toSafeCsvValue(participant.name),
        toSafeCsvValue(participant.email),
        toSafeCsvValue(participant.phone),
        toSafeCsvValue(STAGE_LABELS[participant.stage as keyof typeof STAGE_LABELS] ?? participant.stage),
        toSafeCsvValue(
          realism ? (GOAL_REALISM_LABELS[realism as keyof typeof GOAL_REALISM_LABELS] ?? realism) : ""
        ),
        toSafeCsvValue(participant.primary_focus ?? ""),
        toSafeCsvValue(participant.has_limitations ? "Да" : "Не"),
        toSafeCsvValue(new Date(participant.created_at).toLocaleString("bg-BG")),
      ].join(",")
    );
  }

  return new NextResponse(`${UTF8_BOM}${lines.join("\r\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="participants-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "private, no-store, max-age=0, must-revalidate",
    },
  });
}
