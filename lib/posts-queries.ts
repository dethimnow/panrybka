import { PostCategory, PostStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const postListSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  category: true,
  featuredImage: true,
  author: true,
  publishedAt: true,
} satisfies Prisma.PostSelect;

export type PostListRow = Prisma.PostGetPayload<{ select: typeof postListSelect }>;

const postArticleInclude = {
  products: {
    include: { product: true },
    orderBy: { position: "asc" as const },
  },
} satisfies Prisma.PostInclude;

export type PublishedPostWithProducts = Prisma.PostGetPayload<{ include: typeof postArticleInclude }>;

export type LoadPublishedPostResult =
  | { status: "ok"; post: PublishedPostWithProducts }
  | { status: "not_found" }
  | { status: "db_error" };

function logDbError(context: string, error: unknown) {
  console.error(`[PanRybka DB ${context}]`, error);
}

export async function loadPublishedPostBySlug(slug: string): Promise<LoadPublishedPostResult> {
  try {
    const post = await prisma.post.findFirst({
      where: { slug, status: PostStatus.PUBLISHED },
      include: postArticleInclude,
    });
    if (!post) return { status: "not_found" };
    return { status: "ok", post };
  } catch (error) {
    logDbError("loadPublishedPostBySlug", error);
    return { status: "db_error" };
  }
}

export async function getPublishedPostBySlug(slug: string): Promise<PublishedPostWithProducts | null> {
  const r = await loadPublishedPostBySlug(slug);
  return r.status === "ok" ? r.post : null;
}

export async function getPublishedPostsByCategory(category: PostCategory, take = 6): Promise<PostListRow[]> {
  try {
    return await prisma.post.findMany({
      where: { category, status: PostStatus.PUBLISHED },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      take,
      select: postListSelect,
    });
  } catch (error) {
    logDbError("getPublishedPostsByCategory", error);
    return [];
  }
}

export async function getPopularFocusKeywords(limit = 8): Promise<string[]> {
  try {
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
  } catch (error) {
    logDbError("getPopularFocusKeywords", error);
    return [];
  }
}

export async function getFeaturedProducts(limit = 4) {
  try {
    return await prisma.product.findMany({
      orderBy: { rating: "desc" },
      take: limit,
    });
  } catch (error) {
    logDbError("getFeaturedProducts", error);
    return [];
  }
}

export async function getPublishedPostsPage(take = 12): Promise<{ rows: PostListRow[]; total: number; dbError: boolean }> {
  try {
    const [total, rows] = await Promise.all([
      prisma.post.count({ where: { status: PostStatus.PUBLISHED } }),
      prisma.post.findMany({
        where: { status: PostStatus.PUBLISHED },
        orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
        take,
        select: postListSelect,
      }),
    ]);
    return { rows, total, dbError: false };
  } catch (error) {
    logDbError("getPublishedPostsPage", error);
    return { rows: [], total: 0, dbError: true };
  }
}

export async function getCategoryPostsPage(
  category: PostCategory,
  take = 12
): Promise<{ rows: PostListRow[]; total: number; dbError: boolean }> {
  try {
    const [total, rows] = await Promise.all([
      prisma.post.count({ where: { status: PostStatus.PUBLISHED, category } }),
      prisma.post.findMany({
        where: { status: PostStatus.PUBLISHED, category },
        orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
        take,
        select: postListSelect,
      }),
    ]);
    return { rows, total, dbError: false };
  } catch (error) {
    logDbError("getCategoryPostsPage", error);
    return { rows: [], total: 0, dbError: true };
  }
}
