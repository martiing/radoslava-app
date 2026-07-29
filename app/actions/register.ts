"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { registrationSchema, type RegistrationFieldErrors } from "@/lib/validation/registration-schema";
import { ADMIN_NOTIFICATION_EMAIL, EMAIL_FROM, getResendClient } from "@/lib/resend/client";
import { buildAdminNotificationEmail, buildConfirmationEmail } from "@/lib/email/templates";

export interface RegisterFormState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: RegistrationFieldErrors;
  participantId?: string;
}

const MIN_SECONDS_BEFORE_SUBMIT = 2;

export async function registerAction(
  _prevState: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  // Honeypot: real visitors never fill this hidden field; bots often do.
  const honeypot = formData.get("company");
  if (typeof honeypot === "string" && honeypot.trim().length > 0) {
    return { status: "success", message: "Заявката ти е приета." };
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
    email: formData.get("email"),
    phone: formData.get("phone"),
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

  const { name, email, phone } = parsed.data;

  try {
    const supabase = getSupabaseServerClient();
    const { data: participant, error } = await supabase
      .from("participants")
      .insert({
        name,
        email: email.toLowerCase(),
        phone,
        consent: true,
        source: "landing_page",
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return {
          status: "error",
          message: "Този имейл вече е записан. Ще получиш информация скоро.",
          fieldErrors: { email: "Вече има заявка с този имейл." },
        };
      }

      throw error;
    }

    // Best-effort: the lead is already saved, so an email hiccup shouldn't surface as a form error.
    try {
      const resend = getResendClient();
      const confirmation = buildConfirmationEmail(name);
      const adminNotification = buildAdminNotificationEmail({ name, email, phone });

      await Promise.allSettled([
        resend.emails.send({
          from: EMAIL_FROM,
          to: email,
          subject: confirmation.subject,
          html: confirmation.html,
          text: confirmation.text,
        }),
        resend.emails.send({
          from: EMAIL_FROM,
          to: ADMIN_NOTIFICATION_EMAIL,
          subject: adminNotification.subject,
          html: adminNotification.html,
          text: adminNotification.text,
        }),
      ]);
    } catch (emailError) {
      console.error("Failed to send registration emails:", emailError);
    }

    return { status: "success", message: "Заявката ти е приета.", participantId: participant.id };
  } catch {
    return {
      status: "error",
      message: "Възникна грешка. Моля, опитай отново след малко.",
    };
  }
}
