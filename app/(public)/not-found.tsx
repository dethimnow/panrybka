import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-4xl font-bold text-forest-900">404</h1>
      <p className="mt-4 text-gray-600">Nie znaleziono strony. Wróć na stronę główną lub wybierz kategorię z menu.</p>
      <Button asChild className="mt-8">
        <Link href="/">Strona główna</Link>
      </Button>
    </div>
  );
}
