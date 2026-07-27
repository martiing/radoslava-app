"use server";

import { headers } from "next/headers";
import { siteConfig } from "@/content/site-config";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { checkRegistrationRateLimit } from "@/lib/security/rate-limit";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { registrationSchema, type RegistrationFieldErrors } from "@/lib/validation/registration-schema";

export interface RegisterFormState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: RegistrationFieldErrors;
}

const MIN_SECONDS_BEFORE_SUBMIT = 2;
const MAX_FORM_AGE_MS = 6 * 60 * 60 * 1000;

/**
 * The single success response. Genuine inserts, duplicate emails and honeypot
 * hits all return this exact object — see the duplicate handling below.
 */
const SUCCESS: RegisterFormState = { status: "success", message: "Заявката ти е приета." };

const GENERIC_ERROR: RegisterFormState = {
  status: "error",
  message: "Възникна грешка. Моля, опитай отново след малко.",
};

const TOO_MANY_REQUESTS: RegisterFormState = {
  status: "error",
  message: "Твърде много заявки. Моля, опитай отново по-късно.",
};

/** Reads the client IP from the proxy headers Vercel sets. */
async function getClientIp(): Promise<string | null> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) {
    // Left-most entry is the original client; the rest are proxies.
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  return headerList.get("x-real-ip");
}

export async function registerAction(
  _prevState: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  // Honeypot: real visitors never fill this hidden field; bots often do.
  // Answer with the normal success message so the bot learns nothing.
  const honeypot = formData.get("company");
  if (typeof honeypot === "string" && honeypot.trim().length > 0) {
    return SUCCESS;
  }

  // Simple bot-speed check: a human needs at least a couple of seconds to fill
  // the form. The value is client-supplied and therefore only a cheap filter —
  // Turnstile below is the real gate. It is still rejected when absent or
  // malformed, otherwise omitting the field would skip the check entirely.
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
    const { error } = await supabase.from("leads").insert({
      name,
      email: normalisedEmail,
      phone,
      consent: true,
      // Which version of the privacy policy this person actually agreed to.
      // Consent you cannot evidence is consent you do not have.
      consent_policy_version: siteConfig.footer.privacyPolicyVersion,
      source: "landing_page",
    });

    if (error) {
      // Duplicate email (unique index violation). We deliberately return the
      // ordinary success response instead of "this email is already
      // registered" — the latter turns the form into an oracle that lets
      // anyone test whether a given person signed up.
      if (error.code === "23505") {
        return SUCCESS;
      }

      console.error("[register] Supabase insert failed:", {
        code: error.code,
        // No name/email/phone here: server logs must not accumulate personal data.
      });
      return GENERIC_ERROR;
    }

    return SUCCESS;
  } catch (error) {
    console.error("[register] Unexpected failure:", {
      reason: error instanceof Error ? error.message : "unknown",
    });
    return GENERIC_ERROR;
  }
}
