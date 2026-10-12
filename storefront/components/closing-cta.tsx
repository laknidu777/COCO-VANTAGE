import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function ClosingCta() {
  return (
    <section className="relative w-full bg-[#000000] text-[#FFFFFF] py-28 sm:py-36 lg:py-44 border-b border-[#262626] overflow-hidden">
      {/* Subtle architectural grid lines */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12 text-center space-y-8">
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-[#777777]">
          COCO—VANTAGE · DEFINITIVE FORMULATIONS
        </p>

        <h2 className="text-4xl sm:text-6xl lg:text-7xl font-light uppercase tracking-tight text-[#FFFFFF] leading-[1.05]">
          SEE CINNAMON <br />
          <span className="font-semibold text-[#F5F5F2]">DIFFERENTLY.</span>
        </h2>

        <p className="text-sm sm:text-base text-[#777777] max-w-md mx-auto font-normal">
          An intentional study in botanical depth and monochrome distinction.
        </p>

        <div className="pt-4 flex justify-center">
          <Link
            href="/shop"
            className="inline-flex h-13 items-center justify-center gap-2 px-10 bg-[#FFFFFF] text-[#000000] hover:bg-[#F5F5F2] uppercase tracking-[0.2em] text-xs font-semibold transition-all duration-200 border border-[#FFFFFF]"
          >
            <span>SHOP THE COLLECTION</span>
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
