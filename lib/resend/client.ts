import "server-only";
import { Resend } from "resend";

/**
 * Server-only Resend client. Never import this from a client component —
 * the API key must stay on the server.
 */
export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY environment variable. See .env.example.");
  }

  return new Resend(apiKey);
}

/** Sender used for all outgoing mail — must be a domain/address verified in Resend. */
export const EMAIL_FROM = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

if (EMAIL_FROM.includes("@resend.dev")) {
  console.warn(
    "[resend] EMAIL_FROM is still the Resend sandbox sender (onboarding@resend.dev) — it can only deliver to your " +
      "own verified Resend account, not real participants. Verify a domain in the Resend dashboard and set " +
      "RESEND_FROM_EMAIL before going live."
  );
}

/** Inbox that receives new-lead notifications. */
export const ADMIN_NOTIFICATION_EMAIL =
  process.env.RESEND_ADMIN_EMAIL || "radislavova4@gmail.com";
