"use client";

import { type SortOption, SORT_OPTIONS } from "@/lib/data/products";
import { ChevronDown } from "lucide-react";

interface ProductSortProps {
  selectedSort: SortOption;
  onSelectSort: (sort: SortOption) => void;
}

export function ProductSort({ selectedSort, onSelectSort }: ProductSortProps) {
  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="shop-sort-select"
        className="text-[11px] font-mono uppercase tracking-wider text-[#777777] shrink-0"
      >
        Sort By:
      </label>
      <div className="relative">
        <select
          id="shop-sort-select"
          value={selectedSort}
          onChange={(e) => onSelectSort(e.target.value as SortOption)}
          className="appearance-none bg-[#FFFFFF] text-[#111111] text-xs font-mono uppercase tracking-wider pl-3 pr-8 py-2 border border-[#E5E5E5] hover:border-[#111111] focus:border-[#111111] focus:outline-hidden transition-colors cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white text-[#111111]">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#111111]" />
      </div>
    </div>
  );
}
