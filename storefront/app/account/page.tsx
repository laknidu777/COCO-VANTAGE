'use client';

import React, { useCallback, useEffect, useState } from 'react';
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
  RefreshCw,
  AlertCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useCustomerAuth } from '@/lib/customer-auth';
import { AnnouncementBar } from '@/components/announcement-bar';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import {
  customerOrdersApi,
  CustomerOrderSummary,
  CustomerOrdersPagination,
} from '@/lib/customer-orders-api';
import { formatCurrency } from '@/lib/store-api';

export default function AccountPage() {
  const router = useRouter();
  const { customer, token, isAuthenticated, isLoading: isAuthLoading, logout } = useCustomerAuth();

  const [orders, setOrders] = useState<CustomerOrderSummary[]>([]);
  const [pagination, setPagination] = useState<CustomerOrdersPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(true);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace('/login?returnUrl=/account');
    }
  }, [isAuthLoading, isAuthenticated, router]);

  const fetchOrders = useCallback(
    async (pageToLoad: number) => {
      if (!token) return;
      setIsLoadingOrders(true);
      setOrderError(null);
      try {
        const response = await customerOrdersApi.listOrders(token, pageToLoad, 10);
        setOrders(response.data);
        setPagination(response.pagination);
        setCurrentPage(response.pagination.page);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to retrieve order history. Please check your connection and try again.';
        setOrderError(message);
      } finally {
        setIsLoadingOrders(false);
      }
    },
    [token],
  );

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchOrders(currentPage);
    }
  }, [isAuthenticated, token, currentPage, fetchOrders]);

  if (isAuthLoading || !isAuthenticated || !customer) {
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

  const formatOrderDate = (isoDate: string) => {
    try {
      return new Date(isoDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoDate;
    }
  };

  const getOrderStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    switch (s) {
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'SHIPPED':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'PROCESSING':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'CONFIRMED':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'CANCELLED':
        return 'bg-neutral-100 text-neutral-600 border-neutral-300';
      case 'PENDING':
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    switch (s) {
      case 'PAID':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'REFUNDED':
        return 'bg-neutral-100 text-neutral-600 border-neutral-300';
      case 'FAILED':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'PENDING':
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

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
              <div className="lg:col-span-4 space-y-6">
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

                {/* Session Security Card */}
                <div className="border border-[#E5E5E5] bg-white p-5 text-xs space-y-2 text-[#777777]">
                  <p className="font-mono text-[10px] uppercase tracking-wider font-semibold text-[#111111]">
                    Session Security
                  </p>
                  <p className="leading-relaxed">
                    Authentication is securely scoped to this browser session. Refreshing preserves your session via JWT token verification.
                  </p>
                </div>
              </div>

              {/* Right Column: Order History Section */}
              <div className="lg:col-span-8 space-y-6">
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
                          Purchases linked to your authenticated customer profile
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => fetchOrders(currentPage)}
                      disabled={isLoadingOrders}
                      className="inline-flex items-center gap-1 text-xs font-mono text-[#777777] hover:text-[#111111] transition-colors disabled:opacity-50"
                      title="Refresh Orders"
                    >
                      <RefreshCw className={`size-3.5 ${isLoadingOrders ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline">Refresh</span>
                    </button>
                  </div>

                  {/* Orders Content Area */}
                  {isLoadingOrders ? (
                    <div className="py-12 text-center space-y-3">
                      <div className="size-6 border-2 border-[#111111] border-t-transparent animate-spin mx-auto" />
                      <p className="text-xs font-mono uppercase tracking-wider text-[#777777]">
                        Retrieving your orders...
                      </p>
                    </div>
                  ) : orderError ? (
                    <div className="border border-red-200 bg-red-50/50 p-6 space-y-3">
                      <div className="flex items-start gap-2.5 text-red-800">
                        <AlertCircle className="size-4 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-xs font-mono font-medium uppercase tracking-wider">
                            Error loading order history
                          </p>
                          <p className="text-xs text-red-700">{orderError}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => fetchOrders(currentPage)}
                        className="inline-flex items-center gap-2 border border-red-300 bg-white px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-red-800 hover:bg-red-50 transition-colors"
                      >
                        <RefreshCw className="size-3" />
                        <span>Retry</span>
                      </button>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="border border-dashed border-[#E5E5E5] bg-[#F5F5F2] p-8 text-center space-y-3">
                      <Clock className="size-8 text-[#777777] mx-auto opacity-40" />
                      <p className="text-xs font-mono uppercase tracking-wider font-semibold text-[#111111]">
                        No orders placed yet
                      </p>
                      <p className="text-xs text-[#777777] max-w-md mx-auto leading-relaxed">
                        Orders placed while signed in to your COCO-VANTAGE customer account will appear here. Guest orders placed without signing in are not linked to your profile.
                      </p>
                      <div className="pt-2">
                        <Link
                          href="/shop"
                          className="inline-flex items-center gap-2 bg-[#111111] text-white py-2.5 px-4 text-xs font-mono uppercase tracking-wider hover:bg-[#333333] transition-colors"
                        >
                          <span>Explore The Collection</span>
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="border border-[#E5E5E5] bg-white p-5 hover:border-[#111111] transition-all duration-200 space-y-4 group"
                        >
                          {/* Order Header Row */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0F0F0] pb-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-semibold text-[#111111]">
                                  {order.orderNumber}
                                </span>
                                <span
                                  className={`inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border rounded-xs ${getOrderStatusBadge(
                                    order.status,
                                  )}`}
                                >
                                  {order.status}
                                </span>
                                <span
                                  className={`inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border rounded-xs ${getPaymentStatusBadge(
                                    order.paymentStatus,
                                  )}`}
                                >
                                  Payment: {order.paymentStatus}
                                </span>
                              </div>
                              <p className="text-[11px] font-mono text-[#777777] mt-1">
                                Placed on {formatOrderDate(order.createdAt)}
                              </p>
                            </div>

                            <div className="sm:text-right">
                              <p className="text-xs font-mono text-[#777777] uppercase">Total</p>
                              <p className="text-base font-mono font-semibold text-[#111111]">
                                {formatCurrency(order.totalAmount, order.currency)}
                              </p>
                            </div>
                          </div>

                          {/* Items Preview */}
                          <div className="text-xs text-[#777777] space-y-1">
                            {order.items.slice(0, 3).map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between font-mono text-[11px]"
                              >
                                <span className="text-[#333333] truncate max-w-[280px] sm:max-w-[420px]">
                                  {item.productName} ({item.variantName}) × {item.quantity}
                                </span>
                                <span className="text-[#777777] shrink-0">
                                  {formatCurrency(item.lineTotal, order.currency)}
                                </span>
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <p className="text-[10px] font-mono text-[#999999] pt-0.5">
                                + {order.items.length - 3} more item(s)
                              </p>
                            )}
                          </div>

                          {/* Order Footer Actions */}
                          <div className="flex items-center justify-between pt-2 border-t border-[#F5F5F5]">
                            <span className="text-[11px] font-mono text-[#777777]">
                              {order.itemsCount} {order.itemsCount === 1 ? 'item' : 'items'}
                            </span>
                            <Link
                              href={`/account/orders/${order.id}`}
                              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#111111] group-hover:underline font-medium"
                            >
                              <span>View Order Details</span>
                              <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                          </div>
                        </div>
                      ))}

                      {/* Pagination Controls */}
                      {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-[#E5E5E5] pt-4 font-mono text-xs">
                          <button
                            type="button"
                            disabled={currentPage <= 1 || isLoadingOrders}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            className="border border-[#E5E5E5] px-3 py-1.5 hover:border-[#111111] disabled:opacity-40 disabled:hover:border-[#E5E5E5] transition-colors"
                          >
                            Previous
                          </button>
                          <span className="text-[#777777]">
                            Page {pagination.page} of {pagination.totalPages}
                          </span>
                          <button
                            type="button"
                            disabled={currentPage >= pagination.totalPages || isLoadingOrders}
                            onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                            className="border border-[#E5E5E5] px-3 py-1.5 hover:border-[#111111] disabled:opacity-40 disabled:hover:border-[#E5E5E5] transition-colors"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  )}
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
