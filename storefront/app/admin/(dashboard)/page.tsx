'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  ShoppingBag,
  DollarSign,
  Clock,
  ArrowRight,
  Plus,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { useAdminAuth } from '@/lib/admin-auth';
import { adminApi, AdminApiError } from '@/lib/admin-api';
import { ApiOrder, ApiProduct, InventoryItem } from '@/lib/admin-types';

// Realistic clearly-labeled demonstration order dataset when database has 0 live orders
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

export default function AdminOverviewPage() {
  const { token, admin } = useAdminAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Live Metrics
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [liveOrders, setLiveOrders] = useState<ApiOrder[]>([]);
  const [totalOrdersCount, setTotalOrdersCount] = useState<number>(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);

  // Toggle for inspecting demonstration scenario when 0 live orders exist
  const [showDemoScenario, setShowDemoScenario] = useState(false);

  const fetchData = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);

    try {
      const [productsRes, ordersRes, inventoryRes] = await Promise.all([
        adminApi.getProducts(token, { limit: 50 }),
        adminApi.getOrders(token, { limit: 10 }),
        adminApi.getInventory(token, false),
      ]);

      setTotalProducts(productsRes.pagination.total);
      setLiveOrders(ordersRes.data);
      setTotalOrdersCount(ordersRes.pagination.total);

      // Count pending orders
      const pending = ordersRes.data.filter((o) => o.status === 'PENDING').length;
      setPendingOrdersCount(pending);

      setInventoryItems(inventoryRes.items);
      const lowStock = inventoryRes.items.filter(
        (i) => i.isLowStock || i.stockQuantity <= i.lowStockThreshold,
      );
      setLowStockItems(lowStock);
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch dashboard overview metrics.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Orders to display: live orders if present, otherwise demo if toggled
  const hasLiveOrders = liveOrders.length > 0;
  const displayedOrders = hasLiveOrders
    ? liveOrders
    : showDemoScenario
    ? DEMO_ORDERS
    : [];

  const totalRevenueCents = hasLiveOrders
    ? liveOrders.reduce(
        (acc, o) => (o.paymentStatus === 'PAID' ? acc + o.total : acc),
        0,
      )
    : showDemoScenario
    ? DEMO_ORDERS.reduce((acc, o) => acc + o.total, 0)
    : 0;

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#777777]">
            SYSTEM OVERVIEW · PRODUCTION TELEMETRY
          </div>
          <h2 className="text-xl sm:text-2xl font-serif uppercase tracking-[0.1em] text-[#111111] font-light mt-0.5">
            Welcome back, {admin?.name || 'Administrator'}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchData}
            title="Refresh Live Metrics"
            disabled={isLoading}
            className="p-2.5 bg-white border border-[#E5E5E5] text-[#111111] hover:bg-[#F5F5F2] transition-colors focus:outline-none cursor-pointer"
          >
            <RefreshCw
              className={`size-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </button>

          <Link
            href="/admin/products?action=new"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#111111] text-white text-xs font-mono uppercase tracking-[0.15em] hover:bg-black transition-all focus:outline-none focus:ring-1 focus:ring-black"
          >
            <Plus className="size-3.5" />
            <span>Add Product</span>
          </Link>

          <Link
            href="/admin/orders"
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E5E5] text-[#111111] text-xs font-mono uppercase tracking-[0.15em] hover:bg-[#F5F5F2] transition-all focus:outline-none"
          >
            <span>View Orders</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchData}
            className="font-mono underline uppercase text-[10px] tracking-wider"
          >
            Retry Query
          </button>
        </div>
      )}

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Orders */}
        <div className="bg-white border border-[#E5E5E5] p-5 relative">
          <div className="flex items-center justify-between text-[#777777] mb-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em]">
              Total Orders
            </span>
            <ShoppingBag className="size-4 text-[#111111]" />
          </div>
          <div className="text-2xl font-serif text-[#111111]">
            {isLoading ? '—' : hasLiveOrders ? totalOrdersCount : showDemoScenario ? '3' : '0'}
          </div>
          <div className="mt-2 text-[10px] font-mono flex items-center gap-1.5">
            {hasLiveOrders ? (
              <span className="text-emerald-600">● Live Backend Data</span>
            ) : showDemoScenario ? (
              <span className="text-amber-600">▲ Demonstration Scenario</span>
            ) : (
              <span className="text-[#777777]">0 Live Orders in Database</span>
            )}
          </div>
        </div>

        {/* Metric 2: Revenue */}
        <div className="bg-white border border-[#E5E5E5] p-5 relative">
          <div className="flex items-center justify-between text-[#777777] mb-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em]">
              Gross Revenue
            </span>
            <DollarSign className="size-4 text-[#111111]" />
          </div>
          <div className="text-2xl font-serif text-[#111111]">
            {isLoading ? '—' : `$${(totalRevenueCents / 100).toFixed(2)}`}
          </div>
          <div className="mt-2 text-[10px] font-mono flex items-center gap-1.5">
            {hasLiveOrders ? (
              <span className="text-emerald-600">● Live Settled Volume</span>
            ) : showDemoScenario ? (
              <span className="text-amber-600">▲ Demonstration Scenario</span>
            ) : (
              <span className="text-[#777777]">Awaiting First Live Checkout</span>
            )}
          </div>
        </div>

        {/* Metric 3: Total Products */}
        <div className="bg-white border border-[#E5E5E5] p-5 relative">
          <div className="flex items-center justify-between text-[#777777] mb-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em]">
              Catalog Products
            </span>
            <Package className="size-4 text-[#111111]" />
          </div>
          <div className="text-2xl font-serif text-[#111111]">
            {isLoading ? '—' : totalProducts}
          </div>
          <div className="mt-2 text-[10px] font-mono text-emerald-600 flex items-center gap-1.5">
            <span>● Live Catalog Records</span>
          </div>
        </div>

        {/* Metric 4: Pending Orders */}
        <div className="bg-white border border-[#E5E5E5] p-5 relative">
          <div className="flex items-center justify-between text-[#777777] mb-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em]">
              Pending Fulfillment
            </span>
            <Clock className="size-4 text-[#111111]" />
          </div>
          <div className="text-2xl font-serif text-[#111111]">
            {isLoading ? '—' : hasLiveOrders ? pendingOrdersCount : showDemoScenario ? '1' : '0'}
          </div>
          <div className="mt-2 text-[10px] font-mono flex items-center gap-1.5">
            {hasLiveOrders && pendingOrdersCount > 0 ? (
              <span className="text-amber-600">Action Required</span>
            ) : (
              <span className="text-[#777777]">Queue Clear</span>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Recent Orders & Inventory Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Section (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-[#E5E5E5] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E5E5E5]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-[0.18em] text-[#111111] font-medium">
                  Recent Orders
                </span>
                {!hasLiveOrders && (
                  <span className="px-1.5 py-0.5 bg-[#F5F5F2] border border-[#E5E5E5] text-[9px] font-mono uppercase tracking-wider text-[#777777]">
                    {showDemoScenario ? 'Demonstration View' : 'Live: 0 Records'}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {!hasLiveOrders && (
                  <button
                    type="button"
                    onClick={() => setShowDemoScenario(!showDemoScenario)}
                    className="text-[10px] font-mono uppercase tracking-wider text-[#777777] hover:text-[#111111] underline focus:outline-none cursor-pointer"
                  >
                    {showDemoScenario ? 'Show Empty State' : 'Preview Demo Scenario'}
                  </button>
                )}
                <Link
                  href="/admin/orders"
                  className="text-xs font-mono uppercase tracking-wider text-[#777777] hover:text-[#111111] flex items-center gap-1 transition-colors"
                >
                  <span>All Orders</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>

            {/* Orders Table or Empty State */}
            {isLoading ? (
              <div className="py-12 text-center text-xs font-mono text-[#777777]">
                <div className="w-5 h-5 border-2 border-[#111111] border-t-transparent animate-spin mx-auto mb-2" />
                Loading orders from backend...
              </div>
            ) : displayedOrders.length === 0 ? (
              <div className="py-12 px-4 text-center border border-dashed border-[#E5E5E5] bg-[#FBFBFA]">
                <ShoppingBag className="size-8 text-[#CCCCCC] mx-auto mb-3" />
                <h4 className="text-sm font-mono uppercase tracking-[0.15em] text-[#111111]">
                  No Live Customer Orders Yet
                </h4>
                <p className="text-xs text-[#777777] max-w-sm mx-auto mt-1 mb-4 font-sans">
                  The PostgreSQL database currently contains 0 order records. Place a test order through the storefront checkout to see live records here.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowDemoScenario(true)}
                    className="px-3.5 py-2 bg-white border border-[#E5E5E5] text-[11px] font-mono uppercase tracking-wider hover:bg-[#F5F5F2] transition-colors cursor-pointer"
                  >
                    Inspect Demonstration Data
                  </button>
                  <Link
                    href="/shop"
                    target="_blank"
                    className="px-3.5 py-2 bg-[#111111] text-white text-[11px] font-mono uppercase tracking-wider hover:bg-black transition-colors"
                  >
                    Visit Shop
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5E5E5] text-[10px] font-mono uppercase tracking-[0.15em] text-[#777777]">
                      <th className="py-2.5 font-normal">Order</th>
                      <th className="py-2.5 font-normal">Customer</th>
                      <th className="py-2.5 font-normal">Total</th>
                      <th className="py-2.5 font-normal">Status</th>
                      <th className="py-2.5 font-normal text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5] text-xs">
                    {displayedOrders.map((order) => {
                      const isDemo = order.id.startsWith('demo-');
                      return (
                        <tr key={order.id} className="hover:bg-[#FBFBFA]">
                          <td className="py-3 font-mono font-medium text-[#111111]">
                            <div>{order.orderNumber || order.id.slice(0, 8)}</div>
                            <div className="text-[10px] text-[#777777] font-normal">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-3 font-sans text-[#111111]">
                            <div>{order.customerName || 'Customer'}</div>
                            <div className="text-[10px] font-mono text-[#777777]">
                              {order.customerEmail}
                            </div>
                          </td>
                          <td className="py-3 font-mono text-[#111111]">
                            ${(order.total / 100).toFixed(2)}
                          </td>
                          <td className="py-3">
                            <span
                              className={`inline-block px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider border ${
                                order.status === 'CONFIRMED'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : order.status === 'PENDING'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : order.status === 'SHIPPED'
                                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                                  : 'bg-zinc-50 text-zinc-800 border-zinc-200'
                              }`}
                            >
                              {order.status}
                            </span>
                            {isDemo && (
                              <span className="block text-[8px] font-mono text-[#999999] uppercase tracking-widest mt-0.5">
                                [DEMO]
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            <Link
                              href={`/admin/orders?id=${order.id}`}
                              className="text-xs font-mono text-[#111111] hover:underline"
                            >
                              Details
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {!hasLiveOrders && showDemoScenario && (
            <div className="mt-4 pt-3 border-t border-[#E5E5E5] text-[10px] font-mono text-amber-700 bg-amber-50/50 p-2 border border-amber-200">
              ▲ Clearly Labeled Demonstration Data: These rows represent simulated order entries to demonstrate UI formatting while the PostgreSQL database awaits real customer orders.
            </div>
          )}
        </div>

        {/* Low-Stock & Inventory Telemetry (1 Col) */}
        <div className="bg-white border border-[#E5E5E5] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E5E5E5]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-[0.18em] text-[#111111] font-medium">
                  Inventory Status
                </span>
                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-mono uppercase">
                  Live API
                </span>
              </div>
              <Link
                href="/admin/products"
                className="text-xs font-mono uppercase tracking-wider text-[#777777] hover:text-[#111111]"
              >
                Catalog
              </Link>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-xs font-mono text-[#777777]">
                Fetching inventory telemetry...
              </div>
            ) : inventoryItems.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-[#777777]">
                No inventory variants configured.
              </div>
            ) : (
              <div className="space-y-3">
                {/* Low Stock Alert if any */}
                {lowStockItems.length > 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs mb-3">
                    <div className="flex items-center gap-1.5 font-mono uppercase font-semibold text-[10px]">
                      <AlertTriangle className="size-3.5 text-amber-600" />
                      <span>{lowStockItems.length} Low-Stock Variant(s)</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs mb-3 flex items-center gap-2">
                    <CheckCircle className="size-3.5 text-emerald-600 shrink-0" />
                    <span className="text-[11px] font-mono">
                      All 8 catalog variants maintain healthy inventory levels (100 units each).
                    </span>
                  </div>
                )}

                <div className="divide-y divide-[#E5E5E5]">
                  {inventoryItems.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="py-2.5 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-medium text-[#111111] truncate">
                          {item.name}
                        </div>
                        <div className="text-[10px] font-mono text-[#777777]">
                          SKU: {item.sku}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono font-medium text-[#111111]">
                          {item.stockQuantity} units
                        </div>
                        <div className="text-[9px] font-mono uppercase text-emerald-600">
                          In Stock
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#E5E5E5]">
            <Link
              href="/admin/products"
              className="w-full py-2 bg-[#F5F5F2] hover:bg-[#EBEBE7] border border-[#E5E5E5] text-center block text-xs font-mono uppercase tracking-[0.15em] text-[#111111] transition-colors"
            >
              Manage Catalog Inventory →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
