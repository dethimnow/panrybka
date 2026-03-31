"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-xl font-bold text-white">Błąd panelu CMS</h1>
      <p className="mt-4 text-forest-100">
        Najczęściej brakuje <code className="rounded bg-black/20 px-1">DATABASE_URL</code> na Vercel albo baza nie odpowiada.
        Ustaw też <code className="rounded bg-black/20 px-1">NEXTAUTH_SECRET</code> i{" "}
        <code className="rounded bg-black/20 px-1">NEXTAUTH_URL</code> (pełny URL produkcji).
      </p>
      {error.digest ? <p className="mt-2 font-mono text-xs text-forest-300">Digest: {error.digest}</p> : null}
      <div className="mt-8 flex justify-center gap-3">
        <Button type="button" variant="secondary" onClick={() => reset()}>
          Ponów
        </Button>
        <Button type="button" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
          <Link href="/">Strona www</Link>
        </Button>
      </div>
    </div>
  );
}
