import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PostCategory, PostStatus, Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { revalidatePostPaths } from "@/lib/revalidate-post";

const DEFAULT_LIMIT = 12;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT));
    const categoryParam = searchParams.get("category");
    const search = searchParams.get("search")?.trim();
    const session = await getServerSession(authOptions);

    const where: Prisma.PostWhereInput = {};

    if (!session?.user?.id) {
      where.status = "PUBLISHED";
    } else {
      const statusFilter = searchParams.get("status") as PostStatus | null;
      if (statusFilter === "DRAFT" || statusFilter === "PUBLISHED") {
        where.status = statusFilter;
      }
    }

    if (categoryParam && ["SPRZET", "PORADNIK", "MIEJSCA"].includes(categoryParam)) {
      where.category = categoryParam as PostCategory;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          content: true,
          category: true,
          status: true,
          featuredImage: true,
          author: true,
          publishedAt: true,
          updatedAt: true,
        },
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Nie udało się pobrać artykułów" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const title = String(body.title ?? "").trim();
    if (!title) {
      return NextResponse.json({ error: "Tytuł jest wymagany" }, { status: 400 });
    }

    const slug = String(body.slug ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    if (!slug) {
      return NextResponse.json({ error: "Slug jest wymagany" }, { status: 400 });
    }

    const existing = await prisma.post.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug jest już zajęty" }, { status: 409 });
    }

    const category = (body.category as PostCategory) || "PORADNIK";
    const status = (body.status as PostStatus) || "DRAFT";
    const publishedAt =
      status === "PUBLISHED" ? (body.publishedAt ? new Date(String(body.publishedAt)) : new Date()) : null;

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        excerpt: String(body.excerpt ?? ""),
        content: String(body.content ?? ""),
        category,
        status,
        featuredImage: body.featuredImage ? String(body.featuredImage) : null,
        author: String(body.author ?? "Redakcja PanRybka"),
        metaTitle: body.metaTitle != null ? String(body.metaTitle) : null,
        metaDescription: body.metaDescription != null ? String(body.metaDescription) : null,
        metaKeywords: body.metaKeywords != null ? String(body.metaKeywords) : null,
        canonicalUrl: body.canonicalUrl != null ? String(body.canonicalUrl) : null,
        ogTitle: body.ogTitle != null ? String(body.ogTitle) : null,
        ogDescription: body.ogDescription != null ? String(body.ogDescription) : null,
        ogImage: body.ogImage != null ? String(body.ogImage) : null,
        schemaType: (body.schemaType as "Article" | "HowTo" | "Review") || "Article",
        focusKeyword: body.focusKeyword != null ? String(body.focusKeyword) : null,
        publishedAt,
      },
    });

    if (body.productIds && Array.isArray(body.productIds)) {
      const ids = body.productIds as { productId: string; position: number; isWinner: boolean }[];
      if (ids.length > 0) {
        await prisma.postProduct.createMany({
          data: ids.map((row, i) => ({
            postId: post.id,
            productId: row.productId,
            position: row.position ?? i,
            isWinner: Boolean(row.isWinner),
          })),
        });
      }
    }

    if (status === "PUBLISHED") {
      revalidatePostPaths(post.category, post.slug);
    }

    return NextResponse.json(post);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Nie udało się utworzyć artykułu" }, { status: 500 });
  }
}
