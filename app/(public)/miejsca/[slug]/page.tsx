import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PostArticleView } from "@/components/post/PostArticleView";
import { categoryToPath } from "@/lib/categories";
import { buildPostMetadata } from "@/lib/metadata-post";
import { getPublishedPostBySlug } from "@/lib/posts-queries";
import { PostCategory } from "@prisma/client";

export const revalidate = 3600;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPublishedPostBySlug(params.slug);
  if (!post || post.category !== PostCategory.MIEJSCA) {
    return { title: "Artykuł" };
  }
  return buildPostMetadata(post);
}

export default async function MiejsceArticlePage({ params }: Props) {
  const post = await getPublishedPostBySlug(params.slug);
  if (!post || post.category !== PostCategory.MIEJSCA || categoryToPath(post.category) !== "miejsca") {
    notFound();
  }
  return <PostArticleView post={post} />;
}
