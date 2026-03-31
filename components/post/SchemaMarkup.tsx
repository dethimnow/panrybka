import type { Post, Product } from "@prisma/client";
import { getSiteUrl } from "@/lib/site";

type PostWithProducts = Post & {
  products: { position: number; isWinner: boolean; product: Product }[];
};

export function SchemaMarkup({
  post,
  categoryPath,
}: {
  post: PostWithProducts;
  categoryPath: string;
}) {
  const base = getSiteUrl();
  const url = `${base}/${categoryPath}/${post.slug}`;
  const catName =
    post.category === "SPRZET" ? "Sprzęt Wędkarski" : post.category === "PORADNIK" ? "Poradniki" : "Miejsca";

  const graph: Record<string, unknown>[] = [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Strona główna", item: base },
        { "@type": "ListItem", position: 2, name: catName, item: `${base}/${categoryPath}` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
    {
      "@type": post.schemaType === "HowTo" ? "HowTo" : post.schemaType === "Review" ? "Review" : "Article",
      headline: post.title,
      description: post.metaDescription || post.excerpt,
      image: post.ogImage || post.featuredImage || `${base}/og-default.jpg`,
      datePublished: post.publishedAt?.toISOString(),
      dateModified: post.updatedAt.toISOString(),
      author: { "@type": "Organization", name: post.author },
      publisher: { "@type": "Organization", name: "PanRybka.pl", url: base },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
    },
  ];

  for (const { product } of post.products) {
    graph.push({
      "@type": "Product",
      name: product.name,
      image: product.imageUrl,
      description: product.description.replace(/<[^>]+>/g, "").slice(0, 500),
      brand: { "@type": "Brand", name: product.brand },
      offers: {
        "@type": "Offer",
        url: product.affiliateUrl,
        priceCurrency: "PLN",
        price: product.price ?? undefined,
        availability: "https://schema.org/InStock",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        bestRating: 10,
        worstRating: 0,
        ratingCount: 1,
      },
    });
  }

  if (post.products.length > 1) {
    graph.push({
      "@type": "ItemList",
      name: `Porównanie: ${post.title}`,
      itemListElement: post.products.map((pp, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: pp.product.name,
        url: pp.product.affiliateUrl,
      })),
    });
  }

  const payload = { "@context": "https://schema.org", "@graph": graph };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }} />
  );
}

export function HomeSchemaMarkup() {
  const base = getSiteUrl();
  const payload = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "PanRybka.pl",
    url: base,
    potentialAction: {
      "@type": "SearchAction",
      target: `${base}/api/posts?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }} />;
}
