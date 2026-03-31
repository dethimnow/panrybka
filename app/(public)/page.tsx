import { HeroSection } from "@/components/home/HeroSection";
import { PostGrid } from "@/components/home/PostGrid";
import type { PostCardData } from "@/components/home/PostCard";
import { HomeSchemaMarkup } from "@/components/post/SchemaMarkup";
import { prisma } from "@/lib/prisma";
import { PostStatus } from "@prisma/client";

export const revalidate = 3600;
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [total, rows] = await Promise.all([
    prisma.post.count({ where: { status: PostStatus.PUBLISHED } }),
    prisma.post.findMany({
      where: { status: PostStatus.PUBLISHED },
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

  const initialPosts: PostCardData[] = rows.map((r) => ({
    ...r,
    publishedAt: r.publishedAt,
  }));

  return (
    <>
      <HomeSchemaMarkup />
      <HeroSection />
      <PostGrid initialPosts={initialPosts} initialHasMore={total > 12} />
    </>
  );
}
