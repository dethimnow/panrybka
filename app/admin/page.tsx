import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PostStatus } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const [totalPosts, published, drafts, totalProducts, recentPosts] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: PostStatus.PUBLISHED } }),
    prisma.post.count({ where: { status: PostStatus.DRAFT } }),
    prisma.product.count(),
    prisma.post.findMany({
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: { id: true, title: true, status: true, slug: true, updatedAt: true },
    }),
  ]);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap gap-4">
        <Button asChild>
          <Link href="/admin/posts/new">Nowy artykuł</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/admin/products/new">Nowy produkt</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Artykuły</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-forest-700">{totalPosts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Opublikowane</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-water-700">{published}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Szkice</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-700">{drafts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Produkty</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-800">{totalProducts}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ostatnie artykuły</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 pr-4">Tytuł</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Aktualizacja</th>
                </tr>
              </thead>
              <tbody>
                {recentPosts.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100">
                    <td className="py-2 pr-4">
                      <Link href={`/admin/posts/${p.id}/edit`} className="font-medium text-water-700 hover:underline">
                        {p.title}
                      </Link>
                    </td>
                    <td className="py-2 pr-4">{p.status}</td>
                    <td className="py-2 text-gray-600">{p.updatedAt.toLocaleString("pl-PL")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
