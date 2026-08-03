import { connection } from "next/server";
import { redirect } from "next/navigation";
import { ClientLoginForm } from "@/components/portal/ClientAuthForms";
import { PortalAuthShell } from "@/components/portal/PortalAuthShell";
import { portalContent } from "@/content/portal-content";
import { getAuthenticatedUser } from "@/lib/client/auth";
import { getSafePortalRedirect } from "@/lib/client/redirect";

interface LoginPageProps {
  searchParams: Promise<{ next?: string; error?: string; status?: string }>;
}

export default async function PortalLoginPage({ searchParams }: LoginPageProps) {
  await connection();
  const user = await getAuthenticatedUser();
  if (user) redirect("/portal");

  const params = await searchParams;

  return (
    <PortalAuthShell
      title={portalContent.auth.loginTitle}
      description={portalContent.auth.loginDescription}
      alternateText="Нямаш профил?"
      alternateHref="/portal/register"
      alternateLabel="Регистрирай се"
    >
      <ClientLoginForm
        next={getSafePortalRedirect(params.next ?? null)}
        confirmationError={params.error === "confirmation"}
        passwordUpdated={params.status === "password-updated"}
      />
    </PortalAuthShell>
  );
}
