import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { PostStatus } from "@prisma/client";
import { categoryToPath } from "@/lib/categories";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const posts = await prisma.post.findMany({
    where: { status: PostStatus.PUBLISHED },
    select: { slug: true, category: true, updatedAt: true },
  });

  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/sprzet-wedkarski`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/poradniki`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/miejsca`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    ...posts.map((p) => ({
      url: `${base}/${categoryToPath(p.category)}/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
