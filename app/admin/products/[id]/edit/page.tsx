import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

type Props = { params: { id: string } };

export default async function EditProductPage({ params }: Props) {
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) notFound();

  const specs = product.specs as Record<string, string>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-forest-900">Edycja produktu</h1>
      <ProductForm
        productId={product.id}
        initial={{
          name: product.name,
          slug: product.slug,
          brand: product.brand,
          category: product.category,
          description: product.description,
          imageUrl: product.imageUrl,
          affiliateUrl: product.affiliateUrl,
          affiliateNetwork: product.affiliateNetwork,
          price: product.price,
          rating: product.rating,
          pros: product.pros,
          cons: product.cons,
          specs,
        }}
      />
    </div>
  );
}
