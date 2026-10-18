"use client";

import { useState, useMemo } from "react";
import { Minus, Plus, ShoppingBag, Check, Ban, Loader2, AlertCircle } from "lucide-react";
import { type StoreProduct, formatCurrency } from "@/lib/store-api";
import { type DemonstrationProduct } from "@/lib/data/products";
import { useCart } from "@/lib/cart-context";

interface AddToCartSectionProps {
  product: StoreProduct | DemonstrationProduct;
}

export function AddToCartSection({ product }: AddToCartSectionProps) {
  const { addItem, isMutating } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedRecently, setAddedRecently] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Extract variants if StoreProduct
  const variants = useMemo(() => {
    if ("variants" in product && Array.isArray(product.variants) && product.variants.length > 0) {
      return product.variants;
    }
    return [];
  }, [product]);

  // Selected variant state (defaults to isDefault variant or first variant)
  const [selectedVariantId, setSelectedVariantId] = useState<string>(() => {
    if (variants.length > 0) {
      const def = variants.find((v) => v.isDefault && v.isActive) || variants[0];
      return def.id;
    }
    return "";
  });

  const selectedVariant = useMemo(() => {
    if (variants.length > 0) {
      return (
        variants.find((v) => v.id === selectedVariantId) ||
        variants.find((v) => v.isDefault) ||
        variants[0]
      );
    }
    return null;
  }, [variants, selectedVariantId]);

  // Pricing resolution for selected variant
  const variantPriceCents = useMemo(() => {
    if (selectedVariant?.prices && selectedVariant.prices.length > 0) {
      const usdPrice = selectedVariant.prices.find((p) => p.currency === "USD");
      return (usdPrice || selectedVariant.prices[0]).amount;
    }
    if ("priceInCents" in product) {
      return product.priceInCents;
    }
    return Math.round((product.price || 0) * 100);
  }, [selectedVariant, product]);

  const variantCurrency = useMemo(() => {
    if (selectedVariant?.prices && selectedVariant.prices.length > 0) {
      return selectedVariant.prices[0].currency;
    }
    return "currency" in product ? product.currency : "USD";
  }, [selectedVariant, product]);

  const formattedUnitPrice = formatCurrency(variantPriceCents, variantCurrency);

  // Stock and availability
  const isAvailable = useMemo(() => {
    if (selectedVariant) {
      return selectedVariant.isActive && selectedVariant.stockQuantity > 0;
    }
    return "isAvailable" in product ? product.isAvailable : true;
  }, [selectedVariant, product]);

  const stockQuantity = useMemo(() => {
    if (selectedVariant) {
      return selectedVariant.stockQuantity;
    }
    return "stockQuantity" in product ? product.stockQuantity : 999;
  }, [selectedVariant, product]);

  const isOutOfStock = !isAvailable || stockQuantity <= 0;

  const handleDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleIncrement = () => {
    setQuantity((prev) => (prev < stockQuantity ? prev + 1 : prev));
  };

  const handleAddToCart = async () => {
    if (isOutOfStock || isMutating) return;
    setErrorMessage(null);

    const target = selectedVariant ? selectedVariant.id : (product as unknown as DemonstrationProduct);
    const success = await addItem(target, quantity, variantCurrency);

    if (success) {
      setAddedRecently(true);
      setTimeout(() => {
        setAddedRecently(false);
      }, 2200);
    } else {
      setErrorMessage("Unable to add to cart. Stock limit reached or service temporarily unavailable.");
    }
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Variant Selector if multiple variants exist */}
      {variants.length > 1 && (
        <div className="space-y-2">
          <label className="text-[11px] font-mono uppercase tracking-widest text-[#777777]">
            Select Formulation Specification
          </label>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const isSelected = v.id === selectedVariantId;
              const isVariantAvailable = v.isActive && v.stockQuantity > 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setSelectedVariantId(v.id);
                    setQuantity(1);
                    setErrorMessage(null);
                  }}
                  disabled={!isVariantAvailable}
                  className={`px-3 py-2 text-xs font-mono border transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#111111] bg-[#111111] text-white"
                      : isVariantAvailable
                      ? "border-[#E5E5E5] bg-white text-[#111111] hover:border-[#111111]"
                      : "border-[#E5E5E5] bg-[#F5F5F2] text-[#999999] cursor-not-allowed line-through"
                  }`}
                >
                  {v.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Controls Container */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        {/* Quantity Selector */}
        <div className="flex items-center justify-between border border-[#111111] bg-white h-13 px-4 w-full sm:w-36">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#777777] sm:hidden">
            Quantity
          </span>
          <div className="flex items-center justify-between w-full sm:w-full">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={quantity <= 1 || isOutOfStock || isMutating}
              aria-label="Decrease quantity"
              className="p-1 text-[#111111] disabled:opacity-30 disabled:cursor-not-allowed hover:text-[#777777] transition-colors cursor-pointer"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="font-mono text-sm font-semibold text-[#111111] px-3 select-none">
              {isOutOfStock ? 0 : quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              disabled={quantity >= stockQuantity || isOutOfStock || isMutating}
              aria-label="Increase quantity"
              className="p-1 text-[#111111] disabled:opacity-30 disabled:cursor-not-allowed hover:text-[#777777] transition-colors cursor-pointer"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock || isMutating}
          className={`flex-1 h-13 flex items-center justify-center gap-2 px-8 uppercase tracking-[0.2em] text-xs font-semibold transition-all duration-300 border ${
            isOutOfStock
              ? "bg-[#E5E5E5] text-[#777777] border-[#E5E5E5] cursor-not-allowed"
              : isMutating
              ? "bg-[#333333] text-white border-[#333333] cursor-wait"
              : addedRecently
              ? "bg-white text-[#111111] border-[#111111] cursor-pointer"
              : "bg-[#111111] text-[#FFFFFF] border-[#111111] hover:bg-[#000000] cursor-pointer"
          }`}
        >
          {isOutOfStock ? (
            <>
              <Ban className="size-4 text-[#777777]" />
              <span>OUT OF STOCK</span>
            </>
          ) : isMutating ? (
            <>
              <Loader2 className="size-4 animate-spin text-white" />
              <span>UPDATING BAG...</span>
            </>
          ) : addedRecently ? (
            <>
              <Check className="size-4 text-[#111111]" />
              <span>ADDED TO BAG ({quantity})</span>
            </>
          ) : (
            <>
              <ShoppingBag className="size-4" />
              <span>
                ADD TO CART · {formatCurrency(variantPriceCents * quantity, variantCurrency)}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Stock & Error Notifications */}
      {errorMessage ? (
        <div className="flex items-center gap-2 border border-red-300 bg-red-50 p-3 text-red-700 text-xs">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      ) : isOutOfStock ? (
        <p className="text-[11px] font-mono text-red-600 tracking-wider">
          This formulation is currently unavailable or out of stock.
        </p>
      ) : addedRecently ? (
        <p className="text-[11px] font-mono text-[#111111] tracking-wider animate-in fade-in duration-200">
          ✓ Added {quantity} × {selectedVariant?.name || product.name} to your session bag.
        </p>
      ) : stockQuantity <= 5 ? (
        <p className="text-[11px] font-mono text-amber-700 tracking-wider">
          Low reserve: Only {stockQuantity} remaining in current batch.
        </p>
      ) : null}
    </div>
  );
}
