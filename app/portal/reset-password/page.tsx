import { connection } from "next/server";
import { ClientUpdatePasswordForm } from "@/components/portal/ClientAuthForms";
import { PortalAuthShell } from "@/components/portal/PortalAuthShell";
import { requireClient } from "@/lib/client/auth";

export default async function PortalResetPasswordPage() {
  await connection();
  await requireClient();

  return (
    <PortalAuthShell
      title="Избери нова парола"
      description="Използвай поне 8 символа, включително буква и цифра."
      alternateText="Линкът не работи?"
      alternateHref="/portal/forgot-password"
      alternateLabel="Заяви нов"
    >
      <ClientUpdatePasswordForm />
    </PortalAuthShell>
  );
}
