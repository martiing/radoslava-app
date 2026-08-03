"use server";

import { siteConfig } from "@/content/site-config";
import { buildAdminNotificationEmail, buildConfirmationEmail } from "@/lib/email/templates";
import { createQuizSessionToken } from "@/lib/quiz/session";
import { ADMIN_NOTIFICATION_EMAIL, EMAIL_FROM, getResendClient } from "@/lib/resend/client";
import { checkRegistrationRateLimit } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/request-ip";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { registrationSchema, type RegistrationFieldErrors } from "@/lib/validation/registration-schema";

export interface RegisterFormState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: RegistrationFieldErrors;
  quizToken?: string;
}

const MIN_SECONDS_BEFORE_SUBMIT = 2;
const MAX_FORM_AGE_MS = 6 * 60 * 60 * 1000;

const GENERIC_ERROR: RegisterFormState = {
  status: "error",
  message: "Възникна грешка. Моля, опитай отново след малко.",
};

const TOO_MANY_REQUESTS: RegisterFormState = {
  status: "error",
  message: "Твърде много заявки. Моля, опитай отново по-късно.",
};

async function successResponse(participantId = crypto.randomUUID()): Promise<RegisterFormState> {
  try {
    return {
      status: "success",
      message: siteConfig.registration.successMessage,
      // Duplicates and honeypots receive a signed decoy token, preserving the
      // same response shape without exposing an existing participant ID.
      quizToken: await createQuizSessionToken(participantId),
    };
  } catch {
    // Registration must remain available if only the follow-up quiz secret is
    // misconfigured. The quiz stays fail-closed by not receiving a token.
    console.error("[register] QUIZ_SESSION_SECRET is missing; quiz handoff is disabled.");
    return {
      status: "success",
      message: siteConfig.registration.successMessage,
    };
  }
}

export async function registerAction(
  _prevState: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  const honeypot = formData.get("company");
  if (typeof honeypot === "string" && honeypot.trim().length > 0) {
    return successResponse();
  }

  const renderedAtRaw = formData.get("renderedAt");
  const renderedAt = typeof renderedAtRaw === "string" ? Number(renderedAtRaw) : Number.NaN;
  const formAge = Date.now() - renderedAt;
  if (
    !Number.isFinite(renderedAt) ||
    formAge < MIN_SECONDS_BEFORE_SUBMIT * 1000 ||
    formAge > MAX_FORM_AGE_MS
  ) {
    return {
      status: "error",
      message: "Моля, презареди страницата и опитай отново.",
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
  const normalisedEmail = email.toLowerCase();
  const ip = await getClientIp();

  const rateLimit = await checkRegistrationRateLimit(ip, normalisedEmail);
  if (!rateLimit.allowed) {
    return TOO_MANY_REQUESTS;
  }

  const humanVerified = await verifyTurnstileToken(formData.get("turnstileToken"), ip);
  if (!humanVerified) {
    return {
      status: "error",
      message: "Не успяхме да потвърдим заявката. Моля, презареди страницата и опитай отново.",
    };
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data: participant, error } = await supabase
      .from("participants")
      .insert({
        name,
        email: normalisedEmail,
        phone,
        consent: true,
        consent_policy_version: siteConfig.footer.privacyPolicyVersion,
        source: "landing_page",
      })
      .select("id")
      .single();

    if (error) {
      // The response must not reveal whether a given email already exists.
      if (error.code === "23505") {
        return successResponse();
      }

      console.error("[register] Supabase insert failed:", { code: error.code });
      return GENERIC_ERROR;
    }

    try {
      const resend = getResendClient();
      const confirmation = buildConfirmationEmail(name);
      const adminNotification = buildAdminNotificationEmail({ name, email: normalisedEmail, phone });

      await Promise.allSettled([
        resend.emails.send({
          from: EMAIL_FROM,
          to: normalisedEmail,
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
    } catch {
      console.error("[register] Registration email dispatch failed.");
    }

    return successResponse(participant.id);
  } catch (error) {
    console.error("[register] Unexpected failure:", {
      reason: error instanceof Error ? error.message : "unknown",
    });
    return GENERIC_ERROR;
  }
}
