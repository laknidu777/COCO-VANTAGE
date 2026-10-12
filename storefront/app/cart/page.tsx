import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { CartViewClient } from "@/components/cart/CartViewClient";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "View and manage your selected COCO-VANTAGE botanical formulations.",
};

export default function CartPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F5F2] text-[#111111] antialiased">
      {/* 1. Global Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Global Navigation */}
      <Navigation />

      <main className="flex-1">
        {/* Breadcrumb Navigation */}
        <section
          aria-label="Breadcrumb"
          className="w-full border-b border-[#E5E5E5] bg-[#F5F5F2]"
        >
          <div className="mx-auto max-w-7xl px-6 py-4 lg:px-12">
            <nav className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-[#777777]">
              <Link href="/" className="hover:text-[#111111] transition-colors">
                Home
              </Link>
              <ChevronRight className="size-3 text-[#777777]" />
              <span className="text-[#111111] font-semibold">Cart</span>
            </nav>
          </div>
        </section>

        {/* Cart Main Section */}
        <section className="w-full py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-12 space-y-10">
            {/* Header */}
            <div className="space-y-2 border-b border-[#E5E5E5] pb-6">
              <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#777777]">
                Order Selection
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light uppercase tracking-tight text-[#111111]">
                YOUR CART
              </h1>
            </div>

            {/* Interactive Cart Client Component */}
            <CartViewClient />
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
