import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { STAGE_LABELS, GOAL_REALISM_LABELS } from "@/lib/admin/stages";

function toCsvValue(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const stage = searchParams.get("stage");
  const q = searchParams.get("q");

  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("participants")
    .select("name, email, phone, stage, goal_realism, goal_realism_override, primary_focus, has_limitations, created_at")
    .order("created_at", { ascending: false });

  if (stage) query = query.eq("stage", stage);
  if (q) {
    const escaped = q.replace(/[%,]/g, "");
    query = query.or(`name.ilike.%${escaped}%,email.ilike.%${escaped}%,phone.ilike.%${escaped}%`);
  }

  const { data: participants, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const header = ["Име", "Имейл", "Телефон", "Статус", "Оценка на целта", "Фокус", "Ограничения", "Регистрирана на"];
  const lines = [header.map(toCsvValue).join(",")];

  for (const participant of participants ?? []) {
    const realism = participant.goal_realism_override ?? participant.goal_realism;
    lines.push(
      [
        toCsvValue(participant.name),
        toCsvValue(participant.email),
        toCsvValue(participant.phone),
        toCsvValue(STAGE_LABELS[participant.stage as keyof typeof STAGE_LABELS] ?? participant.stage),
        toCsvValue(realism ? (GOAL_REALISM_LABELS[realism] ?? realism) : ""),
        toCsvValue(participant.primary_focus ?? ""),
        toCsvValue(participant.has_limitations ? "Да" : "Не"),
        toCsvValue(new Date(participant.created_at).toLocaleString("bg-BG")),
      ].join(",")
    );
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="participants-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
