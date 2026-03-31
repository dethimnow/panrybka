import { DatabaseStatusBanner } from "@/components/public/DatabaseStatusBanner";

export function ArticleDbError() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <DatabaseStatusBanner variant="connection_failed" />
      <p className="mt-6 text-center text-gray-700">Nie można załadować artykułu — sprawdź konfigurację bazy na Vercel.</p>
    </div>
  );
}
