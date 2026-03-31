"use client";

import { useEffect, useState } from "react";

type Item = { id: string; text: string; level: number };

export function TableOfContents() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const root = document.getElementById("article-content");
    if (!root) return;
    const headings = root.querySelectorAll("h2, h3");
    const next: Item[] = [];
    headings.forEach((el, i) => {
      const id = el.id || `heading-${i}`;
      if (!el.id) el.id = id;
      next.push({
        id,
        text: el.textContent ?? "",
        level: el.tagName === "H2" ? 2 : 3,
      });
    });
    setItems(next);
  }, []);

  if (items.length === 0) return null;

  return (
    <nav aria-label="Spis treści" className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="mb-3 text-sm font-semibold text-forest-900">Spis treści</p>
      <ul className="space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.id} style={{ paddingLeft: item.level === 3 ? 12 : 0 }}>
            <a href={`#${item.id}`} className="text-water-700 hover:underline">
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
