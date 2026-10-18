"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useCustomerAuth } from "@/lib/customer-auth";

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalCount } = useCart();
  const { isAuthenticated, customer } = useCustomerAuth();

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#F5F5F2]/90 backdrop-blur-md border-b border-[#E5E5E5] transition-all">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12">
        {/* Left: Brand Wordmark */}
        <div className="flex items-center">
          <Link
            href="/"
            className="text-lg md:text-xl font-bold tracking-[0.25em] uppercase text-[#111111] hover:opacity-70 transition-opacity"
          >
            COCO—VANTAGE
          </Link>
        </div>

        {/* Center / Desktop Links */}
        <div className="hidden md:flex items-center space-x-10">
          <Link
            href="/shop"
            className="text-xs uppercase tracking-[0.2em] font-medium text-[#111111] hover:text-[#777777] transition-colors"
          >
            Shop
          </Link>
          <Link
            href="/#story"
            className="text-xs uppercase tracking-[0.2em] font-medium text-[#111111] hover:text-[#777777] transition-colors"
          >
            Our Story
          </Link>
          <Link
            href="/#process"
            className="text-xs uppercase tracking-[0.2em] font-medium text-[#111111] hover:text-[#777777] transition-colors"
          >
            The Process
          </Link>
          <Link
            href="/#contact"
            className="text-xs uppercase tracking-[0.2em] font-medium text-[#111111] hover:text-[#777777] transition-colors"
          >
            Contact
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-5">
          <button
            type="button"
            aria-label="Search collection"
            className="p-1.5 text-[#111111] hover:text-[#777777] transition-colors"
          >
            <Search className="size-4.5" />
          </button>
          <Link
            href={isAuthenticated ? "/account" : "/login"}
            aria-label={isAuthenticated ? `Customer Account (${customer?.email})` : "Account sign in"}
            className="relative p-1.5 text-[#111111] hover:text-[#777777] transition-colors"
          >
            <User className="size-4.5" />
            {isAuthenticated && (
              <span className="absolute top-1 right-1 size-1.5 rounded-full bg-[#111111]" />
            )}
          </Link>
          <Link
            href="/cart"
            aria-label={`Shopping bag, ${totalCount} items`}
            className="relative p-1.5 text-[#111111] hover:text-[#777777] transition-colors"
          >
            <ShoppingBag className="size-4.5" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center bg-black text-[9px] font-mono font-semibold text-white">
              {totalCount}
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle mobile menu"
            className="p-1.5 text-[#111111] md:hidden hover:opacity-70 transition-opacity"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E5E5] bg-[#F5F5F2] px-6 py-8 space-y-6 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-5 text-sm uppercase tracking-[0.25em] font-medium">
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#111111] hover:text-[#777777] transition-colors py-1"
            >
              Shop
            </Link>
            <Link
              href="/#story"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#111111] hover:text-[#777777] transition-colors py-1"
            >
              Our Story
            </Link>
            <Link
              href="/#process"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#111111] hover:text-[#777777] transition-colors py-1"
            >
              The Process
            </Link>
            <Link
              href="/#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#111111] hover:text-[#777777] transition-colors py-1"
            >
              Contact
            </Link>
            <Link
              href={isAuthenticated ? "/account" : "/login"}
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#111111] hover:text-[#777777] transition-colors py-1 flex items-center justify-between border-t border-[#E5E5E5] pt-3"
            >
              <span>{isAuthenticated ? "My Account" : "Sign In"}</span>
              {isAuthenticated && (
                <span className="text-[10px] font-mono text-[#777777]">Active</span>
              )}
            </Link>
          </div>
          <div className="pt-4 border-t border-[#E5E5E5] text-[11px] font-mono uppercase text-[#777777]">
            Monochrome Formulation · CV-2026
          </div>
        </div>
      )}
    </nav>
  );
}
