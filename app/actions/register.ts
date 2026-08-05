"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { registrationSchema, type RegistrationFieldErrors } from "@/lib/validation/registration-schema";
import { ADMIN_NOTIFICATION_EMAIL, EMAIL_FROM, getResendClient } from "@/lib/resend/client";
import { buildAdminNotificationEmail } from "@/lib/email/templates";
import { INTAKE_GOAL_OPTIONS, INTAKE_LEVEL_OPTIONS, INTAKE_TRACK_OPTIONS } from "@/lib/intake/questions";

export interface RegisterFormState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: RegistrationFieldErrors;
}

const MIN_SECONDS_BEFORE_SUBMIT = 2;

function labelFor<TValue extends string>(options: ReadonlyArray<{ value: TValue; label: string }>, value: TValue) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export async function registerAction(
  _prevState: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  // Honeypot: real visitors never fill this hidden field; bots often do.
  const honeypot = formData.get("company");
  if (typeof honeypot === "string" && honeypot.trim().length > 0) {
    return { status: "success" };
  }

  // Simple bot-speed check: a human needs at least a couple of seconds to fill the form.
  const renderedAt = Number(formData.get("renderedAt"));
  if (Number.isFinite(renderedAt) && Date.now() - renderedAt < MIN_SECONDS_BEFORE_SUBMIT * 1000) {
    return {
      status: "error",
      message: "Моля, опитай отново.",
    };
  }

  const parsed = registrationSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    primaryGoal: formData.get("primaryGoal"),
    trainingTrack: formData.get("trainingTrack"),
    experienceLevel: formData.get("experienceLevel"),
    consent: formData.get("consent"),
  });

  if (!parsed.success) {
    const fieldErrors: RegistrationFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !(field in fieldErrors)) {
        fieldErrors[field as keyof RegistrationFieldErrors] = issue.message;
      }
    }

    return {
      status: "error",
      message: "Моля, провери въведените данни.",
      fieldErrors,
    };
  }

  const { name, phone, primaryGoal, trainingTrack, experienceLevel } = parsed.data;

  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("participants").insert({
      name,
      phone,
      consent: true,
      source: "landing_page",
      primary_goal: primaryGoal,
      training_track: trainingTrack,
      experience_level: experienceLevel,
    });

    if (error) {
      if (error.code === "23505") {
        return {
          status: "error",
          message: "Вече има заявка с този телефонен номер. Ще се свържем с теб скоро.",
          fieldErrors: { phone: "Вече има заявка с този телефон." },
        };
      }

      throw error;
    }

    // Best-effort: the lead is already saved, so an email hiccup shouldn't
    // surface as a form error. This notifies Radoslava only — the
    // participant's next step is the on-page Viber card, not an email.
    try {
      const resend = getResendClient();
      const adminNotification = buildAdminNotificationEmail({
        name,
        phone,
        primaryGoal: labelFor(INTAKE_GOAL_OPTIONS, primaryGoal),
        trainingTrack: labelFor(INTAKE_TRACK_OPTIONS, trainingTrack),
        experienceLevel: labelFor(INTAKE_LEVEL_OPTIONS, experienceLevel),
      });

      await resend.emails.send({
        from: EMAIL_FROM,
        to: ADMIN_NOTIFICATION_EMAIL,
        subject: adminNotification.subject,
        html: adminNotification.html,
        text: adminNotification.text,
      });
    } catch (emailError) {
      console.error("Failed to send admin notification email:", emailError);
    }

    return { status: "success" };
  } catch {
    return {
      status: "error",
      message: "Възникна грешка. Моля, опитай отново след малко.",
    };
  }
}
