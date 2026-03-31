import type { Metadata } from "next";
import type { Post } from "@prisma/client";
import { categoryToPath } from "@/lib/categories";
import { defaultOgImageUrl, getSiteUrl } from "@/lib/site";

export function buildPostMetadata(post: Post): Metadata {
  const path = categoryToPath(post.category);
  const base = getSiteUrl();
  const canonical = post.canonicalUrl || `${base}/${path}/${post.slug}`;
  const og = post.ogImage || post.featuredImage || defaultOgImageUrl();

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    keywords: post.metaKeywords ?? undefined,
    alternates: { canonical },
    openGraph: {
      title: post.ogTitle || post.metaTitle || post.title,
      description: post.ogDescription || post.metaDescription || post.excerpt,
      images: [og],
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title: post.ogTitle || post.title,
      description: post.ogDescription || post.excerpt,
      images: [og],
    },
  };
}
