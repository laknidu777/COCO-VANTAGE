export function BrandStatement() {
  return (
    <section id="story" className="w-full bg-[#111111] text-[#FFFFFF] border-b border-[#262626] py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="max-w-4xl space-y-8">
          <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#777777]">
            Brand Statement · Vision 01
          </p>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-light uppercase tracking-tight leading-[1.08] text-[#FFFFFF]">
            NOT ORDINARY CINNAMON. <br />
            <span className="font-semibold text-[#F5F5F2]">A DIFFERENT PERSPECTIVE.</span>
          </h2>

          <div className="w-16 h-px bg-[#777777]" />

          <p className="text-base sm:text-xl font-light leading-relaxed text-[#E5E5E5]/90 max-w-3xl">
            COCO-VANTAGE approaches cinnamon through the lens of architectural restraint and material
            depth. By uniting the clean, mineral structure of activated coconut charcoal with the warm,
            resonant character of pure cinnamon, we create an elevated botanical dialogue designed for
            those drawn to quiet intensity and refined craftsmanship.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-[#262626] text-xs font-mono uppercase tracking-widest text-[#777777]">
            <div>
              <span className="text-[#FFFFFF] block mb-1">MATERIAL PURITY</span>
              Monochrome botanical formulations crafted without extraneous additives.
            </div>
            <div>
              <span className="text-[#FFFFFF] block mb-1">EDITORIAL RESTRAINT</span>
              Balanced profiles conceived for contemporary culinary and sensory rituals.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
