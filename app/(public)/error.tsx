"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PublicError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-forest-900">Coś poszło nie tak</h1>
      <p className="mt-4 text-gray-600">
        Wystąpił błąd serwera. Najczęściej na Vercel brakuje poprawnych zmiennych{" "}
        <code className="rounded bg-gray-100 px-1 text-sm">DATABASE_URL</code>,{" "}
        <code className="rounded bg-gray-100 px-1 text-sm">NEXTAUTH_SECRET</code> lub{" "}
        <code className="rounded bg-gray-100 px-1 text-sm">NEXTAUTH_URL</code> z adresem produkcji.
      </p>
      {error.digest ? <p className="mt-2 font-mono text-xs text-gray-400">Digest: {error.digest}</p> : null}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={() => reset()}>
          Spróbuj ponownie
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/">Strona główna</Link>
        </Button>
      </div>
    </div>
  );
}
