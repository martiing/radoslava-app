"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getStageTimestampColumn, type ParticipantStage } from "@/lib/admin/stages";
import { getResendClient, EMAIL_FROM } from "@/lib/resend/client";
import { buildPersonalizedWelcomeEmail } from "@/lib/email/templates";
import type { GoalRealism, PrimaryFocus } from "@/types/quiz";

export async function updateParticipantStage(participantId: string, stage: ParticipantStage): Promise<void> {
  await requireAdmin();

  const supabase = getSupabaseServerClient();
  const nowIso = new Date().toISOString();
  const timestampColumn = getStageTimestampColumn(stage);

  const { error } = await supabase
    .from("participants")
    .update({
      stage,
      stage_changed_at: nowIso,
      ...(timestampColumn ? { [timestampColumn]: nowIso } : {}),
    })
    .eq("id", participantId);

  if (error) throw error;

  await supabase.from("participant_events").insert({
    participant_id: participantId,
    kind: "stage_change",
    message: `Статус променен на "${stage}".`,
    meta: { stage },
  });

  revalidatePath(`/admin/participants/${participantId}`);
  revalidatePath("/admin");
}

export async function addParticipantNote(formData: FormData): Promise<void> {
  await requireAdmin();

  const participantId = String(formData.get("participantId") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  if (!participantId || !message) return;

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("participant_events").insert({
    participant_id: participantId,
    kind: "note",
    message,
  });

  if (error) throw error;

  revalidatePath(`/admin/participants/${participantId}`);
}

export async function overrideGoalRealism(formData: FormData): Promise<void> {
  await requireAdmin();

  const participantId = String(formData.get("participantId") ?? "");
  const value = String(formData.get("goalRealismOverride") ?? "");
  if (!participantId) return;

  const override: GoalRealism | null =
    value === "realistic" || value === "ambitious" || value === "unrealistic" ? value : null;

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("participants")
    .update({ goal_realism_override: override })
    .eq("id", participantId);

  if (error) throw error;

  await supabase.from("participant_events").insert({
    participant_id: participantId,
    kind: "note",
    message: override ? `Ръчно коригирана оценка на целта на "${override}".` : "Премахната ръчна корекция на целта.",
  });

  revalidatePath(`/admin/participants/${participantId}`);
}

export async function resendPersonalizedEmail(participantId: string): Promise<void> {
  await requireAdmin();

  const supabase = getSupabaseServerClient();
  const { data: participant, error } = await supabase
    .from("participants")
    .select("id, name, email, goal_realism, goal_realism_override, primary_focus, has_limitations")
    .eq("id", participantId)
    .single();

  if (error || !participant) throw error ?? new Error("Participant not found.");
  if (!participant.primary_focus) {
    throw new Error("Participant hasn't completed the quiz yet — nothing to personalize.");
  }

  const goalRealism: GoalRealism = (participant.goal_realism_override ?? participant.goal_realism ?? "realistic") as GoalRealism;

  const resend = getResendClient();
  const email = buildPersonalizedWelcomeEmail({
    name: participant.name,
    goalRealism,
    primaryFocus: participant.primary_focus as PrimaryFocus,
    hasLimitations: participant.has_limitations,
  });

  await resend.emails.send({
    from: EMAIL_FROM,
    to: participant.email,
    subject: email.subject,
    html: email.html,
    text: email.text,
  });

  await supabase.from("participant_events").insert({
    participant_id: participantId,
    kind: "email_sent",
    message: "Повторно изпратен персонализиран имейл (от админ панела).",
  });

  revalidatePath(`/admin/participants/${participantId}`);
}

export interface BroadcastState {
  status: "idle" | "error" | "success";
  message?: string;
}

export async function sendBroadcastAction(
  _prevState: BroadcastState,
  formData: FormData
): Promise<BroadcastState> {
  await requireAdmin();

  const stage = String(formData.get("stage") ?? "");
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!stage || !subject || !body) {
    return { status: "error", message: "Моля, попълни всички полета." };
  }

  const supabase = getSupabaseServerClient();
  const { data: participants, error } = await supabase
    .from("participants")
    .select("id, name, email")
    .eq("stage", stage);

  if (error) throw error;
  if (!participants || participants.length === 0) {
    return { status: "success", message: "Няма участнички с избрания статус." };
  }

  const resend = getResendClient();
  let sentCount = 0;

  for (const participant of participants) {
    const firstName = participant.name.trim().split(/\s+/)[0] || participant.name;
    const text = `Здравей, ${firstName}!\n\n${body}`;

    const { error: sendError } = await resend.emails.send({
      from: EMAIL_FROM,
      to: participant.email,
      subject,
      text,
      html: `<p>Здравей, ${firstName}!</p><p>${body.replace(/\n/g, "<br/>")}</p>`,
    });

    if (!sendError) {
      sentCount += 1;
      await supabase.from("participant_events").insert({
        participant_id: participant.id,
        kind: "broadcast",
        message: subject,
      });
    }
  }

  return { status: "success", message: `Изпратени имейли: ${sentCount} от ${participants.length}.` };
}
