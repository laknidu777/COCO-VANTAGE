import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ChevronRight, AlertCircle } from "lucide-react";
import { storeApi, type StoreProduct, type StoreCategory } from "@/lib/store-api";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ShopCollectionClient } from "@/components/products/ShopCollectionClient";

export const metadata: Metadata = {
  title: "The Collection",
  description:
    "Explore our considered collection of cinnamon products, presented with a distinctive perspective.",
};

async function ShopContent() {
  let products: StoreProduct[] = [];
  let categories: StoreCategory[] = [];
  let errorMessage: string | null = null;

  try {
    const [productsResult, categoriesResult] = await Promise.all([
      storeApi.getProducts({ page: 1, limit: 50 }),
      storeApi.getCategories(),
    ]);

    products = productsResult.products;
    categories = categoriesResult;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load product catalog";
    errorMessage = `Unable to connect to product catalog (${msg}). Please verify backend service is running.`;
  }

  if (errorMessage) {
    return (
      <div className="border border-[#111111] bg-white p-8 sm:p-12 text-center space-y-4 max-w-xl mx-auto shadow-sm">
        <AlertCircle className="size-8 text-[#111111] mx-auto" />
        <h2 className="text-lg font-mono uppercase tracking-wider text-[#111111]">
          Catalog Unavailable
        </h2>
        <p className="text-xs text-[#777777] leading-relaxed">
          {errorMessage}
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-block bg-[#111111] text-white py-2.5 px-6 text-xs font-mono uppercase tracking-wider hover:bg-[#333333] transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ShopCollectionClient
      initialProducts={products}
      categories={categories}
    />
  );
}

function ShopSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      {/* Category tabs skeleton */}
      <div className="flex flex-wrap gap-2 border-b border-[#E5E5E5] pb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-9 w-24 bg-[#E5E5E5]" />
        ))}
      </div>
      {/* Search & Sort skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="h-10 w-full sm:w-72 bg-[#E5E5E5]" />
        <div className="h-10 w-48 bg-[#E5E5E5]" />
      </div>
      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-4 border border-[#E5E5E5] bg-white p-4">
            <div className="aspect-[4/5] bg-[#E5E5E5]" />
            <div className="h-4 w-3/4 bg-[#E5E5E5]" />
            <div className="h-3 w-1/2 bg-[#E5E5E5]" />
            <div className="h-5 w-1/3 bg-[#E5E5E5]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ShopPage() {
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
                  Curated Catalog · Botanical Formulations
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light uppercase tracking-tight text-[#111111]">
                  THE COLLECTION
                </h1>
                <p className="text-sm sm:text-base text-[#777777] leading-relaxed max-w-xl">
                  Explore our considered collection of single-origin cinnamon and activated coconut charcoal formulations.
                </p>
              </div>

              <div className="space-y-1 text-left md:text-right">
                <span className="inline-block border border-[#E5E5E5] bg-[#FFFFFF] px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-[#111111]">
                  Single-Origin Botanical Catalog
                </span>
                <p className="text-[10px] font-mono text-[#777777] uppercase tracking-wider">
                  Live Database Catalog · Real-Time Availability
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* C. Collection Interactive Grid with Category Filtering & Sorting */}
        <section className="w-full bg-[#F5F5F2] py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-12">
            <Suspense fallback={<ShopSkeleton />}>
              <ShopContent />
            </Suspense>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
