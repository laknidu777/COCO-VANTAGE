import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AlertCircle, ArrowRight, ShoppingBag } from "lucide-react";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Checkout Cancelled",
  description: "Your checkout session was cancelled or interrupted.",
};

interface CheckoutCancelPageProps {
  searchParams: Promise<{
    order_id?: string;
  }>;
}

async function CancelContent({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const { order_id } = await searchParams;

  return (
    <div className="border border-[#111111] bg-white p-8 sm:p-14 text-center space-y-6 shadow-sm">
      {/* Minimalist Cancel Icon */}
      <div className="mx-auto flex size-16 items-center justify-center border border-[#111111] bg-[#F5F5F2]">
        <AlertCircle className="size-8 text-[#111111]" />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#777777]">
          Payment Session Interrupted
        </p>
        <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-tight text-[#111111]">
          CHECKOUT CANCELLED
        </h1>
        {order_id && (
          <p className="text-xs font-mono text-[#777777] truncate max-w-md mx-auto pt-1">
            Order Identifier: <span className="text-[#111111] font-semibold">{order_id}</span>
          </p>
        )}
      </div>

      <div className="border border-[#E5E5E5] bg-[#F5F5F2] p-5 text-left text-xs space-y-2 text-[#777777]">
        <p className="font-semibold text-[#111111] font-mono uppercase tracking-wider">
          No Payment Was Charged
        </p>
        <p className="leading-relaxed">
          Your payment session was paused or closed before completion. No funds were debited from your account.
        </p>
        <p className="leading-relaxed text-[11px]">
          You can return to your shopping cart to review your formulations or start a new checkout session whenever you are ready.
        </p>
      </div>

      {/* CTAs */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/cart"
          className="inline-flex items-center justify-center gap-2 h-13 px-8 bg-[#111111] text-white uppercase tracking-[0.2em] text-xs font-semibold hover:bg-black transition-colors w-full sm:w-auto"
        >
          <ShoppingBag className="size-4" />
          <span>RETURN TO CART</span>
        </Link>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center gap-2 h-13 px-8 border border-[#111111] bg-white text-[#111111] uppercase tracking-[0.2em] text-xs font-semibold hover:bg-[#F5F5F2] transition-colors w-full sm:w-auto"
        >
          <span>EXPLORE COLLECTION</span>
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}

function CancelSkeleton() {
  return (
    <div className="border border-[#E5E5E5] bg-white p-12 text-center space-y-4 animate-pulse">
      <div className="size-16 bg-[#E5E5E5] mx-auto" />
      <div className="h-8 w-64 bg-[#E5E5E5] mx-auto" />
      <div className="h-4 w-96 bg-[#E5E5E5] mx-auto" />
    </div>
  );
}

export default function CheckoutCancelPage({
  searchParams,
}: CheckoutCancelPageProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F5F2] text-[#111111] antialiased">
      <AnnouncementBar />
      <Navigation />

      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl px-6 space-y-8">
          <Suspense fallback={<CancelSkeleton />}>
            <CancelContent searchParams={searchParams} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
