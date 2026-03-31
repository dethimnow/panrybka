import { HeroSection } from "@/components/home/HeroSection";
import { PostGrid } from "@/components/home/PostGrid";
import type { PostCardData } from "@/components/home/PostCard";
import { HomeSchemaMarkup } from "@/components/post/SchemaMarkup";
import { DatabaseStatusBanner } from "@/components/public/DatabaseStatusBanner";
import { getPublishedPostsPage } from "@/lib/posts-queries";
import { isDatabaseUrlConfigured } from "@/lib/env-db";

export const revalidate = 3600;
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const configured = isDatabaseUrlConfigured();
  const { rows, total, dbError } = await getPublishedPostsPage(12);

  const initialPosts: PostCardData[] = rows.map((r) => ({
    ...r,
    publishedAt: r.publishedAt,
  }));

  const showBanner = !configured || dbError;

  return (
    <>
      <HomeSchemaMarkup />
      {showBanner ? (
        <DatabaseStatusBanner variant={!configured ? "missing_url" : "connection_failed"} />
      ) : null}
      <HeroSection />
      <PostGrid initialPosts={initialPosts} initialHasMore={total > 12} />
    </>
  );
}
