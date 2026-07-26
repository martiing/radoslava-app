"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { registrationSchema, type RegistrationFieldErrors } from "@/lib/validation/registration-schema";

export interface RegisterFormState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: RegistrationFieldErrors;
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
    const { error } = await supabase.from("leads").insert({
      name,
      email: email.toLowerCase(),
      phone,
      consent: true,
      source: "landing_page",
    });

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

    return { status: "success", message: "Заявката ти е приета." };
  } catch {
    return {
      status: "error",
      message: "Възникна грешка. Моля, опитай отново след малко.",
    };
  }
}
