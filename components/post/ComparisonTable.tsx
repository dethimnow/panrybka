"use client";

import { useMemo, useState } from "react";
import type { Product } from "@prisma/client";
import { StarRating } from "@/components/post/StarRating";
import { Button } from "@/components/ui/button";

export type ComparisonRow = Product & { position: number; isWinner: boolean };

type SortKey = "position" | "name" | "rating" | "price" | string;

function collectSpecKeys(products: ComparisonRow[]): string[] {
  const keys = new Set<string>();
  for (const p of products) {
    const s = p.specs as Record<string, string>;
    Object.keys(s).forEach((k) => keys.add(k));
  }
  return Array.from(keys);
}

export function ComparisonTable({ products }: { products: ComparisonRow[] }) {
  const specKeys = useMemo(() => collectSpecKeys(products), [products]);
  const [sortKey, setSortKey] = useState<SortKey>("position");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const rows = useMemo(() => {
    const list = [...products];
    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      if (sortKey === "position") return (a.position - b.position) * dir;
      if (sortKey === "name") return a.name.localeCompare(b.name, "pl") * dir;
      if (sortKey === "rating") return (a.rating - b.rating) * dir;
      if (sortKey === "price") {
        const pa = a.price ?? -1;
        const pb = b.price ?? -1;
        return (pa - pb) * dir;
      }
      if (specKeys.includes(sortKey)) {
        const sa = String((a.specs as Record<string, string>)[sortKey] ?? "");
        const sb = String((b.specs as Record<string, string>)[sortKey] ?? "");
        return sa.localeCompare(sb, "pl", { numeric: true }) * dir;
      }
      return (a.position - b.position) * dir;
    });
    return list;
  }, [products, sortKey, sortDir, specKeys]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "position" ? "asc" : "asc");
    }
  };

  const Th = ({ k, children }: { k: SortKey; children: React.ReactNode }) => (
    <th className="whitespace-nowrap border-b border-gray-200 bg-gray-50 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
      <button type="button" className="inline-flex items-center gap-1 hover:text-forest-700" onClick={() => toggleSort(k)}>
        {children}
        {sortKey === k ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
      </button>
    </th>
  );

  return (
    <div className="relative">
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-white to-transparent md:hidden" aria-hidden />
      <div className="overflow-x-auto pb-2 shadow-inner md:shadow-none">
        <table className="min-w-[640px] w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-20 border-b border-gray-200 bg-gray-100 px-3 py-3 text-left text-xs font-semibold uppercase text-gray-600 shadow-[2px_0_4px_rgba(0,0,0,0.06)]">
                Produkt
              </th>
              <Th k="rating">Ocena</Th>
              <Th k="price">Cena</Th>
              {specKeys.map((sk) => (
                <Th key={sk} k={sk}>
                  {sk}
                </Th>
              ))}
              <th className="border-b border-gray-200 bg-gray-50 px-3 py-3 text-left text-xs font-semibold uppercase text-gray-600">Kup</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr
                key={p.id}
                className={`border-b border-gray-100 ${p.isWinner ? "bg-forest-50 border-l-4 border-l-forest-500" : "bg-white"}`}
              >
                <td className="sticky left-0 z-10 whitespace-nowrap border-r border-gray-100 bg-inherit px-3 py-3 font-medium text-gray-900 shadow-[2px_0_4px_rgba(0,0,0,0.04)]">
                  {p.name}
                </td>
                <td className="px-3 py-3">
                  <StarRating rating={p.rating} className="flex-wrap" />
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-gray-800">{p.price != null ? `${p.price.toFixed(2)} PLN` : "—"}</td>
                {specKeys.map((sk) => (
                  <td key={sk} className="whitespace-nowrap px-3 py-3 text-gray-700">
                    {String((p.specs as Record<string, string>)[sk] ?? "—")}
                  </td>
                ))}
                <td className="px-3 py-3">
                  <Button size="sm" variant="secondary" asChild>
                    <a href={p.affiliateUrl} rel="nofollow sponsored noopener" target="_blank" className="no-underline">
                      Kup
                    </a>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-gray-500 md:hidden">Przesuń tabelę w poziomie, aby zobaczyć wszystkie kolumny.</p>
    </div>
  );
}
