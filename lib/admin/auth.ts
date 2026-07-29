import "server-only";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin/session";

/** Throws if the current request doesn't carry a valid admin session cookie. Call at the top of every admin Server Action as defense-in-depth alongside the middleware gate. */
export async function requireAdmin(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!(await verifyAdminSessionToken(token))) {
    throw new Error("Unauthorized");
  }
}
