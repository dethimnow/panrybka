import Image from "next/image";
import Link from "next/link";
import type { Post, PostCategory, Product } from "@prisma/client";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { PostContent } from "@/components/post/PostContent";
import { ProductReview } from "@/components/post/ProductReview";
import { ComparisonTable } from "@/components/post/ComparisonTable";
import { PostSidebar } from "@/components/post/PostSidebar";
import { SchemaMarkup } from "@/components/post/SchemaMarkup";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABEL, categoryToPath } from "@/lib/categories";
import { splitPostContent } from "@/lib/post-content";
import { estimateReadingMinutesFromHtml } from "@/lib/reading-time";
import { getFeaturedProducts, getPopularFocusKeywords, getPublishedPostsByCategory } from "@/lib/posts-queries";

type PostWithRels = Post & {
  products: { position: number; isWinner: boolean; product: Product }[];
};

function categoryBadgeVariant(c: PostCategory): "default" | "water" | "amber" {
  if (c === "SPRZET") return "default";
  if (c === "PORADNIK") return "water";
  return "amber";
}

export async function PostArticleView({ post }: { post: PostWithRels }) {
  const path = categoryToPath(post.category);

  const [recommended, tags, featuredProducts] = await Promise.all([
    getPublishedPostsByCategory(post.category, 8),
    getPopularFocusKeywords(8),
    getFeaturedProducts(4),
  ]);

  const minutes = estimateReadingMinutesFromHtml(post.content);
  const isSprzet = post.category === "SPRZET";
  const { intro, outro } = splitPostContent(post.content);

  const comparisonRows =
    isSprzet && post.products.length > 0
      ? post.products.map((pp) => ({
          ...pp.product,
          position: pp.position,
          isWinner: pp.isWinner,
        }))
      : [];

  return (
    <>
      <SchemaMarkup post={post} categoryPath={path} />
      {post.featuredImage ? (
        <div className="relative aspect-[21/9] w-full max-h-[420px] bg-forest-900">
          <Image
            src={post.featuredImage}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-900/80 to-transparent" />
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl px-4 py-8">
        <nav className="mb-6 text-sm text-gray-600" aria-label="Okruszki">
          <ol className="flex flex-wrap gap-2">
            <li>
              <Link href="/" className="hover:text-forest-600">
                Strona główna
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href={`/${path}`} className="hover:text-forest-600">
                {CATEGORY_LABEL[post.category]}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-gray-900">{post.title}</li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
          <article>
            <header className="mb-8">
              <h1 className="text-balance text-3xl font-bold tracking-tight text-forest-950 md:text-4xl">{post.title}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                {post.publishedAt ? (
                  <time dateTime={post.publishedAt.toISOString()}>
                    {format(post.publishedAt, "d MMMM yyyy", { locale: pl })}
                  </time>
                ) : null}
                <span aria-hidden>·</span>
                <span>{post.author}</span>
                <span aria-hidden>·</span>
                <span>{minutes} min czytania</span>
                <span aria-hidden>·</span>
                <Badge variant={categoryBadgeVariant(post.category)}>{CATEGORY_LABEL[post.category]}</Badge>
              </div>
            </header>

            {isSprzet ? (
              <>
                <PostContent html={intro} />
                {post.products.length > 0 ? (
                  <section className="my-12 border-t border-gray-100 pt-10">
                    <h2 className="mb-8 text-2xl font-bold text-forest-900">Recenzje produktów</h2>
                    <div className="space-y-10">
                      {post.products.map((pp, idx) => (
                        <ProductReview key={pp.product.id} product={pp.product} index={idx} isWinner={pp.isWinner} />
                      ))}
                    </div>
                  </section>
                ) : null}
                {comparisonRows.length > 1 ? (
                  <section className="my-12 border-t border-gray-100 pt-10">
                    <h2 className="mb-6 text-2xl font-bold text-forest-900">Tabela porównawcza</h2>
                    <ComparisonTable products={comparisonRows} />
                  </section>
                ) : null}
                {outro ? <PostContent html={outro} /> : null}
              </>
            ) : (
              <PostContent html={post.content} />
            )}
          </article>

          <PostSidebar currentSlug={post.slug} recommended={recommended} tags={tags} products={featuredProducts} />
        </div>
      </div>
    </>
  );
}
