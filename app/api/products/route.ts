import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { revalidateProductPaths } from "@/lib/revalidate-post";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20));
    const q = searchParams.get("q")?.trim();
    const category = searchParams.get("category")?.trim();

    const where: Prisma.ProductWhereInput = {};
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
      ];
    }
    if (category) {
      where.category = { contains: category, mode: "insensitive" };
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({ items, total, page, limit, hasMore: page * limit < total });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Nie udało się pobrać produktów" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const name = String(body.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ error: "Nazwa jest wymagana" }, { status: 400 });
    }

    const slug = String(body.slug ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    if (!slug) {
      return NextResponse.json({ error: "Slug jest wymagany" }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug jest już zajęty" }, { status: 409 });
    }

    const affiliateUrl = String(body.affiliateUrl ?? "").trim();
    if (!affiliateUrl || !affiliateUrl.startsWith("http")) {
      return NextResponse.json({ error: "Poprawny link afiliacyjny jest wymagany" }, { status: 400 });
    }

    const specs = body.specs;
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        brand: String(body.brand ?? ""),
        category: String(body.category ?? ""),
        description: String(body.description ?? ""),
        imageUrl: body.imageUrl ? String(body.imageUrl) : null,
        affiliateUrl,
        affiliateNetwork: String(body.affiliateNetwork ?? "Amazon"),
        price: body.price != null && body.price !== "" ? Number(body.price) : null,
        priceUpdatedAt: body.price != null && body.price !== "" ? new Date() : null,
        rating: body.rating != null ? Number(body.rating) : 0,
        pros: Array.isArray(body.pros) ? (body.pros as string[]).map(String) : [],
        cons: Array.isArray(body.cons) ? (body.cons as string[]).map(String) : [],
        specs: specs && typeof specs === "object" ? (specs as Prisma.InputJsonValue) : {},
      },
    });

    revalidateProductPaths();
    return NextResponse.json(product);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Nie udało się utworzyć produktu" }, { status: 500 });
  }
}
