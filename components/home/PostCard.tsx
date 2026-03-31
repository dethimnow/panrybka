import Image from "next/image";
import Link from "next/link";
import type { PostCategory } from "@prisma/client";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABEL, postPublicPath } from "@/lib/categories";
import { estimateReadingMinutesFromHtml } from "@/lib/reading-time";

export type PostCardData = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: PostCategory;
  featuredImage: string | null;
  publishedAt: Date | null;
};

function categoryBadgeVariant(c: PostCategory): "default" | "water" | "amber" {
  if (c === "SPRZET") return "default";
  if (c === "PORADNIK") return "water";
  return "amber";
}

export function PostCard({ post }: { post: PostCardData }) {
  const href = postPublicPath(post.category, post.slug);
  const minutes = estimateReadingMinutesFromHtml(post.content);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link href={href} className="relative aspect-video block overflow-hidden bg-gray-100">
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt=""
            fill
            className="object-cover transition-transform group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">PanRybka</div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <Badge variant={categoryBadgeVariant(post.category)} className="mb-3 w-fit">
          {CATEGORY_LABEL[post.category]}
        </Badge>
        <Link href={href}>
          <h2 className="line-clamp-2 text-lg font-semibold tracking-tight text-gray-900 group-hover:text-forest-700">
            {post.title}
          </h2>
        </Link>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-gray-600">{post.excerpt}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          {post.publishedAt ? <time dateTime={post.publishedAt.toISOString()}>{format(post.publishedAt, "d MMM yyyy", { locale: pl })}</time> : null}
          <span>·</span>
          <span>{minutes} min</span>
        </div>
        <Link href={href} className="mt-4 inline-flex text-sm font-medium text-water-600 hover:underline">
          Czytaj więcej →
        </Link>
      </div>
    </article>
  );
}
