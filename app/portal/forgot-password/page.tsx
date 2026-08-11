import { connection } from "next/server";
import { ClientForgotPasswordForm } from "@/components/portal/ClientAuthForms";
import { PortalAuthShell } from "@/components/portal/PortalAuthShell";

export default async function PortalForgotPasswordPage() {
  await connection();

  return (
    <PortalAuthShell
      title="Нова парола"
      description="Въведи имейла на профила си и ще ти изпратим защитен линк."
      alternateText="Спомни си паролата?"
      alternateHref="/portal/login"
      alternateLabel="Върни се към входа"
    >
      <ClientForgotPasswordForm />
    </PortalAuthShell>
  );
}
