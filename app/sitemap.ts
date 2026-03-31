import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { PostStatus } from "@prisma/client";
import { categoryToPath } from "@/lib/categories";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const staticEntries: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/sprzet-wedkarski`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/poradniki`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/miejsca`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  try {
    const posts = await prisma.post.findMany({
      where: { status: PostStatus.PUBLISHED },
      select: { slug: true, category: true, updatedAt: true },
    });
    return [
      ...staticEntries,
      ...posts.map((p) => ({
        url: `${base}/${categoryToPath(p.category)}/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
  } catch (e) {
    console.error("[sitemap]", e);
    return staticEntries;
  }
}
