import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { toSafeCsvValue } from "@/lib/admin/csv";
import {
  filterParticipantsByQuery,
  parseParticipantListFilters,
} from "@/lib/admin/participant-list";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { STAGE_LABELS, GOAL_REALISM_LABELS } from "@/lib/admin/stages";

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
  let query = supabase
    .from("participants")
    .select("name, email, phone, stage, goal_realism, goal_realism_override, primary_focus, has_limitations, created_at")
    .order("created_at", { ascending: false });

  if (stage) query = query.eq("stage", stage);

  const { data: participants, error } = await query;
  if (error) {
    console.error("[admin] participant_export_failed:", { code: error.code });
    return NextResponse.json({ error: "Възникна грешка при експортирането." }, { status: 500 });
  }

  const header = ["Име", "Имейл", "Телефон", "Статус", "Оценка на целта", "Фокус", "Ограничения", "Регистрирана на"];
  const lines = [header.map(toSafeCsvValue).join(",")];

  for (const participant of filterParticipantsByQuery(participants ?? [], searchQuery)) {
    const realism = participant.goal_realism_override ?? participant.goal_realism;
    lines.push(
      [
        toSafeCsvValue(participant.name),
        toSafeCsvValue(participant.email),
        toSafeCsvValue(participant.phone),
        toSafeCsvValue(STAGE_LABELS[participant.stage as keyof typeof STAGE_LABELS] ?? participant.stage),
        toSafeCsvValue(realism ? (GOAL_REALISM_LABELS[realism] ?? realism) : ""),
        toSafeCsvValue(participant.primary_focus ?? ""),
        toSafeCsvValue(participant.has_limitations ? "Да" : "Не"),
        toSafeCsvValue(new Date(participant.created_at).toLocaleString("bg-BG")),
      ].join(",")
    );
  }

  return new NextResponse(`\uFEFF${lines.join("\r\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="participants-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "private, no-store, max-age=0, must-revalidate",
    },
  });
}
