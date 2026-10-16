'use client';

import React, { useEffect, useState } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  X,
  CreditCard,
  User,
  Package,
} from 'lucide-react';
import { useAdminAuth } from '@/lib/admin-auth';
import { adminApi, AdminApiError } from '@/lib/admin-api';
import { ApiOrder, OrderStatus } from '@/lib/admin-types';

const STATUS_OPTIONS: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
];

const DEMO_ORDERS: ApiOrder[] = [
  {
    id: 'demo-ord-101',
    orderNumber: 'CV-ORD-8821',
    userId: null,
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    total: 8200,
    subtotal: 8200,
    tax: 0,
    shippingFee: 0,
    currency: 'USD',
    customerEmail: 'elena.rostova@atelier-nordic.com',
    customerName: 'Elena Rostova',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    _count: { items: 2 },
    items: [
      {
        id: 'item-1',
        orderId: 'demo-ord-101',
        variantId: 'v-1',
        productName: 'Charcoal Cinnamon Powder',
        variantName: '120g / 4.2 oz Matte Jar',
        sku: 'CV-POW-001',
        quantity: 2,
        unitPrice: 1599,
        totalPrice: 3198,
      },
      {
        id: 'item-2',
        orderId: 'demo-ord-101',
        variantId: 'v-2',
        productName: 'Signature Cinnamon Blend',
        variantName: '240g / 8.5 oz Container',
        sku: 'CV-BLN-001',
        quantity: 2,
        unitPrice: 2499,
        totalPrice: 4998,
      },
    ],
    payments: [
      {
        id: 'pay-1',
        orderId: 'demo-ord-101',
        amount: 8200,
        currency: 'USD',
        status: 'PAID',
        provider: 'STRIPE',
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
    ],
  },
  {
    id: 'demo-ord-102',
    orderNumber: 'CV-ORD-8820',
    userId: null,
    status: 'PENDING',
    paymentStatus: 'PENDING',
    total: 3800,
    subtotal: 3800,
    tax: 0,
    shippingFee: 0,
    currency: 'USD',
    customerEmail: 'marcus.vane@arch-design.org',
    customerName: 'Marcus Vane',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    _count: { items: 1 },
    items: [
      {
        id: 'item-3',
        orderId: 'demo-ord-102',
        variantId: 'v-3',
        productName: 'Premium Cinnamon Sticks',
        variantName: '100g / 3.5 oz Quills',
        sku: 'CV-STK-001',
        quantity: 2,
        unitPrice: 1899,
        totalPrice: 3798,
      },
    ],
  },
  {
    id: 'demo-ord-103',
    orderNumber: 'CV-ORD-8819',
    userId: null,
    status: 'SHIPPED',
    paymentStatus: 'PAID',
    total: 12400,
    subtotal: 12400,
    tax: 0,
    shippingFee: 0,
    currency: 'USD',
    customerEmail: 's.tanaka@kyoto-minimal.jp',
    customerName: 'Sora Tanaka',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    _count: { items: 3 },
  },
];

export default function AdminOrdersPage() {
  const { token } = useAdminAuth();

  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDemoOrders, setShowDemoOrders] = useState(false);

  // Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await adminApi.getOrders(token, {
        limit: 50,
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
      });
      setOrders(res.data);
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch orders from backend.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token, selectedStatus]);

  const hasLiveOrders = orders.length > 0;
  const currentOrders = hasLiveOrders
    ? orders
    : showDemoOrders
    ? DEMO_ORDERS
    : [];

  const filteredOrders = currentOrders.filter((order) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      (order.orderNumber && order.orderNumber.toLowerCase().includes(q)) ||
      order.customerEmail.toLowerCase().includes(q) ||
      (order.customerName && order.customerName.toLowerCase().includes(q)) ||
      order.id.toLowerCase().includes(q);

    const matchesStatus =
      selectedStatus === 'ALL' || order.status === selectedStatus;

    return matchesQuery && matchesStatus;
  });

  const handleStatusChange = async (orderId: string, nextStatus: OrderStatus) => {
    if (!token) return;

    if (orderId.startsWith('demo-')) {
      alert('Demonstration orders cannot be modified on the live backend.');
      return;
    }

    setIsUpdatingStatus(true);
    setStatusMessage(null);

    try {
      const updated = await adminApi.updateOrderStatus(token, orderId, nextStatus);
      setStatusMessage(`Order updated to ${nextStatus}.`);
      setSelectedOrder(updated);
      await fetchOrders();
    } catch (err) {
      if (err instanceof AdminApiError) {
        alert(`Status Transition Error: ${err.message}`);
      } else {
        alert('Failed to update order status.');
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#777777]">
            COMMERCE FULFILLMENT · NESTJS / PRISMA
          </div>
          <h2 className="text-xl sm:text-2xl font-serif uppercase tracking-[0.1em] text-[#111111] font-light mt-0.5">
            Order Management
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchOrders}
            title="Refresh Orders"
            disabled={isLoading}
            className="p-2.5 bg-white border border-[#E5E5E5] text-[#111111] hover:bg-[#F5F5F2] transition-colors focus:outline-none cursor-pointer"
          >
            <RefreshCw
              className={`size-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E5E5E5] p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#777777]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders by number, email, or customer name..."
            className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-[#FBFBFA] border border-[#E5E5E5] text-[#111111] placeholder:text-[#AAAAAA] focus:outline-none focus:ring-1 focus:ring-[#111111]"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#777777] mr-1">
            Status:
          </span>
          {['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(
            (status) => (
              <button
                key={status}
                type="button"
                onClick={() => setSelectedStatus(status)}
                className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors shrink-0 ${
                  selectedStatus === status
                    ? 'bg-[#111111] text-white font-medium'
                    : 'bg-[#F5F5F2] text-[#777777] hover:text-[#111111] border border-[#E5E5E5]'
                }`}
              >
                {status}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Notice when viewing demo orders */}
      {!hasLiveOrders && showDemoOrders && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono flex items-center justify-between">
          <span>
            ▲ Demonstration View Active: Showing simulated orders for format inspection. Database has 0 live customer orders.
          </span>
          <button
            onClick={() => setShowDemoOrders(false)}
            className="underline uppercase text-[10px]"
          >
            Switch to Empty State
          </button>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchOrders}
            className="font-mono underline uppercase text-[10px] tracking-wider"
          >
            Retry Query
          </button>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white border border-[#E5E5E5] overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-xs font-mono text-[#777777]">
            <div className="w-6 h-6 border-2 border-[#111111] border-t-transparent animate-spin mx-auto mb-3" />
            Querying orders from PostgreSQL...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <ShoppingBag className="size-8 text-[#CCCCCC] mx-auto mb-3" />
            <h4 className="text-sm font-mono uppercase tracking-[0.15em] text-[#111111]">
              No Orders Found
            </h4>
            <p className="text-xs text-[#777777] max-w-sm mx-auto mt-1 mb-4 font-sans">
              {hasLiveOrders
                ? 'No live orders match your selected status filter.'
                : 'The PostgreSQL database currently contains 0 customer orders. You can preview simulated orders or checkout via the public shop.'}
            </p>
            {!hasLiveOrders && (
              <button
                type="button"
                onClick={() => setShowDemoOrders(true)}
                className="px-4 py-2 bg-white border border-[#E5E5E5] text-xs font-mono uppercase tracking-wider hover:bg-[#F5F5F2] transition-colors cursor-pointer"
              >
                Inspect Demonstration Scenario
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E5E5] bg-[#FBFBFA] text-[10px] font-mono uppercase tracking-[0.18em] text-[#777777]">
                  <th className="py-3 px-4 font-normal">Order Ref</th>
                  <th className="py-3 px-4 font-normal">Date</th>
                  <th className="py-3 px-4 font-normal">Customer</th>
                  <th className="py-3 px-4 font-normal">Total</th>
                  <th className="py-3 px-4 font-normal">Payment</th>
                  <th className="py-3 px-4 font-normal">Fulfillment</th>
                  <th className="py-3 px-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] text-xs">
                {filteredOrders.map((order) => {
                  const isDemo = order.id.startsWith('demo-');
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-[#FBFBFA] transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-[#111111]">
                        <div>{order.orderNumber || order.id.slice(0, 8)}</div>
                        {isDemo && (
                          <span className="text-[8px] text-[#999999] uppercase tracking-wider">
                            [DEMO]
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#777777]">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-sans text-[#111111]">
                        <div className="font-medium">
                          {order.customerName || 'Customer'}
                        </div>
                        <div className="text-[10px] font-mono text-[#777777]">
                          {order.customerEmail}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#111111] font-medium">
                        ${(order.total / 100).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider border ${
                            order.paymentStatus === 'PAID'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider border ${
                            order.status === 'CONFIRMED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : order.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : order.status === 'SHIPPED'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="px-2.5 py-1 bg-white border border-[#E5E5E5] text-[11px] font-mono uppercase tracking-wider text-[#111111] hover:bg-[#F5F5F2] transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#E5E5E5] max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative font-mono text-xs">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-6 right-6 text-[#777777] hover:text-[#111111]"
            >
              <X className="size-5" />
            </button>

            <div className="mb-6">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#777777]">
                Order Details
              </span>
              <h3 className="text-xl font-serif uppercase tracking-[0.1em] text-[#111111] mt-0.5">
                {selectedOrder.orderNumber || selectedOrder.id}
              </h3>
              <div className="text-[11px] text-[#777777]">
                Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
              </div>
            </div>

            <div className="space-y-6 divide-y divide-[#E5E5E5]">
              {/* Customer & Payment info */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="text-[10px] text-[#777777] uppercase mb-1">
                    Customer Information
                  </div>
                  <div className="font-sans font-medium text-[#111111]">
                    {selectedOrder.customerName || 'Customer'}
                  </div>
                  <div className="text-[11px] text-[#777777]">
                    {selectedOrder.customerEmail}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-[#777777] uppercase mb-1">
                    Financial Status
                  </div>
                  <div className="font-medium text-[#111111]">
                    Total: ${(selectedOrder.total / 100).toFixed(2)} {selectedOrder.currency}
                  </div>
                  <div className="text-[11px] text-[#777777]">
                    Payment: {selectedOrder.paymentStatus}
                  </div>
                </div>
              </div>

              {/* Status Transition Control (for real backend orders) */}
              <div className="pt-4">
                <div className="text-[10px] text-[#777777] uppercase mb-2">
                  Update Order Fulfillment Status
                </div>
                {selectedOrder.id.startsWith('demo-') ? (
                  <p className="text-[11px] text-[#777777] italic">
                    Status transitions are disabled for demonstration records.
                  </p>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    {STATUS_OPTIONS.map((st) => (
                      <button
                        key={st}
                        disabled={isUpdatingStatus || selectedOrder.status === st}
                        onClick={() => handleStatusChange(selectedOrder.id, st)}
                        className={`px-2.5 py-1 text-[10px] uppercase tracking-wider border cursor-pointer transition-colors ${
                          selectedOrder.status === st
                            ? 'bg-[#111111] text-white border-[#111111]'
                            : 'bg-white text-[#111111] border-[#E5E5E5] hover:bg-[#F5F5F2]'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Line Items */}
              <div className="pt-4">
                <div className="text-[10px] text-[#777777] uppercase mb-3">
                  Ordered Line Items ({selectedOrder.items?.length || 0})
                </div>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-[#FBFBFA] border border-[#E5E5E5] flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium text-[#111111]">
                            {item.productName}
                          </div>
                          <div className="text-[10px] text-[#777777]">
                            {item.variantName} · SKU: {item.sku}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[#111111]">
                            {item.quantity} × ${(item.unitPrice / 100).toFixed(2)}
                          </div>
                          <div className="font-medium text-[#111111]">
                            ${(item.totalPrice / 100).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#777777]">
                    No detailed line items returned for this record.
                  </p>
                )}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-[#111111] text-white uppercase tracking-wider text-[11px] cursor-pointer"
                >
                  Close Modal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
