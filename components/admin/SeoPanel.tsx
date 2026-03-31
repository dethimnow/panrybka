"use client";

import type { PostCategory, SchemaType } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SerpPreview } from "@/components/admin/SerpPreview";
import { cn } from "@/lib/utils";
import { getSiteUrl } from "@/lib/site";
import { categoryToPath } from "@/lib/categories";

function titleBarClass(len: number) {
  if (len <= 60) return "bg-forest-500";
  if (len <= 70) return "bg-amber-400";
  return "bg-red-500";
}

function descBarClass(len: number) {
  if (len <= 160) return "bg-forest-500";
  if (len <= 180) return "bg-amber-400";
  return "bg-red-500";
}

export function SeoPanel({
  slug,
  category,
  metaTitle,
  metaDescription,
  metaKeywords,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage,
  schemaType,
  focusKeyword,
  onChange,
}: {
  slug: string;
  category: PostCategory;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  schemaType: SchemaType;
  focusKeyword: string;
  onChange: (field: string, value: string) => void;
}) {
  const defaultCanonical = `${getSiteUrl()}/${categoryToPath(category)}/${slug || "slug"}`;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="metaTitle">Meta title</Label>
          <span className="text-xs text-gray-500">{metaTitle.length} znaków</span>
        </div>
        <Input
          id="metaTitle"
          value={metaTitle}
          onChange={(e) => onChange("metaTitle", e.target.value)}
          maxLength={120}
        />
        <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
          <div className={cn("h-full transition-all", titleBarClass(metaTitle.length))} style={{ width: `${Math.min(100, (metaTitle.length / 70) * 100)}%` }} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="metaDescription">Meta description</Label>
          <span className="text-xs text-gray-500">{metaDescription.length} znaków</span>
        </div>
        <Textarea
          id="metaDescription"
          value={metaDescription}
          onChange={(e) => onChange("metaDescription", e.target.value)}
          maxLength={220}
          rows={4}
        />
        <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className={cn("h-full transition-all", descBarClass(metaDescription.length))}
            style={{ width: `${Math.min(100, (metaDescription.length / 200) * 100)}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="metaKeywords">Słowa kluczowe (oddziel przecinkiem)</Label>
        <Input id="metaKeywords" value={metaKeywords} onChange={(e) => onChange("metaKeywords", e.target.value)} placeholder="karp, boilie, zestaw" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="canonicalUrl">Canonical URL</Label>
        <Input
          id="canonicalUrl"
          value={canonicalUrl || defaultCanonical}
          onChange={(e) => onChange("canonicalUrl", e.target.value)}
        />
        <p className="text-xs text-gray-500">Domyślnie: {defaultCanonical}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ogTitle">OG Title</Label>
        <Input id="ogTitle" value={ogTitle} onChange={(e) => onChange("ogTitle", e.target.value)} placeholder="Zostaw puste = użyj Meta Title" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ogDescription">OG Description</Label>
        <Textarea
          id="ogDescription"
          value={ogDescription}
          onChange={(e) => onChange("ogDescription", e.target.value)}
          placeholder="Zostaw puste = użyj Meta Description"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ogImage">OG Image (URL)</Label>
        <Input id="ogImage" value={ogImage} onChange={(e) => onChange("ogImage", e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Schema type</Label>
        <Select value={schemaType} onValueChange={(v) => onChange("schemaType", v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Article">Article</SelectItem>
            <SelectItem value="HowTo">HowTo</SelectItem>
            <SelectItem value="Review">Review</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="focusKeyword">Focus keyword</Label>
        <Input id="focusKeyword" value={focusKeyword} onChange={(e) => onChange("focusKeyword", e.target.value)} />
      </div>

      <SerpPreview slug={slug} category={category} metaTitle={metaTitle} metaDescription={metaDescription} />
    </div>
  );
}
