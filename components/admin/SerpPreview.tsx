"use client";

import type { PostCategory } from "@prisma/client";
import { getSiteUrl } from "@/lib/site";
import { categoryToPath } from "@/lib/categories";

export function SerpPreview({
  slug,
  category,
  metaTitle,
  metaDescription,
}: {
  slug: string;
  category: PostCategory;
  metaTitle: string;
  metaDescription: string;
}) {
  const base = getSiteUrl().replace(/^https?:\/\//, "");
  const path = categoryToPath(category);
  const displayTitle = metaTitle.slice(0, 60) + (metaTitle.length > 60 ? "…" : "");
  const displayDesc = metaDescription.slice(0, 160) + (metaDescription.length > 160 ? "…" : "");

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-500">
        {base} › {path} › {slug || "…"}
      </p>
      <p className="mt-1 text-lg font-medium text-blue-800">{displayTitle || "Tytuł w wynikach"}</p>
      <p className="mt-1 line-clamp-2 text-sm text-gray-600">{displayDesc || "Opis meta — pojawi się pod tytułem w Google."}</p>
    </div>
  );
}
