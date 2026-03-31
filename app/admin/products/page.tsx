"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Product } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminProductsPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPage = useCallback(
    async (p: number, append: boolean) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(p), limit: "20" });
        if (q.trim()) params.set("q", q.trim());
        if (category.trim()) params.set("category", category.trim());
        const res = await fetch(`/api/products?${params}`);
        if (!res.ok) return;
        const data = (await res.json()) as { items: Product[]; hasMore: boolean };
        setItems((prev) => (append ? [...prev, ...data.items] : data.items));
        setHasMore(data.hasMore);
      } finally {
        setLoading(false);
      }
    },
    [q, category]
  );

  useEffect(() => {
    setPage(1);
    void fetchPage(1, false);
  }, [q, category, fetchPage]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    void fetchPage(next, true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-forest-900">Produkty</h1>
        <Button asChild>
          <Link href="/admin/products/new">Nowy produkt</Link>
        </Button>
      </div>
      <div className="flex flex-wrap gap-3">
        <Input placeholder="Szukaj…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Input placeholder="Kategoria" value={category} onChange={(e) => setCategory(e.target.value)} className="max-w-xs" />
      </div>
      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-3">Nazwa</th>
              <th className="p-3">Marka</th>
              <th className="p-3">Cena</th>
              <th className="p-3">Ocena</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-b border-gray-100">
                <td className="p-3">
                  <Link href={`/admin/products/${p.id}/edit`} className="font-medium text-water-700 hover:underline">
                    {p.name}
                  </Link>
                </td>
                <td className="p-3">{p.brand}</td>
                <td className="p-3">{p.price != null ? `${p.price.toFixed(2)} PLN` : "—"}</td>
                <td className="p-3">{p.rating.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loading ? <p className="text-sm text-gray-500">Ładowanie…</p> : null}
      {hasMore ? (
        <Button type="button" variant="outline" onClick={loadMore} disabled={loading}>
          Załaduj więcej
        </Button>
      ) : null}
    </div>
  );
}
