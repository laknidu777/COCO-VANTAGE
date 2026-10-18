'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronRight,
  Package,
  ShieldAlert,
  CreditCard,
  MapPin,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useCustomerAuth } from '@/lib/customer-auth';
import { AnnouncementBar } from '@/components/announcement-bar';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import {
  customerOrdersApi,
  CustomerOrderDetail,
  CustomerAddress,
  ApiError,
} from '@/lib/customer-orders-api';
import { formatCurrency } from '@/lib/store-api';

import { Suspense } from 'react';

function OrderDetailContent() {
  const router = useRouter();
  const params = useParams();
  const orderId = typeof params?.id === 'string' ? params.id : '';

  const { token, isAuthenticated, isLoading: isAuthLoading } = useCustomerAuth();

  const [order, setOrder] = useState<CustomerOrderDetail | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState<boolean>(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Authenticate session gate
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace(`/login?returnUrl=/account/orders/${orderId}`);
    }
  }, [isAuthLoading, isAuthenticated, router, orderId]);

  const loadOrderDetail = useCallback(async () => {
    if (!token || !orderId) return;
    setIsLoadingOrder(true);
    setErrorStatus(null);
    setErrorMessage(null);

    try {
      const data = await customerOrdersApi.getOrder(token, orderId);
      setOrder(data);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorStatus(err.statusCode);
        if (err.statusCode === 404) {
          setErrorMessage(
            'Order not found. This order may not exist or does not belong to your customer profile.',
          );
        } else {
          setErrorMessage(err.message || 'Unable to retrieve order details.');
        }
      } else {
        setErrorStatus(500);
        setErrorMessage('A network error occurred while communicating with the server.');
      }
    } finally {
      setIsLoadingOrder(false);
    }
  }, [token, orderId]);

  useEffect(() => {
    if (isAuthenticated && token && orderId) {
      loadOrderDetail();
    }
  }, [isAuthenticated, token, orderId, loadOrderDetail]);

  if (isAuthLoading || (!isAuthenticated && !isAuthLoading)) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F5F5F2] text-[#111111] antialiased">
        <AnnouncementBar />
        <Navigation />
        <main className="flex-1 flex items-center justify-center py-24">
          <div className="text-center space-y-3">
            <div className="size-6 border-2 border-[#111111] border-t-transparent animate-spin mx-auto" />
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#777777]">
              Authenticating session...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formatOrderDate = (isoDate: string) => {
    try {
      return new Date(isoDate).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
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

  const renderAddress = (address?: CustomerAddress) => {
    if (!address) {
      return <p className="text-xs text-[#777777] italic">No address provided</p>;
    }
    return (
      <div className="space-y-1 font-mono text-xs text-[#333333]">
        <p className="font-semibold text-[#111111]">
          {address.firstName} {address.lastName}
        </p>
        <p>{address.address1}</p>
        {address.address2 && <p>{address.address2}</p>}
        <p>
          {address.city}
          {address.stateProvince ? `, ${address.stateProvince}` : ''} {address.postalCode}
        </p>
        <p className="uppercase">{address.country}</p>
      </div>
    );
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
              <Link href="/account" className="hover:text-[#111111] transition-colors">
                Customer Account
              </Link>
              <ChevronRight className="size-3 text-[#777777]" />
              <span className="text-[#111111] font-semibold">
                {order ? order.orderNumber : 'Order Details'}
              </span>
            </nav>
          </div>
        </section>

        {/* Content Container */}
        <section className="w-full py-10 sm:py-16">
          <div className="mx-auto max-w-5xl px-6 lg:px-12">
            {/* Back Button */}
            <div className="mb-6">
              <Link
                href="/account"
                className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#777777] hover:text-[#111111] transition-colors"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back to Order History</span>
              </Link>
            </div>

            {isLoadingOrder ? (
              <div className="border border-[#E5E5E5] bg-white p-12 text-center space-y-3 shadow-sm">
                <div className="size-6 border-2 border-[#111111] border-t-transparent animate-spin mx-auto" />
                <p className="text-xs font-mono uppercase tracking-wider text-[#777777]">
                  Retrieving order details...
                </p>
              </div>
            ) : errorStatus === 404 ? (
              <div className="border border-[#E5E5E5] bg-white p-10 text-center space-y-4 shadow-sm">
                <ShieldAlert className="size-10 text-[#777777] mx-auto opacity-50" />
                <h1 className="text-lg font-mono uppercase font-semibold text-[#111111]">
                  Order Not Found
                </h1>
                <p className="text-xs text-[#777777] max-w-md mx-auto leading-relaxed">
                  {errorMessage}
                </p>
                <div className="pt-2">
                  <Link
                    href="/account"
                    className="inline-flex items-center gap-2 bg-[#111111] text-white py-2.5 px-5 text-xs font-mono uppercase tracking-wider hover:bg-[#333333] transition-colors"
                  >
                    <span>Return to My Account</span>
                  </Link>
                </div>
              </div>
            ) : errorMessage ? (
              <div className="border border-red-200 bg-red-50/50 p-8 space-y-4 shadow-sm">
                <div className="flex items-start gap-3 text-red-800">
                  <AlertTriangle className="size-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-mono font-semibold uppercase tracking-wider">
                      Failed to load order
                    </p>
                    <p className="text-xs text-red-700">{errorMessage}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={loadOrderDetail}
                  className="inline-flex items-center gap-2 border border-red-300 bg-white px-4 py-2 text-xs font-mono uppercase tracking-wider text-red-800 hover:bg-red-50 transition-colors"
                >
                  <RefreshCw className="size-3.5" />
                  <span>Retry</span>
                </button>
              </div>
            ) : order ? (
              <div className="space-y-8">
                {/* Header Card */}
                <div className="border border-[#E5E5E5] bg-white p-6 sm:p-8 space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#E5E5E5] pb-6">
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-mono uppercase tracking-widest text-[#777777]">
                        Verified Customer Order
                      </p>
                      <h1 className="text-2xl sm:text-3xl font-light font-mono text-[#111111]">
                        {order.orderNumber}
                      </h1>
                      <p className="text-xs font-mono text-[#777777]">
                        Placed on {formatOrderDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-block px-2.5 py-1 text-xs font-mono uppercase tracking-wider border rounded-xs font-medium ${getOrderStatusBadge(
                            order.status,
                          )}`}
                        >
                          Status: {order.status}
                        </span>
                        <span
                          className={`inline-block px-2.5 py-1 text-xs font-mono uppercase tracking-wider border rounded-xs font-medium ${getPaymentStatusBadge(
                            order.paymentStatus,
                          )}`}
                        >
                          Payment: {order.paymentStatus}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-[#777777]">
                        Contact: <span className="text-[#111111]">{order.email}</span>
                      </p>
                    </div>
                  </div>

                  {/* Payment Presentation Notice */}
                  {order.paymentStatus === 'PENDING' && (
                    <div className="border border-amber-200 bg-amber-50/60 p-4 flex items-start gap-3 text-amber-900 text-xs font-mono">
                      <Info className="size-4 shrink-0 mt-0.5 text-amber-700" />
                      <div className="space-y-1 leading-relaxed">
                        <p className="font-semibold uppercase tracking-wider">
                          Payment Status: Pending Reconciliation
                        </p>
                        <p className="text-[11px] text-amber-800">
                          Your Stripe checkout session was initiated. Once Stripe webhook integration is completed in Phase 7, paid sessions will automatically update this status to PAID.
                        </p>
                      </div>
                    </div>
                  )}
                  {order.paymentStatus === 'PAID' && (
                    <div className="border border-emerald-200 bg-emerald-50/60 p-4 flex items-start gap-3 text-emerald-900 text-xs font-mono">
                      <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-emerald-700" />
                      <p className="font-semibold uppercase tracking-wider">
                        Payment Status: Confirmed & Paid
                      </p>
                    </div>
                  )}
                </div>

                {/* Items Card */}
                <div className="border border-[#E5E5E5] bg-white p-6 sm:p-8 space-y-6 shadow-sm">
                  <div className="flex items-center gap-3 border-b border-[#E5E5E5] pb-4">
                    <Package className="size-5 text-[#111111]" />
                    <h2 className="text-xs font-mono uppercase tracking-wider font-semibold text-[#111111]">
                      Ordered Formulations ({order.items.length})
                    </h2>
                  </div>

                  {/* Item Rows */}
                  <div className="divide-y divide-[#F0F0F0]">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
                      >
                        <div className="space-y-1">
                          <p className="font-semibold text-[#111111] text-sm">
                            {item.productName}
                          </p>
                          <p className="text-[#777777]">
                            Variant: <span className="text-[#333333]">{item.variantName}</span> · SKU: {item.sku}
                          </p>
                          <p className="text-[#777777]">
                            Qty: {item.quantity} × {formatCurrency(item.unitPrice, order.currency)}
                          </p>
                        </div>
                        <div className="sm:text-right font-semibold text-sm text-[#111111]">
                          {formatCurrency(item.lineTotal, order.currency)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Financial Breakdown */}
                  <div className="border-t border-[#E5E5E5] pt-6 space-y-3 font-mono text-xs max-w-sm ml-auto">
                    <div className="flex justify-between text-[#777777]">
                      <span>Subtotal</span>
                      <span className="text-[#111111]">{formatCurrency(order.subtotal, order.currency)}</span>
                    </div>
                    <div className="flex justify-between text-[#777777]">
                      <span>Shipping</span>
                      <span className="text-[#111111]">
                        {order.shippingAmount === 0
                          ? 'Complimentary'
                          : formatCurrency(order.shippingAmount, order.currency)}
                      </span>
                    </div>
                    {order.taxAmount > 0 && (
                      <div className="flex justify-between text-[#777777]">
                        <span>Estimated Tax</span>
                        <span className="text-[#111111]">{formatCurrency(order.taxAmount, order.currency)}</span>
                      </div>
                    )}
                    {order.discountAmount > 0 && (
                      <div className="flex justify-between text-green-700">
                        <span>Discount</span>
                        <span>-{formatCurrency(order.discountAmount, order.currency)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-[#E5E5E5] pt-3 text-sm font-semibold text-[#111111]">
                      <span>Order Total</span>
                      <span>{formatCurrency(order.totalAmount, order.currency)}</span>
                    </div>
                  </div>
                </div>

                {/* Addresses & Instructions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Shipping Address */}
                  <div className="border border-[#E5E5E5] bg-white p-6 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2 border-b border-[#E5E5E5] pb-3">
                      <MapPin className="size-4 text-[#111111]" />
                      <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-[#111111]">
                        Shipping Destination
                      </h3>
                    </div>
                    {renderAddress(order.shippingAddress as CustomerAddress)}
                  </div>

                  {/* Billing Address */}
                  <div className="border border-[#E5E5E5] bg-white p-6 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2 border-b border-[#E5E5E5] pb-3">
                      <CreditCard className="size-4 text-[#111111]" />
                      <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-[#111111]">
                        Billing Address
                      </h3>
                    </div>
                    {renderAddress(order.billingAddress as CustomerAddress)}
                  </div>
                </div>

                {/* Customer Note (if present) */}
                {order.customerNote && (
                  <div className="border border-[#E5E5E5] bg-white p-6 space-y-2 shadow-sm font-mono text-xs">
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-[#777777]">
                      Order Instructions / Notes
                    </p>
                    <p className="text-[#333333] leading-relaxed italic">
                      "{order.customerNote}"
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col bg-[#F5F5F2] text-[#111111] antialiased">
          <AnnouncementBar />
          <Navigation />
          <main className="flex-1 flex items-center justify-center py-24">
            <div className="text-center space-y-3">
              <div className="size-6 border-2 border-[#111111] border-t-transparent animate-spin mx-auto" />
              <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#777777]">
                Loading order parameters...
              </p>
            </div>
          </main>
          <Footer />
        </div>
      }
    >
      <OrderDetailContent />
    </Suspense>
  );
}

