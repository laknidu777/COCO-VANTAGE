import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F5F2] text-[#111111] antialiased">
      <AnnouncementBar />
      <Navigation />

      <main className="flex-1 flex items-center justify-center py-24 sm:py-32 px-6 lg:px-12">
        <div className="max-w-md w-full text-center space-y-6 border border-[#E5E5E5] bg-white p-10 sm:p-12">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-[#777777]">
            404 · SPEC NOT LOCATED
          </p>

          <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-tight text-[#111111]">
            PRODUCT NOT FOUND
          </h1>

          <p className="text-xs text-[#777777] leading-relaxed">
            The formulation or archive spec you are searching for does not exist or has been retired from the collection.
          </p>

          <div className="pt-4">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 w-full h-12 bg-[#111111] text-white uppercase tracking-widest text-xs font-semibold hover:bg-black transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              <span>RETURN TO THE COLLECTION</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
