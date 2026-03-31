"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { StarRating } from "@/components/post/StarRating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function slugify(name: string): string {
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
  return name
    .toLowerCase()
    .split("")
    .map((c) => map[c] ?? c)
    .join("")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

type SpecRow = { key: string; value: string };

export function ProductForm({
  productId,
  initial,
}: {
  productId: string | null;
  initial: {
    name: string;
    slug: string;
    brand: string;
    category: string;
    description: string;
    imageUrl: string | null;
    affiliateUrl: string;
    affiliateNetwork: string;
    price: number | null;
    rating: number;
    pros: string[];
    cons: string[];
    specs: Record<string, string>;
  };
}) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [slug, setSlug] = useState(initial.slug);
  const [slugManual, setSlugManual] = useState(!!productId);
  const [brand, setBrand] = useState(initial.brand);
  const [category, setCategory] = useState(initial.category);
  const [description, setDescription] = useState(initial.description);
  const [imageUrl, setImageUrl] = useState(initial.imageUrl ?? "");
  const [affiliateUrl, setAffiliateUrl] = useState(initial.affiliateUrl);
  const [affiliateNetwork, setAffiliateNetwork] = useState(initial.affiliateNetwork);
  const [price, setPrice] = useState(initial.price != null ? String(initial.price) : "");
  const [rating, setRating] = useState(initial.rating);
  const [pros, setPros] = useState<string[]>(initial.pros.length ? initial.pros : [""]);
  const [cons, setCons] = useState<string[]>(initial.cons.length ? initial.cons : [""]);
  const [specRows, setSpecRows] = useState<SpecRow[]>(() => {
    const e = Object.entries(initial.specs);
    return e.length ? e.map(([key, value]) => ({ key, value: String(value) })) : [{ key: "", value: "" }];
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (slugManual) return;
    setSlug(slugify(name));
  }, [name, slugManual]);

  const specsObject = useMemo(() => {
    const o: Record<string, string> = {};
    for (const r of specRows) {
      if (r.key.trim()) o[r.key.trim()] = r.value.trim();
    }
    return o;
  }, [specRows]);

  const uploadImage = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("slug", slug || "product");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) return;
    const { url } = (await res.json()) as { url: string };
    setImageUrl(url);
  };

  const save = async () => {
    setSaving(true);
    try {
      const body = {
        name,
        slug: slug || slugify(name),
        brand,
        category,
        description,
        imageUrl: imageUrl || null,
        affiliateUrl,
        affiliateNetwork,
        price: price === "" ? null : Number(price),
        rating,
        pros: pros.map((p) => p.trim()).filter(Boolean),
        cons: cons.map((c) => c.trim()).filter(Boolean),
        specs: specsObject,
      };
      if (productId) {
        const res = await fetch(`/api/products/${productId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const err = (await res.json()) as { error?: string };
          alert(err.error ?? "Błąd");
          return;
        }
        router.refresh();
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const err = (await res.json()) as { error?: string };
          alert(err.error ?? "Błąd");
          return;
        }
        const created = (await res.json()) as { id: string };
        router.push(`/admin/products/${created.id}/edit`);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="pname">Nazwa</Label>
        <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="pslug">Slug</Label>
          <label className="flex items-center gap-1 text-xs text-gray-600">
            <input type="checkbox" checked={slugManual} onChange={(e) => setSlugManual(e.target.checked)} />
            Ręcznie
          </label>
        </div>
        <Input id="pslug" value={slug} onChange={(e) => { setSlugManual(true); setSlug(e.target.value); }} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="pbrand">Marka</Label>
          <Input id="pbrand" value={brand} onChange={(e) => setBrand(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pcat">Kategoria produktu</Label>
          <Input id="pcat" value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Opis</Label>
        <RichTextEditor content={description} onChange={setDescription} uploadSlug={slug || "product"} />
      </div>
      <div className="space-y-2">
        <Label>Zdjęcie</Label>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="mb-2 max-h-40 rounded-lg border" />
        ) : null}
        <Input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadImage(f); }} />
        <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="URL obrazu" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="affurl">Link afiliacyjny</Label>
        <Input id="affurl" type="url" value={affiliateUrl} onChange={(e) => setAffiliateUrl(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Sieć</Label>
        <Select value={affiliateNetwork} onValueChange={setAffiliateNetwork}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Amazon">Amazon</SelectItem>
            <SelectItem value="Ceneo">Ceneo</SelectItem>
            <SelectItem value="Sklep wędkarski">Sklep wędkarski</SelectItem>
            <SelectItem value="Inne">Inne</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">Cena (PLN)</Label>
        <Input id="price" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
      </div>
      <div className="space-y-3">
        <Label>Ocena (0–10)</Label>
        <Slider value={[rating]} min={0} max={10} step={0.1} onValueChange={(v) => setRating(v[0] ?? 0)} />
        <StarRating rating={rating} />
      </div>
      <div className="space-y-2">
        <Label>Plusy</Label>
        {pros.map((p, i) => (
          <div key={i} className="flex gap-2">
            <Input value={p} onChange={(e) => setPros((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))} />
            <Button type="button" variant="outline" onClick={() => setPros((prev) => prev.filter((_, j) => j !== i))}>
              ✕
            </Button>
          </div>
        ))}
        <Button type="button" variant="secondary" size="sm" onClick={() => setPros((prev) => [...prev, ""])}>
          Dodaj plus
        </Button>
      </div>
      <div className="space-y-2">
        <Label>Minusy</Label>
        {cons.map((c, i) => (
          <div key={i} className="flex gap-2">
            <Input value={c} onChange={(e) => setCons((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))} />
            <Button type="button" variant="outline" onClick={() => setCons((prev) => prev.filter((_, j) => j !== i))}>
              ✕
            </Button>
          </div>
        ))}
        <Button type="button" variant="secondary" size="sm" onClick={() => setCons((prev) => [...prev, ""])}>
          Dodaj minus
        </Button>
      </div>
      <div className="space-y-2">
        <Label>Specyfikacja (klucz / wartość)</Label>
        {specRows.map((row, i) => (
          <div key={i} className="flex flex-wrap gap-2">
            <Input placeholder="Klucz" value={row.key} onChange={(e) => setSpecRows((prev) => prev.map((r, j) => (j === i ? { ...r, key: e.target.value } : r)))} />
            <Input placeholder="Wartość" value={row.value} onChange={(e) => setSpecRows((prev) => prev.map((r, j) => (j === i ? { ...r, value: e.target.value } : r)))} />
            <Button type="button" variant="outline" size="sm" onClick={() => setSpecRows((prev) => prev.filter((_, j) => j !== i))}>
              Usuń
            </Button>
          </div>
        ))}
        <Button type="button" variant="secondary" size="sm" onClick={() => setSpecRows((prev) => [...prev, { key: "", value: "" }])}>
          Dodaj wiersz
        </Button>
      </div>
      <Button type="button" onClick={() => void save()} disabled={saving}>
        {saving ? "Zapis…" : "Zapisz produkt"}
      </Button>
    </div>
  );
}
