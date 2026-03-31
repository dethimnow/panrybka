import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { revalidateProductPaths } from "@/lib/revalidate-post";

type Ctx = { params: { id: string } };

export async function GET(_request: Request, context: Ctx) {
  try {
    const { id } = context.params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
    }
    return NextResponse.json(product);
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
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const data: Record<string, unknown> = {};

    if (body.name != null) data.name = String(body.name).trim();
    if (body.slug != null) {
      const newSlug = String(body.slug)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      if (newSlug && newSlug !== existing.slug) {
        const clash = await prisma.product.findUnique({ where: { slug: newSlug } });
        if (clash) {
          return NextResponse.json({ error: "Slug jest już zajęty" }, { status: 409 });
        }
        data.slug = newSlug;
      }
    }
    if (body.brand != null) data.brand = String(body.brand);
    if (body.category != null) data.category = String(body.category);
    if (body.description != null) data.description = String(body.description);
    if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl ? String(body.imageUrl) : null;
    if (body.affiliateUrl != null) {
      const u = String(body.affiliateUrl).trim();
      if (!u.startsWith("http")) {
        return NextResponse.json({ error: "Nieprawidłowy URL" }, { status: 400 });
      }
      data.affiliateUrl = u;
    }
    if (body.affiliateNetwork != null) data.affiliateNetwork = String(body.affiliateNetwork);
    if (body.price !== undefined) {
      data.price = body.price != null && body.price !== "" ? Number(body.price) : null;
      data.priceUpdatedAt = data.price != null ? new Date() : null;
    }
    if (body.rating != null) data.rating = Number(body.rating);
    if (body.pros != null) data.pros = Array.isArray(body.pros) ? (body.pros as string[]).map(String) : [];
    if (body.cons != null) data.cons = Array.isArray(body.cons) ? (body.cons as string[]).map(String) : [];
    if (body.specs != null) data.specs = body.specs as Prisma.InputJsonValue;

    const product = await prisma.product.update({
      where: { id },
      data: data as Parameters<typeof prisma.product.update>[0]["data"],
    });

    revalidateProductPaths();
    return NextResponse.json(product);
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
    await prisma.product.delete({ where: { id } });
    revalidateProductPaths();
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Nie udało się usunąć" }, { status: 500 });
  }
}
