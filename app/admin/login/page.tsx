import { connection } from "next/server";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default async function AdminLoginPage() {
  // The nonce-based CSP requires request-time rendering so Next can apply the
  // per-request nonce to its bootstrap scripts.
  await connection();
  return <AdminLoginForm />;
}
