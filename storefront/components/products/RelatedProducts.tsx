import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { type StoreProduct } from "@/lib/store-api";
import { ProductCard } from "@/components/products/ProductCard";

interface RelatedProductsProps {
  currentProductId: string;
  category: string;
  allProducts: StoreProduct[];
}

export function RelatedProducts({
  currentProductId,
  category,
  allProducts,
}: RelatedProductsProps) {
  // Select up to 4 other products, prioritizing same category first
  const sameCategory = allProducts.filter(
    (p) => p.id !== currentProductId && p.category === category
  );
  const otherCategories = allProducts.filter(
    (p) => p.id !== currentProductId && p.category !== category
  );

  const related = [...sameCategory, ...otherCategories].slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section className="w-full border-t border-[#E5E5E5] bg-[#F5F5F2] py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-12 space-y-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5E5E5] pb-6">
          <div className="space-y-1.5">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#777777]">
              Curated Pairings
            </p>
            <h2 className="text-2xl sm:text-3xl font-light uppercase tracking-tight text-[#111111]">
              RELATED FORMULATIONS
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-[#111111] hover:text-[#777777] transition-colors"
          >
            <span>VIEW ALL ({allProducts.length})</span>
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        {/* 4-column responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {related.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </div>
    </section>
  );
}
