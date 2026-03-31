import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PostArticleView } from "@/components/post/PostArticleView";
import { ArticleDbError } from "@/components/public/ArticleDbError";
import { categoryToPath } from "@/lib/categories";
import { buildPostMetadata } from "@/lib/metadata-post";
import { loadPublishedPostBySlug } from "@/lib/posts-queries";
import { PostCategory } from "@prisma/client";

export const revalidate = 3600;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await loadPublishedPostBySlug(params.slug);
  if (r.status === "db_error") return { title: "Artykuł | PanRybka.pl" };
  if (r.status !== "ok" || r.post.category !== PostCategory.PORADNIK) {
    return { title: "Artykuł" };
  }
  return buildPostMetadata(r.post);
}

export default async function PoradnikArticlePage({ params }: Props) {
  const r = await loadPublishedPostBySlug(params.slug);
  if (r.status === "db_error") return <ArticleDbError />;
  if (r.status !== "ok" || r.post.category !== PostCategory.PORADNIK || categoryToPath(r.post.category) !== "poradniki") {
    notFound();
  }
  return <PostArticleView post={r.post} />;
}
