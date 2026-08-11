import "server-only";

import { headers } from "next/headers";

/** Reads the original client IP from the proxy headers set by Vercel. */
export async function getClientIp(): Promise<string | null> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");

  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  return headerList.get("x-real-ip");
}
