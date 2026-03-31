import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { AdminSignOut } from "@/components/admin/AdminSignOut";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-200 bg-forest-900 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link href="/admin" className="text-lg font-bold">
            CMS PanRybka
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <Link href="/admin" className="hover:underline">
              Pulpit
            </Link>
            <Link href="/admin/posts" className="hover:underline">
              Artykuły
            </Link>
            <Link href="/admin/products" className="hover:underline">
              Produkty
            </Link>
            <Link href="/" className="hover:underline">
              Strona www
            </Link>
            <AdminSignOut />
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}
