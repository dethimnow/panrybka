import Image from "next/image";
import type { Product } from "@prisma/client";
import { StarRating } from "@/components/post/StarRating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Props = {
  product: Product;
  index: number;
  isWinner: boolean;
};

export function ProductReview({ product, index, isWinner }: Props) {
  const specs = product.specs as Record<string, string>;

  return (
    <article
      className={`rounded-2xl border bg-white p-6 shadow-sm ${isWinner ? "border-l-4 border-forest-500 bg-forest-50/40" : "border-gray-100"}`}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-lg font-bold text-forest-800">{index + 1}.</span>
        {isWinner ? <Badge variant="default">Najlepszy wybór</Badge> : null}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-xl bg-gray-100 md:mx-0">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">Brak zdjęcia</div>
          )}
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-bold tracking-tight text-gray-900">{product.name}</h3>
          <p className="text-sm text-gray-600">{product.brand}</p>
          <StarRating rating={product.rating} />
          <div
            className="article-body prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <h4 className="mb-2 font-semibold text-forest-700">Plusy</h4>
          <ul className="space-y-1 text-sm">
            {product.pros.map((p) => (
              <li key={p} className="flex gap-2 text-gray-800">
                <span className="text-forest-500" aria-hidden>
                  ✓
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-2 font-semibold text-red-700">Minusy</h4>
          <ul className="space-y-1 text-sm">
            {product.cons.map((c) => (
              <li key={c} className="flex gap-2 text-gray-800">
                <span className="text-red-500" aria-hidden>
                  ✗
                </span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {Object.keys(specs).length > 0 ? (
        <div className="mt-6">
          <h4 className="mb-2 font-semibold text-gray-900">Specyfikacja</h4>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left text-sm">
              <tbody>
                {Object.entries(specs).map(([k, v]) => (
                  <tr key={k} className="border-b border-gray-100 last:border-0">
                    <th className="bg-gray-50 px-3 py-2 font-medium text-gray-700">{k}</th>
                    <td className="px-3 py-2 text-gray-900">{String(v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
      <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-6">
        {product.price != null ? (
          <p className="text-lg font-bold text-gray-900">{product.price.toFixed(2)} PLN</p>
        ) : (
          <p className="text-sm text-gray-500">Cena orientacyjna — sprawdź u sprzedawcy</p>
        )}
        <Button asChild size="lg" className="bg-water-500 hover:bg-water-600">
          <a
            href={product.affiliateUrl}
            rel="nofollow sponsored noopener"
            target="_blank"
            className="no-underline"
          >
            Sprawdź cenę na {product.affiliateNetwork}
          </a>
        </Button>
      </div>
    </article>
  );
}
