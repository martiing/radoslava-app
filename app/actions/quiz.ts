"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { quizSchema, type QuizFieldErrors } from "@/lib/validation/quiz-schema";
import { computeGoalRealism } from "@/lib/quiz/scoring";
import { getTrainingTrack } from "@/lib/plan/assignment";
import { getResendClient, EMAIL_FROM } from "@/lib/resend/client";
import { buildPersonalizedWelcomeEmail } from "@/lib/email/templates";
import { describeError } from "@/lib/security/describe-error";
import { siteConfig } from "@/content/site-config";
import { verifyQuizSessionToken } from "@/lib/quiz/session";
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
    quizToken: formData.get("quizToken"),
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
  const participantId = await verifyQuizSessionToken(data.quizToken);
  if (!participantId) {
    return {
      status: "error",
      message: "Сесията за въпросника е изтекла. Моля, презареди страницата.",
    };
  }

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
      .eq("id", participantId)
      .eq("stage", "registered")
      .select("id, name, email")
      .maybeSingle();

    if (error) {
      throw error;
    }

    // Duplicate registrations and honeypots receive a signed decoy token so
    // the registration response cannot reveal whether an email exists. Their
    // quiz submission follows the same visible success path without a write.
    if (!participant) {
      return { status: "success", message: siteConfig.quiz.successMessage };
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
    } catch {
      console.error("[quiz] Personalized email dispatch failed.");
    }

    return { status: "success", message: siteConfig.quiz.successMessage };
  } catch (submissionError) {
    // Provider messages can include query detail or submitted values. Keep
    // public-flow logs diagnostic without accumulating participant data.
    console.error("[quiz] Submission failed:", describeError(submissionError));
    return {
      status: "error",
      message: "Възникна грешка. Моля, опитай отново след малко.",
    };
  }
}
