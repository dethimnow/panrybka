import { PostCategory, PostStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getPublishedPostBySlug(slug: string) {
  return prisma.post.findFirst({
    where: { slug, status: PostStatus.PUBLISHED },
    include: {
      products: {
        include: { product: true },
        orderBy: { position: "asc" },
      },
    },
  });
}

export async function getPublishedPostsByCategory(category: PostCategory, take = 6) {
  return prisma.post.findMany({
    where: { category, status: PostStatus.PUBLISHED },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    take,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      category: true,
      featuredImage: true,
      author: true,
      publishedAt: true,
    },
  });
}

export async function getPopularFocusKeywords(limit = 8) {
  const rows = await prisma.post.findMany({
    where: { status: PostStatus.PUBLISHED, focusKeyword: { not: null } },
    select: { focusKeyword: true },
    take: 40,
  });
  const set = new Set<string>();
  for (const r of rows) {
    if (r.focusKeyword) set.add(r.focusKeyword);
    if (set.size >= limit) break;
  }
  return Array.from(set);
}

export async function getFeaturedProducts(limit = 4) {
  return prisma.product.findMany({
    orderBy: { rating: "desc" },
    take: limit,
  });
}
