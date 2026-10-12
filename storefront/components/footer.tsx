import Link from "next/link";

export function Footer() {
  return (
    <footer id="contact" className="w-full bg-[#111111] text-[#FFFFFF] border-t border-[#262626]">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12 lg:py-24">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 pb-16 border-b border-[#262626]">
          {/* Brand & Wordmark Description */}
          <div className="lg:col-span-2 space-y-5">
            <Link
              href="/"
              className="text-lg font-bold tracking-[0.25em] uppercase text-[#FFFFFF] hover:opacity-80 transition-opacity"
            >
              COCO—VANTAGE
            </Link>
            <p className="text-xs text-[#777777] leading-relaxed max-w-sm">
              Architectural, minimal, and sophisticated formulations crafted from pure
              activated coconut charcoal and single-origin botanical cinnamon.
            </p>
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#777777]">
              Studio Location: Colombo · Global Dispatch
            </div>
          </div>

          {/* Shop Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-[#FFFFFF]">
              Shop
            </h4>
            <ul className="space-y-2.5 text-xs text-[#777777]">
              <li>
                <Link href="#collection" className="hover:text-white transition-colors">
                  All Formulations
                </Link>
              </li>
              <li>
                <Link href="#collection" className="hover:text-white transition-colors">
                  Charcoal Cinnamon Powder
                </Link>
              </li>
              <li>
                <Link href="#collection" className="hover:text-white transition-colors">
                  Charcoal Cinnamon Sticks
                </Link>
              </li>
              <li>
                <Link href="#collection" className="hover:text-white transition-colors">
                  Signature Cinnamon Blend
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-[#FFFFFF]">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs text-[#777777]">
              <li>
                <Link href="#story" className="hover:text-white transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="#process" className="hover:text-white transition-colors">
                  The Process
                </Link>
              </li>
              <li>
                <Link href="#story" className="hover:text-white transition-colors">
                  Brand Philosophy
                </Link>
              </li>
              <li>
                <Link href="#contact" className="hover:text-white transition-colors">
                  Press Inquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Inquiries */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-[#FFFFFF]">
              Inquiries
            </h4>
            <ul className="space-y-2.5 text-xs text-[#777777]">
              <li>
                <span className="block text-[#FFFFFF]/90">concierge@coco-vantage.com</span>
              </li>
              <li>
                <span className="block text-[#777777]">Mon – Fri, 09:00 – 18:00 GMT</span>
              </li>
              <li className="pt-2">
                <span className="inline-block border border-[#262626] px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-[#777777]">
                  Private Client Desk
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono uppercase tracking-wider text-[#777777]">
          <p>© 2026 COCO—VANTAGE. All rights reserved.</p>

          <div className="flex items-center space-x-6 text-[11px]">
            <Link href="#privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <span className="text-[#444444]">|</span>
            <span className="text-[#444444]">Demonstration Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
