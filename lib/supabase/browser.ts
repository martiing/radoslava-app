"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser client for Supabase Auth only.
 *
 * Participant and coaching data must continue through trusted server code;
 * never use this client to bypass that boundary.
 */
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. See .env.example."
    );
  }

  return createBrowserClient(url, publishableKey);
}
