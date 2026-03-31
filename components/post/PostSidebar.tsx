import Link from "next/link";
import type { PostCategory } from "@prisma/client";
import { TableOfContents } from "@/components/post/TableOfContents";
import { postPublicPath } from "@/lib/categories";
import type { Product } from "@prisma/client";
import Image from "next/image";

type Rec = { title: string; slug: string; excerpt: string; category: PostCategory };

export function PostSidebar({
  currentSlug,
  recommended,
  tags,
  products,
}: {
  currentSlug: string;
  recommended: Rec[];
  tags: string[];
  products: Product[];
}) {
  const filtered = recommended.filter((p) => p.slug !== currentSlug).slice(0, 4);

  return (
    <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
      <TableOfContents />
      {tags.length > 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-forest-900">Popularne tematy</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                {t}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      {filtered.length > 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-forest-900">Z tej kategorii</p>
          <ul className="space-y-3 text-sm">
            {filtered.map((p) => (
              <li key={p.slug}>
                <Link href={postPublicPath(p.category, p.slug)} className="font-medium text-water-700 hover:underline">
                  {p.title}
                </Link>
                <p className="mt-1 line-clamp-2 text-xs text-gray-500">{p.excerpt}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {products.length > 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-forest-900">Polecane produkty</p>
          <ul className="space-y-4">
            {products.map((pr) => (
              <li key={pr.id} className="flex gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {pr.imageUrl ? (
                    <Image src={pr.imageUrl} alt="" fill className="object-cover" sizes="56px" loading="lazy" />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{pr.name}</p>
                  <a
                    href={pr.affiliateUrl}
                    rel="nofollow sponsored noopener"
                    target="_blank"
                    className="text-xs text-water-600 hover:underline"
                  >
                    Zobacz ofertę
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}
