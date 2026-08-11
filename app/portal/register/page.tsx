import { connection } from "next/server";
import { redirect } from "next/navigation";
import { ClientRegisterForm } from "@/components/portal/ClientAuthForms";
import { PortalAuthShell } from "@/components/portal/PortalAuthShell";
import { portalContent } from "@/content/portal-content";
import { getAuthenticatedUser } from "@/lib/client/auth";

export default async function PortalRegisterPage() {
  await connection();
  const user = await getAuthenticatedUser();
  if (user) redirect("/portal");

  return (
    <PortalAuthShell
      title={portalContent.auth.registerTitle}
      description={portalContent.auth.registerDescription}
      alternateText="Вече имаш профил?"
      alternateHref="/portal/login"
      alternateLabel="Влез"
    >
      <ClientRegisterForm />
    </PortalAuthShell>
  );
}
