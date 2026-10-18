import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CheckCircle2, ArrowRight, ShieldCheck, Package } from "lucide-react";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Order Received",
  description: "Your COCO-VANTAGE order has been placed successfully.",
};

interface CheckoutSuccessPageProps {
  searchParams: Promise<{
    session_id?: string;
  }>;
}

async function SuccessContent({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  return (
    <div className="border border-[#111111] bg-white p-8 sm:p-14 text-center space-y-6 shadow-sm">
      {/* Minimalist Success Icon */}
      <div className="mx-auto flex size-16 items-center justify-center border border-[#111111] bg-[#F5F5F2]">
        <CheckCircle2 className="size-8 text-[#111111]" />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#777777]">
          Botanical Allocation Registered
        </p>
        <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-tight text-[#111111]">
          ORDER RECEIVED
        </h1>
        {session_id && (
          <p className="text-xs font-mono text-[#777777] truncate max-w-md mx-auto pt-1">
            Stripe Session Reference: <span className="text-[#111111] font-semibold">{session_id}</span>
          </p>
        )}
      </div>

      {/* Reconciliation Notice */}
      <div className="border border-[#E5E5E5] bg-[#F5F5F2] p-5 text-left text-xs space-y-2 text-[#777777]">
        <div className="flex items-center gap-2 text-[#111111] font-semibold font-mono uppercase tracking-wider">
          <ShieldCheck className="size-4 text-green-700" />
          <span>Payment Processing Status</span>
        </div>
        <p className="leading-relaxed">
          Your payment session was completed through Stripe. Automated background webhook event reconciliation and permanent order status updates will be finalized in the upcoming integration phase.
        </p>
        <p className="leading-relaxed text-[11px]">
          Your single-origin botanical inventory has been allocated. A formal electronic dispatch notice will be transmitted to your email address once packaged.
        </p>
      </div>

      {/* CTAs */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/shop"
          className="inline-flex items-center justify-center gap-2 h-13 px-8 bg-[#111111] text-white uppercase tracking-[0.2em] text-xs font-semibold hover:bg-black transition-colors w-full sm:w-auto cursor-pointer"
        >
          <span>RETURN TO THE COLLECTION</span>
          <ArrowRight className="size-4" />
        </Link>
        <Link
          href="/account"
          className="inline-flex items-center justify-center gap-2 h-13 px-8 border border-[#111111] bg-white text-[#111111] uppercase tracking-[0.2em] text-xs font-semibold hover:bg-[#F5F5F2] transition-colors w-full sm:w-auto"
        >
          <Package className="size-4" />
          <span>MY ACCOUNT</span>
        </Link>
      </div>
    </div>
  );
}

function SuccessSkeleton() {
  return (
    <div className="border border-[#E5E5E5] bg-white p-12 text-center space-y-4 animate-pulse">
      <div className="size-16 bg-[#E5E5E5] mx-auto" />
      <div className="h-8 w-64 bg-[#E5E5E5] mx-auto" />
      <div className="h-4 w-96 bg-[#E5E5E5] mx-auto" />
    </div>
  );
}

export default function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F5F2] text-[#111111] antialiased">
      <AnnouncementBar />
      <Navigation />

      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl px-6 space-y-8">
          <Suspense fallback={<SuccessSkeleton />}>
            <SuccessContent searchParams={searchParams} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
