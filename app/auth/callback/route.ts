import { NextResponse, type NextRequest } from "next/server";
import { getSafePortalRedirect } from "@/lib/client/redirect";
import { createSupabaseAuthServerClient } from "@/lib/supabase/auth-server";

function privateRedirect(url: URL) {
  const response = NextResponse.redirect(url);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = getSafePortalRedirect(request.nextUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createSupabaseAuthServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return privateRedirect(new URL(next, request.url));
    }
  }

  const loginUrl = new URL("/portal/login", request.url);
  loginUrl.searchParams.set("error", "confirmation");
  return privateRedirect(loginUrl);
}
