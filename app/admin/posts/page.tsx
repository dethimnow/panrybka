import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

export const revalidate = 0;

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, status: true, category: true, slug: true, updatedAt: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-forest-900">Artykuły</h1>
        <Button asChild>
          <Link href="/admin/posts/new">Nowy artykuł</Link>
        </Button>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-3">Tytuł</th>
              <th className="p-3">Kategoria</th>
              <th className="p-3">Status</th>
              <th className="p-3">Aktualizacja</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-b border-gray-100">
                <td className="p-3">
                  <Link href={`/admin/posts/${p.id}/edit`} className="font-medium text-water-700 hover:underline">
                    {p.title}
                  </Link>
                </td>
                <td className="p-3">{p.category}</td>
                <td className="p-3">{p.status}</td>
                <td className="p-3 text-gray-600">{p.updatedAt.toLocaleString("pl-PL")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
