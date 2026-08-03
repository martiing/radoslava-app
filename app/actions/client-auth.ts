"use server";

import { redirect } from "next/navigation";
import { siteConfig } from "@/content/site-config";
import { getAuthenticatedUser } from "@/lib/client/auth";
import { getSafePortalRedirect } from "@/lib/client/redirect";
import { checkClientLoginRateLimit, checkRegistrationRateLimit } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/request-ip";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { createSupabaseAuthServerClient } from "@/lib/supabase/auth-server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  clientLoginSchema,
  clientForgotPasswordSchema,
  clientRegisterSchema,
  clientUpdatePasswordSchema,
  type ClientAuthField,
  type ClientAuthFieldErrors,
} from "@/lib/validation/client-auth-schema";

export interface ClientAuthState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: ClientAuthFieldErrors;
}

function firstFieldErrors(issues: Array<{ path: PropertyKey[]; message: string }>) {
  const fieldErrors: ClientAuthFieldErrors = {};

  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !(field in fieldErrors)) {
      fieldErrors[field as ClientAuthField] = issue.message;
    }
  }

  return fieldErrors;
}

function getAuthRedirectUrl(next = "/portal") {
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.meta.siteUrl;
  const callbackUrl = new URL("/auth/callback", configuredOrigin);
  callbackUrl.searchParams.set("next", next);
  return callbackUrl.toString();
}

export async function clientLoginAction(
  _previousState: ClientAuthState,
  formData: FormData
): Promise<ClientAuthState> {
  const parsed = clientLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { status: "error", fieldErrors: firstFieldErrors(parsed.error.issues) };
  }

  const rateLimit = await checkClientLoginRateLimit(await getClientIp(), parsed.data.email);
  if (!rateLimit.allowed) {
    return {
      status: "error",
      message: "Твърде много опити. Изчакай 15 минути и опитай отново.",
    };
  }

  const supabase = await createSupabaseAuthServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      status: "error",
      message: "Невалиден имейл или парола.",
    };
  }

  redirect(getSafePortalRedirect(String(formData.get("next") ?? "")));
}

export async function clientRegisterAction(
  _previousState: ClientAuthState,
  formData: FormData
): Promise<ClientAuthState> {
  const parsed = clientRegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    consent: formData.get("consent"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { status: "error", fieldErrors: firstFieldErrors(parsed.error.issues) };
  }

  const { name, email, phone, password } = parsed.data;
  const ip = await getClientIp();
  const rateLimit = await checkRegistrationRateLimit(ip, email);
  if (!rateLimit.allowed) {
    return {
      status: "error",
      message: "Твърде много заявки. Опитай отново по-късно.",
    };
  }

  if (!(await verifyTurnstileToken(formData.get("turnstileToken"), ip))) {
    return {
      status: "error",
      message: "Не успяхме да потвърдим заявката. Презареди страницата и опитай отново.",
    };
  }

  const serviceClient = getSupabaseServerClient();
  const authClient = await createSupabaseAuthServerClient();
  const { data: signUpData, error: signUpError } = await authClient.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: getAuthRedirectUrl() },
  });

  if (signUpError) {
    console.error("[client-auth] Sign-up failed:", {
      code: signUpError.code ?? "unknown",
      status: signUpError.status,
    });
    return { status: "error", message: "Не успяхме да създадем профила. Опитай отново." };
  }

  const authUser = signUpData.user;
  if (!authUser || authUser.identities?.length === 0) {
    return {
      status: "success",
      message: "Ако адресът може да бъде регистриран, ще получиш имейл с потвърждение.",
    };
  }

  const { data: existingParticipant, error: lookupError } = await serviceClient
    .from("participants")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (lookupError) {
    await serviceClient.auth.admin.deleteUser(authUser.id);
    console.error("[client-auth] Participant lookup failed:", { code: lookupError.code });
    return { status: "error", message: "Възникна грешка. Опитай отново след малко." };
  }

  // Existing challenge participants are deliberately not linked by email
  // alone. Milestone 3 will link them through a single-use invite token.
  if (existingParticipant) {
    return {
      status: "success",
      message: "Провери имейла си и потвърди адреса, за да продължиш.",
    };
  }

  const { error: participantError } = await serviceClient.from("participants").insert({
    name,
    email,
    phone,
    consent: true,
    consent_policy_version: siteConfig.footer.privacyPolicyVersion,
    source: "portal_registration",
    auth_user_id: authUser.id,
  });

  if (participantError) {
    const { error: cleanupError } = await serviceClient.auth.admin.deleteUser(authUser.id);
    if (cleanupError) {
      console.error("[client-auth] Orphaned Auth user cleanup failed:", {
        status: cleanupError.status,
      });
    }

    if (participantError.code === "23505") {
      return {
        status: "success",
        message: "Ако адресът може да бъде регистриран, ще получиш имейл с потвърждение.",
      };
    }

    console.error("[client-auth] Participant creation failed:", { code: participantError.code });
    return { status: "error", message: "Не успяхме да създадем профила. Опитай отново." };
  }

  return {
    status: "success",
    message: "Провери имейла си и потвърди адреса, за да влезеш в портала.",
  };
}

export async function clientLogoutAction() {
  const supabase = await createSupabaseAuthServerClient();
  await supabase.auth.signOut();
  redirect("/portal/login");
}

export async function clientForgotPasswordAction(
  _previousState: ClientAuthState,
  formData: FormData
): Promise<ClientAuthState> {
  const parsed = clientForgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { status: "error", fieldErrors: firstFieldErrors(parsed.error.issues) };
  }

  const rateLimit = await checkClientLoginRateLimit(await getClientIp(), parsed.data.email);
  if (!rateLimit.allowed) {
    return {
      status: "error",
      message: "Твърде много заявки. Изчакай 15 минути и опитай отново.",
    };
  }

  const supabase = await createSupabaseAuthServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: getAuthRedirectUrl("/portal/reset-password"),
  });

  if (error) {
    console.error("[client-auth] Password reset request failed:", {
      code: error.code ?? "unknown",
      status: error.status,
    });
  }

  // Always return the same response so the form cannot enumerate accounts.
  return {
    status: "success",
    message: "Ако има профил с този имейл, ще получиш линк за нова парола.",
  };
}

export async function clientUpdatePasswordAction(
  _previousState: ClientAuthState,
  formData: FormData
): Promise<ClientAuthState> {
  const parsed = clientUpdatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { status: "error", fieldErrors: firstFieldErrors(parsed.error.issues) };
  }

  if (!(await getAuthenticatedUser())) {
    return {
      status: "error",
      message: "Линкът е изтекъл. Заяви нов линк за промяна на паролата.",
    };
  }

  const supabase = await createSupabaseAuthServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return {
      status: "error",
      message: "Не успяхме да сменим паролата. Заяви нов линк и опитай отново.",
    };
  }

  await supabase.auth.signOut({ scope: "global" });
  redirect("/portal/login?status=password-updated");
}
