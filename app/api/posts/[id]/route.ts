import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PostCategory, PostStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { revalidatePostPaths } from "@/lib/revalidate-post";

type Ctx = { params: { id: string } };

export async function GET(_request: Request, context: Ctx) {
  try {
    const { id } = context.params;
    const session = await getServerSession(authOptions);
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        products: {
          include: { product: true },
          orderBy: { position: "asc" },
        },
      },
    });
    if (!post) {
      return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
    }
    if (post.status !== "PUBLISHED" && !session?.user?.id) {
      return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: Ctx) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }
    const { id } = context.params;
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const data: Record<string, unknown> = {};

    if (body.title != null) data.title = String(body.title).trim();
    if (body.slug != null) {
      const newSlug = String(body.slug)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      if (newSlug && newSlug !== existing.slug) {
        const clash = await prisma.post.findUnique({ where: { slug: newSlug } });
        if (clash) {
          return NextResponse.json({ error: "Slug jest już zajęty" }, { status: 409 });
        }
        data.slug = newSlug;
      }
    }
    if (body.excerpt != null) data.excerpt = String(body.excerpt);
    if (body.content != null) data.content = String(body.content);
    if (body.category != null) data.category = body.category as PostCategory;
    if (body.status != null) {
      data.status = body.status as PostStatus;
      if (body.status === "PUBLISHED" && !existing.publishedAt) {
        data.publishedAt = new Date();
      }
      if (body.status === "DRAFT") {
        data.publishedAt = null;
      }
    }
    if (body.featuredImage !== undefined) data.featuredImage = body.featuredImage ? String(body.featuredImage) : null;
    if (body.author != null) data.author = String(body.author);
    if (body.metaTitle !== undefined) data.metaTitle = body.metaTitle ? String(body.metaTitle) : null;
    if (body.metaDescription !== undefined) data.metaDescription = body.metaDescription ? String(body.metaDescription) : null;
    if (body.metaKeywords !== undefined) data.metaKeywords = body.metaKeywords ? String(body.metaKeywords) : null;
    if (body.canonicalUrl !== undefined) data.canonicalUrl = body.canonicalUrl ? String(body.canonicalUrl) : null;
    if (body.ogTitle !== undefined) data.ogTitle = body.ogTitle ? String(body.ogTitle) : null;
    if (body.ogDescription !== undefined) data.ogDescription = body.ogDescription ? String(body.ogDescription) : null;
    if (body.ogImage !== undefined) data.ogImage = body.ogImage ? String(body.ogImage) : null;
    if (body.schemaType != null) data.schemaType = body.schemaType;
    if (body.focusKeyword !== undefined) data.focusKeyword = body.focusKeyword ? String(body.focusKeyword) : null;

    await prisma.post.update({
      where: { id },
      data: data as Parameters<typeof prisma.post.update>[0]["data"],
    });

    if (Array.isArray(body.productAssignments)) {
      await prisma.postProduct.deleteMany({ where: { postId: id } });
      const rows = body.productAssignments as { productId: string; position: number; isWinner: boolean }[];
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        await prisma.postProduct.create({
          data: {
            postId: id,
            productId: r.productId,
            position: r.position ?? i,
            isWinner: Boolean(r.isWinner),
          },
        });
      }
    }

    const updated = await prisma.post.findUnique({
      where: { id },
      include: {
        products: { include: { product: true }, orderBy: { position: "asc" } },
      },
    });

    revalidatePostPaths(updated!.category, updated!.slug);
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Nie udało się zapisać" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Ctx) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }
    const { id } = context.params;
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
    }
    await prisma.post.delete({ where: { id } });
    revalidatePostPaths(post.category, post.slug);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Nie udało się usunąć" }, { status: 500 });
  }
}
