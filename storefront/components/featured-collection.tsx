import { PRODUCTS } from "@/lib/products";
import { ProductCard } from "@/components/product-card";

export function FeaturedCollection() {
  return (
    <section id="collection" className="w-full bg-[#F5F5F2] py-24 sm:py-32 lg:py-36 border-b border-[#E5E5E5]">
      <div className="mx-auto max-w-7xl px-6 lg:px-12 space-y-12 sm:space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E5E5E5] pb-8">
          <div className="space-y-2">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#777777]">
              Curated Formulations
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light uppercase tracking-tight text-[#111111]">
              THE COLLECTION
            </h2>
          </div>
          <div className="space-y-1 text-left md:text-right">
            <p className="text-sm font-normal text-[#111111]">
              Explore our signature selection.
            </p>
            <p className="text-[11px] font-mono text-[#777777] uppercase tracking-wider">
              *Provisional demonstration concepts · Not offered for commercial transaction
            </p>
          </div>
        </div>

        {/* 3-column / responsive Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
