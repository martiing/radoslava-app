import Link from "next/link";
import { clientLogoutAction } from "@/app/actions/client-auth";
import { Logo } from "@/components/ui/Logo";
import { siteConfig } from "@/content/site-config";
import { requireClient } from "@/lib/client/auth";

export const dynamic = "force-dynamic";

export default async function PortalDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireClient();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface/95">
        <div className="mx-auto flex min-h-18 max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            href="/portal"
            className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Logo
              shortName={siteConfig.header.brandShort}
              fullName={siteConfig.header.brandFull}
            />
          </Link>
          <div className="flex items-center gap-3 sm:gap-5">
            <span className="hidden max-w-56 truncate text-sm text-muted sm:block">{user.email}</span>
            <form action={clientLogoutAction}>
              <button
                type="submit"
                className="min-h-11 rounded-full border border-border px-5 text-sm font-semibold transition hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Изход
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">{children}</main>
    </div>
  );
}
