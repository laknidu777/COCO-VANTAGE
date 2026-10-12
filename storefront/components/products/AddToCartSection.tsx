"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag, Check } from "lucide-react";
import { DemonstrationProduct } from "@/lib/data/products";
import { useCart } from "@/lib/cart-context";

interface AddToCartSectionProps {
  product: DemonstrationProduct;
}

export function AddToCartSection({ product }: AddToCartSectionProps) {
  const [quantity, setQuantity] = useState(1);
  const [addedRecently, setAddedRecently] = useState(false);
  const { addItem } = useCart();

  const handleDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAddedRecently(true);
    setTimeout(() => {
      setAddedRecently(false);
    }, 2200);
  };

  return (
    <div className="space-y-4 pt-2">
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
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="p-1 text-[#111111] disabled:opacity-30 disabled:cursor-not-allowed hover:text-[#777777] transition-colors cursor-pointer"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="font-mono text-sm font-semibold text-[#111111] px-3 select-none">
              {quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              aria-label="Increase quantity"
              className="p-1 text-[#111111] hover:text-[#777777] transition-colors cursor-pointer"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          className={`flex-1 h-13 flex items-center justify-center gap-2 px-8 uppercase tracking-[0.2em] text-xs font-semibold transition-all duration-300 border cursor-pointer ${
            addedRecently
              ? "bg-white text-[#111111] border-[#111111]"
              : "bg-[#111111] text-[#FFFFFF] border-[#111111] hover:bg-[#000000]"
          }`}
        >
          {addedRecently ? (
            <>
              <Check className="size-4 text-[#111111]" />
              <span>ADDED TO BAG ({quantity})</span>
            </>
          ) : (
            <>
              <ShoppingBag className="size-4" />
              <span>ADD TO CART · ${(product.price * quantity).toFixed(2)}</span>
            </>
          )}
        </button>
      </div>

      {addedRecently && (
        <p className="text-[11px] font-mono text-[#111111] tracking-wider animate-in fade-in duration-200">
          ✓ Added {quantity} × {product.name} to your session order.
        </p>
      )}
    </div>
  );
}
