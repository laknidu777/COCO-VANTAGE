import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { type StoreProduct } from "@/lib/store-api";

interface ProductCardProps {
  product: StoreProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const formattedPrice = product.formattedPrice || `$${product.price.toFixed(2)}`;

  return (
    <article className="group flex flex-col justify-between border border-[#E5E5E5] bg-[#FFFFFF] transition-all duration-300 hover:border-[#111111] hover:shadow-xs">
      <div>
        {/* Product Image Area with fixed aspect ratio */}
        <div className="relative aspect-square w-full overflow-hidden bg-[#F5F5F2] border-b border-[#E5E5E5]">
          <Image
            src={product.image}
            alt={product.alt || product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-center grayscale transition-transform duration-500 ease-out group-hover:scale-103"
          />
          <div className="absolute top-3 left-3 bg-[#111111] text-white text-[9px] font-mono uppercase tracking-widest px-2 py-0.5">
            {product.weight}
          </div>
          {product.featured && (
            <div className="absolute top-3 right-3 bg-white/90 text-[#111111] border border-[#E5E5E5] text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 backdrop-blur-xs">
              Featured
            </div>
          )}
        </div>

        {/* Product Content Details */}
        <div className="p-6 space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#111111]">
              {product.name}
            </h3>
            <span className="text-xs font-mono text-[#111111] shrink-0 font-medium">
              {formattedPrice}
            </span>
          </div>

          <p className="text-[11px] font-mono uppercase tracking-wider text-[#777777]">
            {product.tagline}
          </p>

          <p className="text-xs text-[#777777] leading-relaxed line-clamp-3">
            {product.description}
          </p>
        </div>
      </div>

      {/* Card Action & Availability Note */}
      <div className="p-6 pt-0 mt-4 border-t border-[#E5E5E5]/60 flex flex-col gap-3">
        <div className="pt-3 flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#777777]">
            {product.isAvailable ? `[${product.currency} · In Stock]` : `[Sold Out]`}
          </span>
          <Link
            href={`/products/${product.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#111111] hover:text-[#777777] transition-colors"
          >
            <span>DISCOVER PRODUCT</span>
            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
