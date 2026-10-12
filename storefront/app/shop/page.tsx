import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { DEMO_PRODUCTS } from "@/lib/data/products";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ShopCollectionClient } from "@/components/products/ShopCollectionClient";

export const metadata: Metadata = {
  title: "The Collection",
  description:
    "Explore our considered collection of cinnamon products, presented with a distinctive perspective.",
};

export default function ShopPage() {
  const totalCount = DEMO_PRODUCTS.length;

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F5F2] text-[#111111] antialiased">
      {/* 1. Global Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Global Navigation */}
      <Navigation />

      <main className="flex-1">
        {/* A. Breadcrumb */}
        <section aria-label="Breadcrumb" className="w-full border-b border-[#E5E5E5] bg-[#F5F5F2]">
          <div className="mx-auto max-w-7xl px-6 py-4 lg:px-12">
            <nav className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-[#777777]">
              <Link
                href="/"
                className="hover:text-[#111111] transition-colors"
              >
                Home
              </Link>
              <ChevronRight className="size-3 text-[#777777]" />
              <span className="text-[#111111] font-semibold">Shop</span>
            </nav>
          </div>
        </section>

        {/* B. Collection Introduction */}
        <section className="w-full border-b border-[#E5E5E5] bg-[#F5F5F2] py-14 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-12 space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#777777]">
                  Curated Catalog · {totalCount} Formulations
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light uppercase tracking-tight text-[#111111]">
                  THE COLLECTION
                </h1>
                <p className="text-sm sm:text-base text-[#777777] leading-relaxed max-w-xl">
                  Explore our considered collection of cinnamon products, presented with a distinctive perspective.
                </p>
              </div>

              <div className="space-y-1 text-left md:text-right">
                <span className="inline-block border border-[#E5E5E5] bg-[#FFFFFF] px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-[#111111]">
                  Demonstration Catalog
                </span>
                <p className="text-[10px] font-mono text-[#777777] uppercase tracking-wider">
                  Provisional concepts · Not available for commercial sale
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* C, D, E. Collection Interactive Grid with Category Filtering & Sorting */}
        <section className="w-full bg-[#F5F5F2] py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-12">
            <ShopCollectionClient initialProducts={DEMO_PRODUCTS} />
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
