"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import type { PostCategory, PostStatus, Product, SchemaType } from "@prisma/client";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { SeoPanel } from "@/components/admin/SeoPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { categoryToPath, postPublicPath } from "@/lib/categories";
import { getSiteUrl } from "@/lib/site";
import { POST_CONTENT_SPLIT_MARKER } from "@/lib/post-content";

function slugifyTitle(title: string): string {
  const map: Record<string, string> = {
    ą: "a",
    ć: "c",
    ę: "e",
    ł: "l",
    ń: "n",
    ó: "o",
    ś: "s",
    ź: "z",
    ż: "z",
  };
  return title
    .toLowerCase()
    .split("")
    .map((c) => map[c] ?? c)
    .join("")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

type Assignment = { productId: string; position: number; isWinner: boolean; product?: Product };

export function PostEditorForm({
  postId,
  initial,
}: {
  postId: string | null;
  initial: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: PostCategory;
    status: PostStatus;
    featuredImage: string | null;
    author: string;
    metaTitle: string | null;
    metaDescription: string | null;
    metaKeywords: string | null;
    canonicalUrl: string | null;
    ogTitle: string | null;
    ogDescription: string | null;
    ogImage: string | null;
    schemaType: SchemaType;
    focusKeyword: string | null;
    products: Assignment[];
  };
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [slugManual, setSlugManual] = useState(!!initial.slug && postId !== null);
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [content, setContent] = useState(initial.content);
  const [category, setCategory] = useState<PostCategory>(initial.category);
  const [status, setStatus] = useState<PostStatus>(initial.status);
  const [featuredImage, setFeaturedImage] = useState(initial.featuredImage ?? "");
  const [author, setAuthor] = useState(initial.author);
  const [metaTitle, setMetaTitle] = useState(initial.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(initial.metaDescription ?? "");
  const [metaKeywords, setMetaKeywords] = useState(initial.metaKeywords ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(initial.canonicalUrl ?? "");
  const [ogTitle, setOgTitle] = useState(initial.ogTitle ?? "");
  const [ogDescription, setOgDescription] = useState(initial.ogDescription ?? "");
  const [ogImage, setOgImage] = useState(initial.ogImage ?? "");
  const [schemaType, setSchemaType] = useState<SchemaType>(initial.schemaType);
  const [focusKeyword, setFocusKeyword] = useState(initial.focusKeyword ?? "");
  const [assignments, setAssignments] = useState<Assignment[]>(
    initial.products.map((p, i) => ({ ...p, position: p.position ?? i }))
  );
  const [saving, setSaving] = useState(false);
  const [productQuery, setProductQuery] = useState("");
  const [productHits, setProductHits] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (slugManual) return;
    setSlug(slugifyTitle(title));
  }, [title, slugManual]);

  const seoChange = useCallback((field: string, value: string) => {
    if (field === "metaTitle") setMetaTitle(value);
    else if (field === "metaDescription") setMetaDescription(value);
    else if (field === "metaKeywords") setMetaKeywords(value);
    else if (field === "canonicalUrl") setCanonicalUrl(value);
    else if (field === "ogTitle") setOgTitle(value);
    else if (field === "ogDescription") setOgDescription(value);
    else if (field === "ogImage") setOgImage(value);
    else if (field === "schemaType") setSchemaType(value as SchemaType);
    else if (field === "focusKeyword") setFocusKeyword(value);
  }, []);

  const fetchProducts = useCallback(async (q: string) => {
    setLoadingProducts(true);
    try {
      const res = await fetch(`/api/products?q=${encodeURIComponent(q)}&limit=30`);
      if (!res.ok) return;
      const data = (await res.json()) as { items: Product[] };
      setProductHits(data.items);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => void fetchProducts(productQuery), 300);
    return () => clearTimeout(t);
  }, [productQuery, fetchProducts]);

  const addProduct = (p: Product) => {
    if (assignments.some((a) => a.productId === p.id)) return;
    setAssignments((prev) => [...prev, { productId: p.id, position: prev.length, isWinner: false, product: p }]);
  };

  const removeProduct = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.productId !== id).map((a, i) => ({ ...a, position: i })));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(assignments);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setAssignments(items.map((a, i) => ({ ...a, position: i })));
  };

  const uploadFeatured = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("slug", slug || "featured");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) return;
    const { url } = (await res.json()) as { url: string };
    setFeaturedImage(url);
  };

  const payload = useMemo(
    () => ({
      title,
      slug,
      excerpt,
      content,
      category,
      status,
      featuredImage: featuredImage || null,
      author,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      metaKeywords: metaKeywords || null,
      canonicalUrl: canonicalUrl || null,
      ogTitle: ogTitle || null,
      ogDescription: ogDescription || null,
      ogImage: ogImage || null,
      schemaType,
      focusKeyword: focusKeyword || null,
      productAssignments: assignments.map((a, i) => ({
        productId: a.productId,
        position: i,
        isWinner: a.isWinner,
      })),
    }),
    [
      title,
      slug,
      excerpt,
      content,
      category,
      status,
      featuredImage,
      author,
      metaTitle,
      metaDescription,
      metaKeywords,
      canonicalUrl,
      ogTitle,
      ogDescription,
      ogImage,
      schemaType,
      focusKeyword,
      assignments,
    ]
  );

  const save = async () => {
    setSaving(true);
    try {
      if (postId) {
        const res = await fetch(`/api/posts/${postId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = (await res.json()) as { error?: string };
          alert(err.error ?? "Błąd zapisu");
          return;
        }
        router.refresh();
      } else {
        const { productAssignments: pa, ...createBody } = payload;
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...createBody,
            productIds: pa.map((a) => ({
              productId: a.productId,
              position: a.position,
              isWinner: a.isWinner,
            })),
          }),
        });
        if (!res.ok) {
          const err = (await res.json()) as { error?: string };
          alert(err.error ?? "Błąd tworzenia");
          return;
        }
        const created = (await res.json()) as { id: string };
        router.push(`/admin/posts/${created.id}/edit`);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const previewUrl = `${getSiteUrl()}${postPublicPath(category, slug || "draft")}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={() => void save()} disabled={saving}>
          {saving ? "Zapisywanie…" : "Zapisz"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!postId || status !== "PUBLISHED"}
          onClick={() => window.open(previewUrl, "_blank", "noopener,noreferrer")}
        >
          Podgląd
        </Button>
      </div>

      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Treść</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="products">Produkty</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Tytuł</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="slug">Slug</Label>
              <label className="flex items-center gap-1 text-xs text-gray-600">
                <Checkbox checked={slugManual} onCheckedChange={(c) => setSlugManual(c === true)} />
                Edycja ręczna
              </label>
            </div>
            <Input id="slug" value={slug} onChange={(e) => { setSlugManual(true); setSlug(e.target.value); }} />
            <p className="text-xs text-gray-500">
              URL: {getSiteUrl()}/{categoryToPath(category)}/{slug || "…"}
            </p>
          </div>
          <div className="space-y-2">
            <Label>Kategoria</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as PostCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SPRZET">Sprzęt Wędkarski</SelectItem>
                <SelectItem value="PORADNIK">Poradniki</SelectItem>
                <SelectItem value="MIEJSCA">Miejsca</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="excerpt">Skrót (max 160)</Label>
              <span className="text-xs text-gray-500">{excerpt.length}/160</span>
            </div>
            <Textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value.slice(0, 160))} rows={3} maxLength={160} />
          </div>
          <div className="space-y-2">
            <Label>Zdjęcie główne</Label>
            {featuredImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={featuredImage} alt="" className="mb-2 max-h-40 rounded-lg border object-cover" />
            ) : null}
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadFeatured(f);
              }}
            />
            <Input value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} placeholder="lub wklej URL" />
          </div>
          {category === "SPRZET" ? (
            <p className="rounded-lg bg-forest-50 p-3 text-sm text-forest-900">
              Aby rozdzielić wstęp i zakończenie (z sekcją produktów pomiędzy), wstaw w edytorze marker:{" "}
              <code className="rounded bg-white px-1">{POST_CONTENT_SPLIT_MARKER}</code>
            </p>
          ) : null}
          <div className="space-y-2">
            <Label>Treść</Label>
            <RichTextEditor content={content} onChange={setContent} uploadSlug={slug || "post"} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="author">Autor</Label>
            <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as PostStatus)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Szkic</SelectItem>
                <SelectItem value="PUBLISHED">Opublikowany</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="seo">
          <SeoPanel
            slug={slug}
            category={category}
            metaTitle={metaTitle}
            metaDescription={metaDescription}
            metaKeywords={metaKeywords}
            canonicalUrl={canonicalUrl}
            ogTitle={ogTitle}
            ogDescription={ogDescription}
            ogImage={ogImage}
            schemaType={schemaType}
            focusKeyword={focusKeyword}
            onChange={seoChange}
          />
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="space-y-2">
            <Label>Szukaj produktu</Label>
            <Input value={productQuery} onChange={(e) => setProductQuery(e.target.value)} placeholder="Nazwa lub marka…" />
            <p className="text-xs text-gray-500">{loadingProducts ? "Szukam…" : `${productHits.length} wyników`}</p>
            <ScrollArea className="h-40 rounded-lg border">
              <ul className="p-2 text-sm">
                {productHits.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-2 border-b border-gray-50 py-2 last:border-0">
                    <span>
                      {p.name} <span className="text-gray-500">({p.brand})</span>
                    </span>
                    <Button type="button" size="sm" variant="outline" onClick={() => addProduct(p)}>
                      Dodaj
                    </Button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
          <Separator />
          <div>
            <Label className="mb-2 block">Kolejność w artykule (przeciągnij)</Label>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="products">
                {(provided) => (
                  <ul ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                    {assignments.map((a, index) => (
                      <Draggable key={a.productId} draggableId={a.productId} index={index}>
                        {(p) => (
                          <li ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps} className="flex flex-wrap items-center gap-3 rounded-lg border bg-white p-3">
                            <span className="font-medium">{a.product?.name ?? a.productId}</span>
                            <label className="flex items-center gap-2 text-sm">
                              <Checkbox
                                checked={a.isWinner}
                                onCheckedChange={(c) =>
                                  setAssignments((prev) =>
                                    prev.map((x) => (x.productId === a.productId ? { ...x, isWinner: c === true } : x))
                                  )
                                }
                              />
                              Najlepszy wybór
                            </label>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeProduct(a.productId)}>
                              Usuń
                            </Button>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
