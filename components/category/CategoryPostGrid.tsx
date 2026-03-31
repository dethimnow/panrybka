"use client";

import { useCallback, useState } from "react";
import type { PostCategory } from "@prisma/client";
import { PostCard, type PostCardData } from "@/components/home/PostCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function CategoryPostGrid({
  category,
  initialPosts,
  initialHasMore,
}: {
  category: PostCategory;
  initialPosts: PostCardData[];
  initialHasMore: boolean;
}) {
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<PostCardData[]>(initialPosts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const next = page + 1;
      const params = new URLSearchParams({ page: String(next), limit: "12", category });
      const res = await fetch(`/api/posts?${params}`);
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { items: PostCardData[]; hasMore: boolean };
      setPosts((prev) => {
        const ids = new Set(prev.map((p) => p.slug));
        const merged = [...prev];
        for (const item of data.items) {
          if (!ids.has(item.slug)) merged.push(item);
        }
        return merged;
      });
      setHasMore(data.hasMore);
      setPage(next);
    } finally {
      setLoadingMore(false);
    }
  }, [category, page]);

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
      {loadingMore ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border">
              <Skeleton className="aspect-video w-full" />
              <div className="space-y-2 p-5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {hasMore ? (
        <div className="mt-10 flex justify-center">
          <Button type="button" size="lg" variant="secondary" disabled={loadingMore} onClick={() => void loadMore()}>
            {loadingMore ? "Ładowanie…" : "Pokaż więcej"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
