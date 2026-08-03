import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseAuthServerClient } from "@/lib/supabase/auth-server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface AuthenticatedUser {
  id: string;
  email: string | null;
}

export interface AuthenticatedParticipant {
  id: string;
  name: string;
  email: string;
  stage: string;
  authUserId: string;
}

/** Verifies the cookie JWT; never trusts the unverified getSession() payload. */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const supabase = await createSupabaseAuthServerClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || typeof claims?.sub !== "string") {
    return null;
  }

  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : null,
  };
}

export async function requireClient(): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/portal/login");
  }

  return user;
}

/** Resolves the private participant record only through the service-role client. */
export async function getAuthenticatedParticipant(): Promise<AuthenticatedParticipant | null> {
  const user = await getAuthenticatedUser();
  if (!user) return null;

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("participants")
    .select("id, name, email, stage, auth_user_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to resolve authenticated participant: ${error.code}`);
  }

  if (!data?.auth_user_id) return null;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    stage: data.stage,
    authUserId: data.auth_user_id,
  };
}
