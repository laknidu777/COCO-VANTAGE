import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative w-full border-b border-[#E5E5E5] bg-[#F5F5F2] overflow-hidden">
      <div className="mx-auto max-w-7xl min-h-[75vh] lg:min-h-[85vh] flex flex-col lg:flex-row items-stretch">
        {/* Left Editorial Copy Area */}
        <div className="flex-1 flex flex-col justify-center px-6 py-16 sm:py-24 lg:px-12 lg:py-32 z-10">
          <div className="max-w-xl space-y-8">
            <div className="inline-flex items-center gap-2 border border-[#111111]/20 bg-white/60 px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.2em] text-[#111111]">
              <span className="h-1.5 w-1.5 bg-[#111111] inline-block" />
              Charcoal Botanical Formulation
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight text-[#111111] uppercase leading-[1.02]">
              REIMAGINING <br />
              <span className="font-semibold">CINNAMON.</span>
            </h1>

            <p className="text-base sm:text-lg leading-relaxed text-[#777777] max-w-lg font-normal">
              A bold new expression of a timeless spice. Crafted for those who appreciate
              depth, character, and distinction.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <Link
                href="/shop"
                className="inline-flex h-13 items-center justify-center gap-2 px-8 bg-[#111111] text-white hover:bg-black uppercase tracking-widest text-xs font-medium transition-all duration-200 border border-[#111111]"
              >
                <span>EXPLORE THE COLLECTION</span>
                <ArrowUpRight className="size-4" />
              </Link>
              <Link
                href="#process"
                className="inline-flex h-13 items-center justify-center px-8 bg-transparent text-[#111111] hover:bg-[#111111] hover:text-white uppercase tracking-widest text-xs font-medium transition-all duration-200 border border-[#111111]"
              >
                OUR PROCESS
              </Link>
            </div>
          </div>
        </div>

        {/* Right Large Product Photograph */}
        <div className="flex-1 relative min-h-[380px] lg:min-h-full bg-[#111111] border-t lg:border-t-0 lg:border-l border-[#E5E5E5]">
          <Image
            src="/hero.jpg"
            alt="COCO-VANTAGE luxury charcoal cinnamon cylinder container on dark architectural stone"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center grayscale contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent lg:hidden" />
          <div className="absolute bottom-4 right-4 hidden lg:block bg-black/80 backdrop-blur-xs text-white text-[10px] font-mono uppercase tracking-widest px-3 py-1 border border-white/20">
            FIG. 01 / OBSIDIAN VESSEL
          </div>
        </div>
      </div>
    </section>
  );
}
