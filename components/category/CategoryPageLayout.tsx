import type { PostCategory } from "@prisma/client";
import { CategoryPostGrid } from "@/components/category/CategoryPostGrid";
import { PostSidebar } from "@/components/post/PostSidebar";
import type { PostCardData } from "@/components/home/PostCard";
import { getFeaturedProducts, getPopularFocusKeywords, getPublishedPostsByCategory } from "@/lib/posts-queries";
import { CATEGORY_LABEL } from "@/lib/categories";

const descriptions: Record<PostCategory, string> = {
  SPRZET:
    "Recenzje kołowrotków, wędek i akcesoriów — testy w warunkach polowych, tabele porównawcze i rekomendacje pod Twój styl łowienia.",
  PORADNIK: "Metody, zestawy i taktyki — od boilie po spławik. Praktyczne poradniki dla karpiarzy i spinningistów.",
  MIEJSCA: "Gdzie łowić na Mazowszu i w całej Polsce — dojazd, regulaminy i miejscówki, które warto odwiedzić.",
};

export async function CategoryPageLayout({
  category,
  initialPosts,
  initialHasMore,
}: {
  category: PostCategory;
  initialPosts: PostCardData[];
  initialHasMore: boolean;
}) {
  const [recommended, tags, products] = await Promise.all([
    getPublishedPostsByCategory(category, 8),
    getPopularFocusKeywords(8),
    getFeaturedProducts(4),
  ]);

  return (
    <>
      <section
        className={`bg-gradient-to-br px-4 py-16 text-white ${
          category === "SPRZET"
            ? "from-forest-900 to-forest-700"
            : category === "PORADNIK"
              ? "from-water-900 to-water-600"
              : "from-amber-900 to-amber-600"
        }`}
      >
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{CATEGORY_LABEL[category]}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">{descriptions[category]}</p>
        </div>
      </section>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1fr_280px]">
        <CategoryPostGrid category={category} initialPosts={initialPosts} initialHasMore={initialHasMore} />
        <PostSidebar currentSlug="" recommended={recommended} tags={tags} products={products} />
      </div>
    </>
  );
}
