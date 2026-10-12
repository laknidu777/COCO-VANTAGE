import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck, Lock } from "lucide-react";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Checkout | COCO-VANTAGE",
  description: "Secure order checkout demonstration.",
};

export default function CheckoutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F5F2] text-[#111111] antialiased">
      <AnnouncementBar />
      <Navigation />

      <main className="flex-1 flex items-center justify-center py-20 sm:py-28 px-6 lg:px-12">
        <div className="max-w-lg w-full text-center space-y-8 border border-[#E5E5E5] bg-white p-10 sm:p-14 shadow-xs">
          <div className="mx-auto flex size-14 items-center justify-center border border-[#111111] bg-[#F5F5F2]">
            <Lock className="size-6 text-[#111111]" />
          </div>

          <div className="space-y-3">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#777777]">
              Step 2 of 2 · Checkout
            </p>
            <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-tight text-[#111111]">
              CHECKOUT SYSTEM
            </h1>
            <p className="text-sm text-[#777777] leading-relaxed max-w-md mx-auto">
              The secure payment and customer shipping pipeline is scheduled for implementation in the next phase. No real transactions or card charges are processed in this demonstration environment.
            </p>
          </div>

          <div className="border border-[#E5E5E5] bg-[#F5F5F2] p-4 text-[11px] font-mono text-[#777777] flex items-center justify-center gap-2">
            <ShieldCheck className="size-4 text-[#111111]" />
            <span>Architecture Specification · Ready for Medusa / Stripe Integration</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <Link
              href="/cart"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-1/2 h-12 border border-[#E5E5E5] text-[#111111] uppercase tracking-widest text-xs font-semibold hover:border-[#111111] transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              <span>RETURN TO CART</span>
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-1/2 h-12 bg-[#111111] text-white uppercase tracking-widest text-xs font-semibold hover:bg-black transition-colors"
            >
              <span>EXPLORE SHOP</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
