import { PostEditorForm } from "@/components/admin/PostEditorForm";
import { PostCategory, PostStatus, SchemaType } from "@prisma/client";

export default function NewPostPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-forest-900">Nowy artykuł</h1>
      <PostEditorForm
        postId={null}
        initial={{
          title: "",
          slug: "",
          excerpt: "",
          content: "<p></p>",
          category: PostCategory.PORADNIK,
          status: PostStatus.DRAFT,
          featuredImage: null,
          author: "Redakcja PanRybka",
          metaTitle: null,
          metaDescription: null,
          metaKeywords: null,
          canonicalUrl: null,
          ogTitle: null,
          ogDescription: null,
          ogImage: null,
          schemaType: SchemaType.Article,
          focusKeyword: null,
          products: [],
        }}
      />
    </div>
  );
}
