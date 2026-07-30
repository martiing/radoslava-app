"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { quizSchema, type QuizFieldErrors } from "@/lib/validation/quiz-schema";
import { computeGoalRealism } from "@/lib/quiz/scoring";
import { getTrainingTrack } from "@/lib/plan/assignment";
import { getResendClient, EMAIL_FROM } from "@/lib/resend/client";
import { buildPersonalizedWelcomeEmail } from "@/lib/email/templates";
import { siteConfig } from "@/content/site-config";
import type { QuizAnswers } from "@/types/quiz";

export interface QuizFormState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: QuizFieldErrors;
}

export async function submitQuizAction(
  _prevState: QuizFormState,
  formData: FormData
): Promise<QuizFormState> {
  const parsed = quizSchema.safeParse({
    participantId: formData.get("participantId"),
    goal: formData.get("goal"),
    currentWeightKg: formData.get("currentWeightKg") || undefined,
    targetWeightKg: formData.get("targetWeightKg") || undefined,
    activityLevel: formData.get("activityLevel"),
    weeklyCommitment: formData.get("weeklyCommitment"),
    trainingTrack: formData.get("trainingTrack"),
    primaryFocus: formData.get("primaryFocus"),
    hasLimitations: formData.get("hasLimitations"),
    limitationsNote: formData.get("limitationsNote") || undefined,
    expectations: formData.get("expectations"),
    extraNotes: formData.get("extraNotes") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: QuizFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !(field in fieldErrors)) {
        fieldErrors[field as keyof QuizFieldErrors] = issue.message;
      }
    }

    return {
      status: "error",
      message: "Моля, провери въведените отговори.",
      fieldErrors,
    };
  }

  const data = parsed.data;
  const answers: QuizAnswers = {
    goal: data.goal,
    currentWeightKg: data.currentWeightKg,
    targetWeightKg: data.targetWeightKg,
    activityLevel: data.activityLevel,
    weeklyCommitment: data.weeklyCommitment,
    trainingTrack: data.trainingTrack,
    primaryFocus: data.primaryFocus,
    hasLimitations: data.hasLimitations === "yes",
    limitationsNote: data.limitationsNote,
    expectations: data.expectations,
    extraNotes: data.extraNotes,
  };

  const { goalRealism, goalRealismScore } = computeGoalRealism(answers);
  const nowIso = new Date().toISOString();

  try {
    const supabase = getSupabaseServerClient();
    const { data: participant, error } = await supabase
      .from("participants")
      .update({
        quiz_answers: answers,
        goal_realism: goalRealism,
        goal_realism_score: goalRealismScore,
        primary_focus: answers.primaryFocus,
        has_limitations: answers.hasLimitations,
        limitations_note: answers.limitationsNote ?? null,
        stage: "quiz_completed",
        quiz_completed_at: nowIso,
        stage_changed_at: nowIso,
      })
      .eq("id", data.participantId)
      .select("id, name, email")
      .single();

    if (error || !participant) {
      throw error ?? new Error("Participant not found for quiz submission.");
    }

    await supabase.from("participant_events").insert({
      participant_id: participant.id,
      kind: "stage_change",
      message: "Завършен въпросник за регистрация.",
      meta: { stage: "quiz_completed", goal_realism: goalRealism },
    });

    // Best-effort, same non-blocking philosophy as register.ts: the quiz
    // answers are already saved, so an email hiccup shouldn't surface as a
    // form error to the participant.
    try {
      const resend = getResendClient();
      const email = buildPersonalizedWelcomeEmail({
        name: participant.name,
        goal: answers.goal,
        goalRealism,
        primaryFocus: answers.primaryFocus,
        trainingTrack: getTrainingTrack(answers),
        hasLimitations: answers.hasLimitations,
      });

      const { error: sendError } = await resend.emails.send({
        from: EMAIL_FROM,
        to: participant.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
      });

      if (!sendError) {
        const emailedAt = new Date().toISOString();
        await supabase
          .from("participants")
          .update({ stage: "emailed", emailed_at: emailedAt, stage_changed_at: emailedAt })
          .eq("id", participant.id);

        await supabase.from("participant_events").insert({
          participant_id: participant.id,
          kind: "email_sent",
          message: "Изпратен персонализиран имейл.",
        });
      }
    } catch (emailError) {
      console.error("Failed to send personalized welcome email:", emailError);
    }

    return { status: "success", message: siteConfig.quiz.successMessage };
  } catch (submissionError) {
    console.error("Failed to submit quiz:", submissionError);
    return {
      status: "error",
      message: "Възникна грешка. Моля, опитай отново след малко.",
    };
  }
}
