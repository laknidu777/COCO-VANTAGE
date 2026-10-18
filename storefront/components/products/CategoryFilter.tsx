"use client";

interface CategoryFilterProps {
  categories?: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categoryCounts?: Record<string, number>;
}

const DEFAULT_CATEGORIES = ["All Products", "Powder", "Sticks", "Blends"];

export function CategoryFilter({
  categories = DEFAULT_CATEGORIES,
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}: CategoryFilterProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter products by category"
      className="flex flex-wrap items-center gap-2 sm:gap-3"
    >
      {categories.map((category) => {
        const isActive = selectedCategory === category;
        const count = categoryCounts ? categoryCounts[category] : undefined;

        return (
          <button
            key={category}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelectCategory(category)}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
              isActive
                ? "bg-[#111111] text-[#FFFFFF] border-[#111111] font-semibold"
                : "bg-transparent text-[#777777] border-[#E5E5E5] hover:text-[#111111] hover:border-[#111111]"
            }`}
          >
            <span>{category}</span>
            {typeof count === "number" && (
              <span
                className={`ml-1.5 text-[10px] ${
                  isActive ? "text-[#E5E5E5]" : "text-[#777777]"
                }`}
              >
                ({count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
