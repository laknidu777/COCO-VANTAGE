import { type DemonstrationProduct } from "@/lib/data/products";
import { ProductCard } from "@/components/products/ProductCard";

interface ProductGridProps {
  products: DemonstrationProduct[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-24 text-center border border-[#E5E5E5] bg-[#FFFFFF] p-12">
        <p className="text-sm font-mono uppercase tracking-widest text-[#777777]">
          No products found in this category
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
