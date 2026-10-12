"use client";

import { useMemo, useState } from "react";
import {
  type DemonstrationProduct,
  type ProductCategory,
  type SortOption,
} from "@/lib/data/products";
import { CategoryFilter } from "@/components/products/CategoryFilter";
import { ProductSort } from "@/components/products/ProductSort";
import { ProductGrid } from "@/components/products/ProductGrid";

interface ShopCollectionClientProps {
  initialProducts: DemonstrationProduct[];
}

export function ShopCollectionClient({
  initialProducts,
}: ShopCollectionClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    "All Products" | ProductCategory
  >("All Products");
  const [selectedSort, setSelectedSort] = useState<SortOption>("featured");

  // Calculate live category counts based on full dataset
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      "All Products": initialProducts.length,
      Powder: 0,
      Sticks: 0,
      Blends: 0,
    };
    for (const p of initialProducts) {
      if (counts[p.category] !== undefined) {
        counts[p.category] += 1;
      }
    }
    return counts;
  }, [initialProducts]);

  // Filter and sort items dynamically without full-page reloads
  const filteredAndSortedProducts = useMemo(() => {
    // 1. Filter by category
    let result =
      selectedCategory === "All Products"
        ? [...initialProducts]
        : initialProducts.filter((p) => p.category === selectedCategory);

    // 2. Sort by selected option using numeric prices and localized string comparison
    result.sort((a, b) => {
      switch (selectedSort) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "featured":
        default:
          // Featured items first, then fallback to original order
          if (a.featured === b.featured) {
            return 0;
          }
          return a.featured ? -1 : 1;
      }
    });

    return result;
  }, [initialProducts, selectedCategory, selectedSort]);

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Controls Bar: Category Filter & Sort */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#E5E5E5]">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          categoryCounts={categoryCounts}
        />

        <div className="flex items-center justify-between md:justify-end gap-6">
          <span className="text-xs font-mono uppercase tracking-wider text-[#777777]">
            Showing {filteredAndSortedProducts.length}{" "}
            {filteredAndSortedProducts.length === 1 ? "Product" : "Products"}
          </span>
          <ProductSort
            selectedSort={selectedSort}
            onSelectSort={setSelectedSort}
          />
        </div>
      </div>

      {/* Product Grid */}
      <ProductGrid products={filteredAndSortedProducts} />
    </div>
  );
}
