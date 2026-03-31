"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { postPublicPath } from "@/lib/categories";
import type { PostCategory } from "@prisma/client";
import { Search } from "lucide-react";

type Hit = { title: string; slug: string; category: PostCategory; excerpt: string };

export function SearchModal() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [hits, setHits] = useState<Hit[]>([]);

  const runSearch = async (term: string) => {
    if (term.trim().length < 2) {
      setHits([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?search=${encodeURIComponent(term.trim())}&limit=20`);
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { items: Hit[] };
      setHits(data.items);
    } catch {
      setHits([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white" aria-label="Szukaj">
          <Search className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Szukaj artykułów</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Wpisz frazę…"
          value={q}
          onChange={(e) => {
            const v = e.target.value;
            setQ(v);
            void runSearch(v);
          }}
          autoFocus
          aria-busy={loading}
        />
        <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto text-sm">
          {loading ? <li className="text-gray-500">Szukam…</li> : null}
          {!loading && hits.length === 0 && q.trim().length >= 2 ? <li className="text-gray-500">Brak wyników</li> : null}
          {hits.map((h) => (
            <li key={h.slug}>
              <Link
                href={postPublicPath(h.category, h.slug)}
                className="block rounded-lg border border-transparent px-2 py-2 hover:border-gray-200 hover:bg-gray-50"
                onClick={() => setOpen(false)}
              >
                <span className="font-medium text-gray-900">{h.title}</span>
                <p className="mt-1 line-clamp-2 text-xs text-gray-600">{h.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
