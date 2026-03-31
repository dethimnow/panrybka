import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-forest-900">Nowy produkt</h1>
      <ProductForm
        productId={null}
        initial={{
          name: "",
          slug: "",
          brand: "",
          category: "",
          description: "<p></p>",
          imageUrl: null,
          affiliateUrl: "",
          affiliateNetwork: "Amazon",
          price: null,
          rating: 7,
          pros: [],
          cons: [],
          specs: {},
        }}
      />
    </div>
  );
}
