"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useCart, UnifiedCartItem } from "@/lib/cart-context";

interface CartItemRowProps {
  item: UnifiedCartItem;
  isMutating: boolean;
}

export function CartItemRow({ item, isMutating }: CartItemRowProps) {
  const { updateQuantity, removeItem } = useCart();
  const { product, quantity, formattedUnitPrice, formattedLineTotal, stockQuantity, available } = item;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 py-6 border-b border-[#E5E5E5] last:border-b-0">
      {/* Product Details & Image */}
      <div className="flex items-center gap-4 sm:gap-6 min-w-0 flex-1">
        <Link
          href={`/products/${product.slug}`}
          className="relative size-20 sm:size-24 shrink-0 overflow-hidden border border-[#E5E5E5] bg-[#FFFFFF] group"
        >
          <Image
            src={item.image}
            alt={item.alt}
            fill
            sizes="96px"
            className="object-cover object-center grayscale transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-block text-[9px] font-mono uppercase tracking-widest text-[#777777]">
              {item.sku ? `SKU · ${item.sku}` : "BOTANICAL FORMULATION"}
            </span>
            {!available && (
              <span className="inline-block text-[9px] font-mono uppercase px-1.5 py-0.2 border border-red-400 bg-red-50 text-red-600">
                Unavailable
              </span>
            )}
          </div>

          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#111111] truncate">
            <Link
              href={`/products/${product.slug}`}
              className="hover:text-[#777777] transition-colors"
            >
              {product.name}
            </Link>
          </h3>

          <p className="text-xs font-mono text-[#777777]">
            {item.variantName}
          </p>

          <p className="text-xs font-mono text-[#777777]">
            Unit Price: {formattedUnitPrice} {item.currency}
          </p>

          {stockQuantity <= 5 && stockQuantity > 0 && (
            <p className="text-[10px] font-mono text-amber-700">
              Only {stockQuantity} unit(s) remaining in batch.
            </p>
          )}
        </div>
      </div>

      {/* Controls & Subtotal */}
      <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-6 sm:gap-8">
        {/* Quantity Controls */}
        <div className="flex items-center border border-[#111111] bg-white h-10 px-3">
          <button
            type="button"
            onClick={() => updateQuantity(item.id, quantity - 1)}
            disabled={quantity <= 1 || isMutating}
            aria-label={`Decrease quantity of ${product.name}`}
            className="p-1 text-[#111111] disabled:opacity-30 disabled:cursor-not-allowed hover:text-[#777777] transition-colors cursor-pointer"
          >
            <Minus className="size-3.5" />
          </button>
          <span className="font-mono text-xs font-semibold text-[#111111] px-3 select-none min-w-[20px] text-center">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => updateQuantity(item.id, quantity + 1)}
            disabled={quantity >= stockQuantity || isMutating}
            aria-label={`Increase quantity of ${product.name}`}
            className="p-1 text-[#111111] disabled:opacity-30 disabled:cursor-not-allowed hover:text-[#777777] transition-colors cursor-pointer"
          >
            <Plus className="size-3.5" />
          </button>
        </div>

        {/* Item Subtotal */}
        <div className="text-right min-w-[80px]">
          <span className="text-sm font-mono font-semibold text-[#111111]">
            {formattedLineTotal}
          </span>
        </div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={() => removeItem(item.id)}
          disabled={isMutating}
          aria-label={`Remove ${product.name} from cart`}
          className="p-2 text-[#777777] hover:text-[#111111] disabled:opacity-30 transition-colors cursor-pointer"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function OrderSummary() {
  const { formattedSubtotal, totalCount, isMutating } = useCart();

  return (
    <div className="border border-[#E5E5E5] bg-white p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
        <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#111111]">
          Order Summary
        </h2>
        {isMutating && (
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#777777]">
            <Loader2 className="size-3 animate-spin" />
            <span>Syncing...</span>
          </div>
        )}
      </div>

      <div className="space-y-3.5 text-xs">
        <div className="flex justify-between items-center text-[#777777]">
          <span>Subtotal ({totalCount} {totalCount === 1 ? "item" : "items"})</span>
          <span className="font-mono text-[#111111] font-medium text-sm">
            {formattedSubtotal}
          </span>
        </div>

        <div className="flex justify-between items-center text-[#777777]">
          <span>Shipping Estimate</span>
          <span className="font-mono text-[11px] text-[#777777]">
            Calculated at checkout
          </span>
        </div>

        <div className="flex justify-between items-center text-[#777777]">
          <span>Estimated Taxes</span>
          <span className="font-mono text-[11px] text-[#777777]">
            Calculated at checkout
          </span>
        </div>

        <div className="border-t border-[#E5E5E5] pt-4 flex justify-between items-baseline">
          <div className="space-y-0.5">
            <span className="text-sm font-semibold uppercase tracking-wider text-[#111111]">
              Estimated Total
            </span>
            <p className="text-[10px] font-mono text-[#777777]">
              Excluding shipping & taxes
            </p>
          </div>
          <span className="text-xl font-mono font-semibold text-[#111111]">
            {formattedSubtotal}
          </span>
        </div>
      </div>

      {/* Primary CTA */}
      <div className="space-y-3 pt-2">
        <Link
          href="/checkout"
          className="inline-flex items-center justify-center gap-2 w-full h-13 bg-[#111111] text-white uppercase tracking-[0.2em] text-xs font-semibold hover:bg-black transition-colors"
        >
          <span>PROCEED TO CHECKOUT</span>
          <ArrowRight className="size-4" />
        </Link>

        <Link
          href="/shop"
          className="inline-flex items-center justify-center w-full py-2.5 text-xs font-mono uppercase tracking-widest text-[#777777] hover:text-[#111111] transition-colors"
        >
          ← Continue Shopping
        </Link>
      </div>

      {/* Monochromatic Security Note */}
      <div className="pt-4 border-t border-[#E5E5E5] text-[10px] font-mono text-[#777777] uppercase tracking-wider space-y-1">
        <p>✓ Complimentary dispatch on orders &gt; $50</p>
        <p>✓ 30-day unopened archival container return</p>
      </div>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 animate-pulse">
      <div className="lg:col-span-8 space-y-6">
        <div className="h-6 w-48 bg-[#E5E5E5]" />
        <div className="border border-[#E5E5E5] bg-white p-6 space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-6 items-center">
              <div className="size-24 bg-[#E5E5E5] shrink-0" />
              <div className="space-y-3 flex-1">
                <div className="h-4 w-1/3 bg-[#E5E5E5]" />
                <div className="h-5 w-2/3 bg-[#E5E5E5]" />
                <div className="h-4 w-1/4 bg-[#E5E5E5]" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-4 border border-[#E5E5E5] bg-white p-8 space-y-6">
        <div className="h-5 w-32 bg-[#E5E5E5]" />
        <div className="h-24 bg-[#E5E5E5]" />
        <div className="h-12 bg-[#E5E5E5]" />
      </div>
    </div>
  );
}

export function CartViewClient() {
  const { items, totalCount, clearCart, isLoading, isMutating, error, clearError, refreshCart } = useCart();

  if (isLoading) {
    return <CartSkeleton />;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 sm:py-28 px-6 space-y-8 border border-[#E5E5E5] bg-white p-10 sm:p-14">
        {/* Minimalist Cart graphic */}
        <div className="mx-auto flex size-16 items-center justify-center border border-[#111111] bg-[#F5F5F2]">
          <span className="text-2xl font-mono text-[#111111]">∅</span>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#777777]">
            Archive · 0 Items
          </p>
          <h2 className="text-2xl sm:text-3xl font-light uppercase tracking-tight text-[#111111]">
            YOUR CART IS EMPTY
          </h2>
          <p className="text-sm text-[#777777] leading-relaxed max-w-sm mx-auto">
            You haven&apos;t added any botanical cinnamon formulations to your selection yet. Explore our curated formulations to begin.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 h-13 px-8 bg-[#111111] text-white uppercase tracking-[0.2em] text-xs font-semibold hover:bg-black transition-colors w-full sm:w-auto"
          >
            <span>EXPLORE THE COLLECTION</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="flex items-center justify-between border border-red-300 bg-red-50 p-4 text-xs text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={refreshCart}
              className="inline-flex items-center gap-1 font-mono uppercase underline hover:no-underline cursor-pointer"
            >
              <RefreshCw className="size-3" />
              <span>Retry</span>
            </button>
            <button
              type="button"
              onClick={clearError}
              className="font-mono uppercase underline hover:no-underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Product List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#777777]">
              Items in Selection ({totalCount})
            </span>
            <button
              type="button"
              onClick={clearCart}
              disabled={isMutating}
              className="text-xs font-mono uppercase tracking-widest text-[#777777] hover:text-[#111111] disabled:opacity-30 transition-colors cursor-pointer"
            >
              Clear All
            </button>
          </div>

          <div className="border border-[#E5E5E5] bg-white px-6">
            {items.map((item) => (
              <CartItemRow key={item.id} item={item} isMutating={isMutating} />
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4 sticky top-28">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}
