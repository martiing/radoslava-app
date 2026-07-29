import Link from "next/link";
import { adminLogoutAction } from "@/app/actions/admin-logout";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/admin">Участнички</Link>
          <Link href="/admin/broadcast">Съобщение до всички</Link>
        </nav>
        <form action={adminLogoutAction}>
          <button type="submit" className="text-sm text-neutral-500 hover:text-neutral-900">
            Изход
          </button>
        </form>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
