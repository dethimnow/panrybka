import { notFound } from "next/navigation";
import { PostEditorForm } from "@/components/admin/PostEditorForm";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

type Props = { params: { id: string } };

export default async function EditPostPage({ params }: Props) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      products: { include: { product: true }, orderBy: { position: "asc" } },
    },
  });
  if (!post) notFound();

  const initial = {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    status: post.status,
    featuredImage: post.featuredImage,
    author: post.author,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    metaKeywords: post.metaKeywords,
    canonicalUrl: post.canonicalUrl,
    ogTitle: post.ogTitle,
    ogDescription: post.ogDescription,
    ogImage: post.ogImage,
    schemaType: post.schemaType,
    focusKeyword: post.focusKeyword,
    products: post.products.map((pp) => ({
      productId: pp.productId,
      position: pp.position,
      isWinner: pp.isWinner,
      product: pp.product,
    })),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-forest-900">Edycja artykułu</h1>
      <PostEditorForm postId={post.id} initial={initial} />
    </div>
  );
}
