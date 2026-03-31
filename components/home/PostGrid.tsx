"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PostCategory } from "@prisma/client";
import { PostCard, type PostCardData } from "@/components/home/PostCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Filter = "ALL" | PostCategory;

export function PostGrid({ initialPosts, initialHasMore }: { initialPosts: PostCardData[]; initialHasMore: boolean }) {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<PostCardData[]>(initialPosts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const filtered = useMemo(() => {
    if (filter === "ALL") return posts;
    return posts.filter((p) => p.category === filter);
  }, [posts, filter]);

  const resetFromServer = useCallback(async (cat: Filter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: "1", limit: "12" });
      if (cat !== "ALL") params.set("category", cat);
      const res = await fetch(`/api/posts?${params}`);
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { items: PostCardData[]; hasMore: boolean };
      setPosts(data.items);
      setHasMore(data.hasMore);
      setPage(1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (filter === "ALL") {
      setPosts(initialPosts);
      setHasMore(initialHasMore);
      setPage(1);
      return;
    }
    void resetFromServer(filter);
  }, [filter, initialPosts, initialHasMore, resetFromServer]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const params = new URLSearchParams({ page: String(nextPage), limit: "12" });
      if (filter !== "ALL") params.set("category", filter);
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
      setPage(nextPage);
    } finally {
      setLoadingMore(false);
    }
  };

  const filters: { key: Filter; label: string }[] = [
    { key: "ALL", label: "Wszystkie" },
    { key: "SPRZET", label: "Sprzęt" },
    { key: "PORADNIK", label: "Poradniki" },
    { key: "MIEJSCA", label: "Miejsca" },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-center text-3xl font-bold tracking-tight text-forest-900">Najnowsze artykuły</h2>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {filters.map((f) => (
          <Button
            key={f.key}
            type="button"
            variant={filter === f.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.key)}
            className={filter === f.key ? "" : "border-gray-300"}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
              <Skeleton className="aspect-video w-full rounded-none" />
              <div className="space-y-2 p-5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}

      {!loading && hasMore && filter === "ALL" ? (
        <div className="mt-12 flex justify-center">
          <Button type="button" size="lg" variant="secondary" disabled={loadingMore} onClick={() => void loadMore()}>
            {loadingMore ? "Ładowanie…" : "Pokaż więcej"}
          </Button>
        </div>
      ) : null}

      {!loading && filter !== "ALL" && hasMore ? (
        <div className="mt-12 flex justify-center">
          <Button type="button" size="lg" variant="secondary" disabled={loadingMore} onClick={() => void loadMore()}>
            {loadingMore ? "Ładowanie…" : "Pokaż więcej"}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
