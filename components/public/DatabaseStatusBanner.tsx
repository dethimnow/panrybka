/**
 * Komunikat dla właściciela wdrożenia — gdy brak DB lub połączenie padło.
 * Nie używamy tu treści wrażliwych (bez URL-i z hasłami).
 */
export function DatabaseStatusBanner({
  variant,
}: {
  variant: "missing_url" | "connection_failed";
}) {
  return (
    <div
      className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-950"
      role="status"
    >
      {variant === "missing_url" ? (
        <p>
          <strong>Baza danych nie jest skonfigurowana.</strong> W panelu Vercel dodaj zmienne{" "}
          <code className="rounded bg-white px-1">DATABASE_URL</code> i{" "}
          <code className="rounded bg-white px-1">DIRECT_URL</code> (PostgreSQL, np. Supabase), potem wykonaj{" "}
          <code className="rounded bg-white px-1">npx prisma db push</code> oraz seed lokalnie lub z migracji.
        </p>
      ) : (
        <p>
          <strong>Nie udało się połączyć z bazą danych.</strong> Sprawdź w Vercel poprawność{" "}
          <code className="rounded bg-white px-1">DATABASE_URL</code> (pooler 6543 +{" "}
          <code className="rounded bg-white px-1">?pgbouncer=true</code>
          ), <code className="rounded bg-white px-1">DIRECT_URL</code> na port 5432 oraz czy Supabase akceptuje połączenia
          z Vercel.
        </p>
      )}
    </div>
  );
}
