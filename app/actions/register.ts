"use server";

import { after } from "next/server";
import { siteConfig } from "@/content/site-config";
import { buildAdminNotificationEmail } from "@/lib/email/templates";
import { INTAKE_GOAL_OPTIONS, INTAKE_LEVEL_OPTIONS, INTAKE_TRACK_OPTIONS } from "@/lib/intake/questions";
import { ADMIN_NOTIFICATION_EMAIL, EMAIL_FROM, getResendClient } from "@/lib/resend/client";
import {
  checkRegistrationIpRateLimit,
  checkRegistrationPhoneRateLimit,
} from "@/lib/security/rate-limit";
import { describeError } from "@/lib/security/describe-error";
import { getClientIp } from "@/lib/security/request-ip";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { registrationSchema, type RegistrationFieldErrors } from "@/lib/validation/registration-schema";

export interface RegisterFormState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: RegistrationFieldErrors;
}

const MIN_SECONDS_BEFORE_SUBMIT = 2;
const MAX_FORM_AGE_MS = 6 * 60 * 60 * 1000;

/**
 * The one success response.
 *
 * A real insert, a duplicate phone number, a honeypot hit and a phone-level
 * rate limit all return exactly this, and the form answers every one of them
 * with the Viber card. None of them can be told apart from outside.
 *
 * That is the point. The phone number is the identity here, and Bulgarian
 * mobile numbers are enumerable — 0888 plus six digits. Any response that
 * separates "already registered" from "newly registered" hands out a
 * membership oracle for an entire number range.
 */
const SUCCESS: RegisterFormState = { status: "success" };

const GENERIC_ERROR: RegisterFormState = {
  status: "error",
  message: "Възникна грешка. Моля, опитай отново след малко.",
};

const TOO_MANY_REQUESTS: RegisterFormState = {
  status: "error",
  message: "Твърде много заявки. Моля, опитай отново по-късно.",
};

function labelFor<TValue extends string>(
  options: ReadonlyArray<{ value: TValue; label: string }>,
  value: TValue
) {
  return options.find((option) => option.value === value)?.label ?? value;
}


export async function registerAction(
  _prevState: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  // Honeypot: real visitors never fill this hidden field; bots often do.
  const honeypot = formData.get("company");
  if (typeof honeypot === "string" && honeypot.trim().length > 0) {
    return SUCCESS;
  }

  // Cheap bot-speed filter. Client-supplied, so only a filter — Turnstile below
  // is the real gate. Still rejected when absent or malformed: otherwise
  // omitting the field skips the check entirely, because Number(null) is 0 and
  // Date.now() - 0 always looks old enough.
  const renderedAtRaw = formData.get("renderedAt");
  const renderedAt = typeof renderedAtRaw === "string" ? Number(renderedAtRaw) : NaN;
  const formAge = Date.now() - renderedAt;
  if (
    !Number.isFinite(renderedAt) ||
    formAge < MIN_SECONDS_BEFORE_SUBMIT * 1000 ||
    formAge > MAX_FORM_AGE_MS
  ) {
    return { status: "error", message: "Моля, презареди страницата и опитай отново." };
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

  // `phone` is already canonical E.164 — the schema normalises it, so the
  // unique index, the duplicate check and the rate limiter all agree on one
  // spelling of the number.
  const { name, phone, primaryGoal, trainingTrack, experienceLevel } = parsed.data;

  const ip = await getClientIp();

  // Gate 1 — per IP, before spending a Turnstile verification on the request.
  const ipLimit = await checkRegistrationIpRateLimit(ip);
  if (!ipLimit.allowed) {
    return TOO_MANY_REQUESTS;
  }

  // Gate 2 — proof of a human.
  const humanVerified = await verifyTurnstileToken(formData.get("turnstileToken"), ip);
  if (!humanVerified) {
    return {
      status: "error",
      message: "Не успяхме да потвърдим заявката. Моля, презареди страницата и опитай отново.",
    };
  }

  // Gate 3 — per phone number, and silent by design.
  //
  // A "too many requests" here would leak that this number has been submitted
  // before, undoing the identical duplicate response above. The visitor sees
  // the Viber card instead, which doubles as the recovery path: she can reach
  // Radoslava directly even though this submission produced no row.
  const phoneLimit = await checkRegistrationPhoneRateLimit(phone);
  if (!phoneLimit.allowed) {
    console.warn("[register] phone_rate_limit_hit");
    return SUCCESS;
  }

  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("participants").insert({
      name,
      phone,
      consent: true,
      consent_policy_version: siteConfig.footer.privacyPolicyVersion,
      source: "landing_page",
      primary_goal: primaryGoal,
      training_track: trainingTrack,
      experience_level: experienceLevel,
    });

    if (error) {
      // Duplicate phone (unique index violation) — same response as a new
      // registration. See SUCCESS above for why.
      if (error.code === "23505") {
        return SUCCESS;
      }

      console.error("[register] insert_failed:", {
        code: error.code,
        // No name, phone or intake answers: server logs must not accumulate
        // personal data.
      });
      return GENERIC_ERROR;
    }
  } catch (error) {
    // Deliberately not error.message: on this path a message can carry the
    // submitted values or provider-side detail. The name and any status code
    // are enough to tell one failure mode from another.
    console.error("[register] unexpected_failure:", describeError(error));
    return GENERIC_ERROR;
  }

  // Deferred so it runs after the response is sent rather than inside it.
  //
  // Sending inline would make a real registration measurably slower than a
  // duplicate or a rate-limited one, and a stopwatch would recover exactly the
  // distinction the identical responses are there to hide.
  //
  // The callback still runs within the function's maxDuration, so it is not
  // fire-and-forget into the void — but it can be lost to a timeout, a crash,
  // a redeploy mid-flight, or a provider failure. The lead is already
  // committed by then, so the worst case is Radoslava not being told about a
  // row that exists; the admin dashboard remains the source of truth.
  after(async () => {
    try {
      const resend = getResendClient();
      const adminNotification = buildAdminNotificationEmail({
        name,
        phone,
        primaryGoal: labelFor(INTAKE_GOAL_OPTIONS, primaryGoal),
        trainingTrack: labelFor(INTAKE_TRACK_OPTIONS, trainingTrack),
        experienceLevel: labelFor(INTAKE_LEVEL_OPTIONS, experienceLevel),
      });

      // Resend reports API failures in the resolved value; only transport and
      // configuration problems throw. Checking one without the other loses
      // roughly half the failure modes.
      const { error } = await resend.emails.send({
        from: EMAIL_FROM,
        to: ADMIN_NOTIFICATION_EMAIL,
        subject: adminNotification.subject,
        html: adminNotification.html,
        text: adminNotification.text,
      });

      if (error) {
        console.error("[register] admin_notification_rejected:", describeError(error));
      }
    } catch (error) {
      console.error("[register] admin_notification_failed:", describeError(error));
    }
  });

  return SUCCESS;
}
