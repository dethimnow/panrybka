import { CategoryPageLayout } from "@/components/category/CategoryPageLayout";
import type { PostCardData } from "@/components/home/PostCard";
import { DatabaseStatusBanner } from "@/components/public/DatabaseStatusBanner";
import { getCategoryPostsPage } from "@/lib/posts-queries";
import { isDatabaseUrlConfigured } from "@/lib/env-db";
import { PostCategory } from "@prisma/client";

export const revalidate = 3600;
export const dynamic = "force-dynamic";

export default async function MiejscaPage() {
  const category = PostCategory.MIEJSCA;
  const configured = isDatabaseUrlConfigured();
  const { rows, total, dbError } = await getCategoryPostsPage(category, 12);

  const initialPosts: PostCardData[] = rows.map((r) => ({ ...r, publishedAt: r.publishedAt }));
  const showBanner = !configured || dbError;

  return (
    <>
      {showBanner ? (
        <DatabaseStatusBanner variant={!configured ? "missing_url" : "connection_failed"} />
      ) : null}
      <CategoryPageLayout category={category} initialPosts={initialPosts} initialHasMore={total > 12} />
    </>
  );
}
