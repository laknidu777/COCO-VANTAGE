import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function ProcessSection() {
  return (
    <section id="process" className="w-full bg-[#FFFFFF] border-b border-[#E5E5E5] overflow-hidden">
      <div className="mx-auto max-w-7xl flex flex-col lg:flex-row items-stretch">
        {/* Left Side: Large Monochrome Process Photography */}
        <div className="flex-1 relative min-h-[380px] lg:min-h-[620px] bg-[#111111] border-b lg:border-b-0 lg:border-r border-[#E5E5E5]">
          <Image
            src="/process.jpg"
            alt="Macro photographic cross-section of raw Ceylon cinnamon quills and activated coconut charcoal carbon structure"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center grayscale contrast-115"
          />
          <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-xs text-white text-[10px] font-mono uppercase tracking-widest px-3 py-1 border border-white/20">
            MATERIAL STUDY / 02
          </div>
        </div>

        {/* Right Side: Editorial Text Breakdown */}
        <div className="flex-1 flex flex-col justify-center px-6 py-16 sm:py-24 lg:px-16 lg:py-32 bg-[#FFFFFF]">
          <div className="max-w-xl space-y-8">
            <div className="space-y-3">
              <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#777777]">
                Product Philosophy
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light uppercase tracking-tight text-[#111111] leading-tight">
                THE ART OF A <br />
                <span className="font-semibold">DIFFERENT APPROACH</span>
              </h2>
            </div>

            <p className="text-sm sm:text-base leading-relaxed text-[#777777] font-normal">
              Our discipline centers on contrast and elemental composition. Rather than
              treating spice as a background note, we elevate cinnamon into an architectural
              centerpiece by pairing its aromatic profile with the deep, quiet presence of
              purified botanical charcoal.
            </p>

            <div className="space-y-4 border-t border-[#E5E5E5] pt-6">
              <div className="flex items-start gap-4">
                <span className="text-xs font-mono text-[#111111] font-semibold pt-0.5">01</span>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
                    Harmonized Contrasts
                  </h4>
                  <p className="text-xs text-[#777777] mt-1 leading-relaxed">
                    Balancing the warm, sharp notes of Ceylon bark against the neutral, absorbing character of charcoal carbon.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-xs font-mono text-[#111111] font-semibold pt-0.5">02</span>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
                    Refined Textural Presence
                  </h4>
                  <p className="text-xs text-[#777777] mt-1 leading-relaxed">
                    Developed with intentional particle consistency for versatile culinary and aesthetic presentation.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="#statement"
                className="inline-flex h-12 items-center justify-center gap-2 px-8 bg-transparent text-[#111111] hover:bg-[#111111] hover:text-white uppercase tracking-widest text-xs font-medium transition-all duration-200 border border-[#111111]"
              >
                <span>DISCOVER OUR APPROACH</span>
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
