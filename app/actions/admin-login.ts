"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  constantTimeStringEqual,
  createAdminSessionToken,
} from "@/lib/admin/session";
import { checkAdminLoginRateLimit } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/request-ip";

export interface AdminLoginState {
  status: "idle" | "error";
  message?: string;
}

export async function adminLoginAction(
  _prevState: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  const rateLimit = await checkAdminLoginRateLimit(await getClientIp());
  if (!rateLimit.allowed) {
    return {
      status: "error",
      message: "Твърде много опити. Изчакай 15 минути и опитай отново.",
    };
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error("Missing ADMIN_PASSWORD environment variable. See .env.example.");
  }

  const password = formData.get("password");
  if (
    typeof password !== "string" ||
    password.length > 256 ||
    !(await constantTimeStringEqual(password, expected))
  ) {
    return { status: "error", message: "Грешна парола." };
  }

  const token = await createAdminSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    path: "/",
  });

  redirect("/admin");
}
