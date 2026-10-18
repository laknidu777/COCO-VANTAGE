'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  ShoppingBag,
  LogOut,
  ChevronRight,
  ShieldCheck,
  PackageCheck,
  ArrowRight,
} from 'lucide-react';
import { useCustomerAuth } from '@/lib/customer-auth';
import { AnnouncementBar } from '@/components/announcement-bar';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';

export default function AccountPage() {
  const router = useRouter();
  const { customer, isAuthenticated, isLoading, logout } = useCustomerAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login?returnUrl=/account');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated || !customer) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F5F5F2] text-[#111111] antialiased">
        <AnnouncementBar />
        <Navigation />
        <main className="flex-1 flex items-center justify-center py-24">
          <div className="text-center space-y-3">
            <div className="size-6 border-2 border-[#111111] border-t-transparent animate-spin mx-auto" />
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#777777]">
              Authenticating customer profile...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const memberSince = customer.createdAt
    ? new Date(customer.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Active Member';

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F5F2] text-[#111111] antialiased">
      <AnnouncementBar />
      <Navigation />

      <main className="flex-1">
        {/* Breadcrumb */}
        <section
          aria-label="Breadcrumb"
          className="w-full border-b border-[#E5E5E5] bg-[#F5F5F2]"
        >
          <div className="mx-auto max-w-7xl px-6 py-4 lg:px-12">
            <nav className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-[#777777]">
              <Link href="/" className="hover:text-[#111111] transition-colors">
                Home
              </Link>
              <ChevronRight className="size-3 text-[#777777]" />
              <span className="text-[#111111] font-semibold">Customer Account</span>
            </nav>
          </div>
        </section>

        {/* Account Header */}
        <section className="w-full border-b border-[#E5E5E5] bg-[#F5F5F2] py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#777777]">
                  Customer Account Dashboard
                </p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light uppercase tracking-tight text-[#111111]">
                  MY ACCOUNT
                </h1>
                <p className="text-xs font-mono text-[#777777]">
                  Signed in as{' '}
                  <span className="font-semibold text-[#111111]">{customer.email}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-2 border border-[#111111] bg-transparent px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-[#111111] hover:bg-[#111111] hover:text-white transition-colors cursor-pointer"
                >
                  <LogOut className="size-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Account Body Grid */}
        <section className="w-full py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Profile Card */}
              <div className="lg:col-span-5 space-y-6">
                <div className="border border-[#E5E5E5] bg-white p-6 sm:p-8 space-y-6 shadow-sm">
                  <div className="flex items-center gap-3 border-b border-[#E5E5E5] pb-4">
                    <div className="flex size-10 items-center justify-center border border-[#111111] bg-[#F5F5F2]">
                      <User className="size-5 text-[#111111]" />
                    </div>
                    <div>
                      <h2 className="text-xs font-mono uppercase tracking-wider font-semibold text-[#111111]">
                        Profile Overview
                      </h2>
                      <p className="text-[11px] text-[#777777] font-mono">
                        Collector ID: {customer.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <dl className="space-y-4 text-xs font-mono">
                    <div className="flex justify-between border-b border-[#F0F0F0] pb-2">
                      <dt className="text-[#777777] uppercase">Account Email</dt>
                      <dd className="text-[#111111] font-medium">{customer.email}</dd>
                    </div>
                    <div className="flex justify-between border-b border-[#F0F0F0] pb-2">
                      <dt className="text-[#777777] uppercase">Tier Role</dt>
                      <dd className="text-[#111111] font-medium">{customer.role}</dd>
                    </div>
                    <div className="flex justify-between border-b border-[#F0F0F0] pb-2">
                      <dt className="text-[#777777] uppercase">Member Since</dt>
                      <dd className="text-[#111111] font-medium">{memberSince}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#777777] uppercase">Status</dt>
                      <dd className="text-green-700 font-medium flex items-center gap-1">
                        <ShieldCheck className="size-3" />
                        <span>Verified Active</span>
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Secure Session Note */}
                <div className="border border-[#E5E5E5] bg-white p-5 text-xs space-y-2 text-[#777777]">
                  <p className="font-mono text-[10px] uppercase tracking-wider font-semibold text-[#111111]">
                    Session Security
                  </p>
                  <p className="leading-relaxed">
                    Authentication is securely scoped to this browser session. Refreshing the browser preserves your session via JWT token verification.
                  </p>
                </div>
              </div>

              {/* Right Column: Quick Actions & Orders Section */}
              <div className="lg:col-span-7 space-y-6">
                <div className="border border-[#E5E5E5] bg-white p-6 sm:p-8 space-y-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center border border-[#111111] bg-[#F5F5F2]">
                        <PackageCheck className="size-5 text-[#111111]" />
                      </div>
                      <div>
                        <h2 className="text-xs font-mono uppercase tracking-wider font-semibold text-[#111111]">
                          Order History
                        </h2>
                        <p className="text-[11px] text-[#777777] font-mono">
                          Recent purchases & tracking status
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-dashed border-[#E5E5E5] bg-[#F5F5F2] p-8 text-center space-y-3">
                    <p className="text-xs font-mono uppercase tracking-wider text-[#111111]">
                      No active orders found
                    </p>
                    <p className="text-xs text-[#777777] max-w-sm mx-auto">
                      Explore our single-origin charcoal and cinnamon collection to place your first formulation order.
                    </p>
                    <div className="pt-2">
                      <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 bg-[#111111] text-white py-2.5 px-4 text-xs font-mono uppercase tracking-wider hover:bg-[#333333] transition-colors"
                      >
                        <span>Browse Collection</span>
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Fast Access Shortcuts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link
                    href="/cart"
                    className="border border-[#E5E5E5] bg-white p-5 flex items-center justify-between group hover:border-[#111111] transition-colors shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="size-5 text-[#111111]" />
                      <div>
                        <p className="text-xs font-mono uppercase font-semibold text-[#111111]">
                          Shopping Bag
                        </p>
                        <p className="text-[11px] text-[#777777]">
                          Review selected formulations
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-[#777777] group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    href="/shop"
                    className="border border-[#E5E5E5] bg-white p-5 flex items-center justify-between group hover:border-[#111111] transition-colors shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <ArrowRight className="size-5 text-[#111111]" />
                      <div>
                        <p className="text-xs font-mono uppercase font-semibold text-[#111111]">
                          The Collection
                        </p>
                        <p className="text-[11px] text-[#777777]">
                          View all formulations
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-[#777777] group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
