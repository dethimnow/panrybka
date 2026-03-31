import { CategoryPageLayout } from "@/components/category/CategoryPageLayout";
import type { PostCardData } from "@/components/home/PostCard";
import { prisma } from "@/lib/prisma";
import { PostCategory, PostStatus } from "@prisma/client";

export const revalidate = 3600;
export const dynamic = "force-dynamic";

export default async function PoradnikiPage() {
  const category = PostCategory.PORADNIK;
  const [total, rows] = await Promise.all([
    prisma.post.count({ where: { status: PostStatus.PUBLISHED, category } }),
    prisma.post.findMany({
      where: { status: PostStatus.PUBLISHED, category },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      take: 12,
      select: {
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        category: true,
        featuredImage: true,
        publishedAt: true,
      },
    }),
  ]);

  const initialPosts: PostCardData[] = rows.map((r) => ({ ...r, publishedAt: r.publishedAt }));

  return <CategoryPageLayout category={category} initialPosts={initialPosts} initialHasMore={total > 12} />;
}
