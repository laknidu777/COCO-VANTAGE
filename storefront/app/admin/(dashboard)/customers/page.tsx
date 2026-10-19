'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Users,
  Search,
  Mail,
  ShoppingBag,
  DollarSign,
  Calendar,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  X,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Copy,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { useAdminAuth } from '@/lib/admin-auth';
import { adminApi, AdminApiError } from '@/lib/admin-api';
import {
  ApiCustomerDetail,
  ApiCustomerStats,
  ApiCustomerSummary,
  PaginationMeta,
} from '@/lib/admin-types';

export default function AdminCustomersPage() {
  const { token } = useAdminAuth();

  const [customers, setCustomers] = useState<ApiCustomerSummary[]>([]);
  const [stats, setStats] = useState<ApiCustomerStats | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected customer for detail inspection modal
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );
  const [customerDetail, setCustomerDetail] =
    useState<ApiCustomerDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load customers list
  const loadCustomers = useCallback(
    async (pageToLoad = pagination.page) => {
      if (!token) return;
      setIsLoading(true);
      setError(null);

      try {
        const response = await adminApi.getCustomers(token, {
          page: pageToLoad,
          limit: pagination.limit,
          search: debouncedSearch,
        });

        setCustomers(response.data || []);
        setPagination(
          response.pagination || {
            page: pageToLoad,
            limit: pagination.limit,
            total: 0,
            totalPages: 1,
          },
        );
        if (response.stats) {
          setStats(response.stats);
        }
      } catch (err) {
        const message =
          err instanceof AdminApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Failed to retrieve customers directory';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [token, pagination.limit, debouncedSearch],
  );

  useEffect(() => {
    loadCustomers(pagination.page);
  }, [loadCustomers, pagination.page]);

  // Load customer detail when selected
  const handleSelectCustomer = async (id: string) => {
    if (!token) return;
    setSelectedCustomerId(id);
    setIsLoadingDetail(true);
    setDetailError(null);
    setCustomerDetail(null);

    try {
      const detail = await adminApi.getCustomerById(token, id);
      setCustomerDetail(detail);
    } catch (err) {
      const message =
        err instanceof AdminApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Failed to load customer profile';
      setDetailError(message);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Toggle active/suspended status
  const handleToggleStatus = async () => {
    if (!token || !customerDetail || isUpdatingStatus) return;

    const nextStatus = !customerDetail.isActive;
    const confirmMessage = nextStatus
      ? `Re-activate customer account for ${customerDetail.email}?`
      : `Suspend customer account for ${customerDetail.email}? This prevents subsequent sign-in.`;

    if (!window.confirm(confirmMessage)) return;

    setIsUpdatingStatus(true);
    try {
      await adminApi.updateCustomerStatus(token, customerDetail.id, nextStatus);
      setCustomerDetail((prev) =>
        prev ? { ...prev, isActive: nextStatus } : null,
      );
      // Update in summary list
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customerDetail.id ? { ...c, isActive: nextStatus } : c,
        ),
      );
      // Refresh stats if suspended/activated
      if (stats) {
        setStats({
          ...stats,
          activeCustomers: nextStatus
            ? stats.activeCustomers + 1
            : Math.max(0, stats.activeCustomers - 1),
        });
      }
    } catch (err) {
      alert(
        err instanceof Error ? err.message : 'Failed to update customer status',
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const formatCents = (cents: number) => {
    return (cents / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    try {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#777777]">
            CLIENT DIRECTORY · LIVE PLATFORM DATA
          </div>
          <h2 className="text-xl sm:text-2xl font-serif uppercase tracking-[0.1em] text-[#111111] font-light mt-0.5">
            Customer Directory
          </h2>
          <p className="text-xs text-[#666666] font-sans mt-1">
            Real customer accounts, lifetime order history, and contact
            information.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadCustomers(pagination.page)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider bg-white border border-[#E5E5E5] hover:border-[#111111] transition-colors disabled:opacity-50 text-[#111111]"
            title="Refresh customer database"
          >
            <RefreshCw
              className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metric Cards KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div className="bg-white border border-[#E5E5E5] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#777777]">
            <span className="text-[10px] font-mono uppercase tracking-wider">
              Total Customers
            </span>
            <Users className="size-4" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-serif font-light text-[#111111]">
              {stats ? stats.totalCustomers : pagination.total}
            </div>
            <div className="text-[10px] font-mono text-[#777777] mt-0.5">
              Registered Client Accounts
            </div>
          </div>
        </div>

        {/* Active Accounts */}
        <div className="bg-white border border-[#E5E5E5] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#777777]">
            <span className="text-[10px] font-mono uppercase tracking-wider">
              Active Accounts
            </span>
            <UserCheck className="size-4 text-emerald-600" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-serif font-light text-[#111111]">
              {stats ? stats.activeCustomers : '—'}
            </div>
            <div className="text-[10px] font-mono text-emerald-700 mt-0.5">
              Verified & In Good Standing
            </div>
          </div>
        </div>

        {/* Lifetime Revenue */}
        <div className="bg-white border border-[#E5E5E5] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#777777]">
            <span className="text-[10px] font-mono uppercase tracking-wider">
              Customer Revenue
            </span>
            <DollarSign className="size-4 text-amber-600" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-serif font-light text-[#111111]">
              {stats ? formatCents(stats.totalRevenue) : '—'}
            </div>
            <div className="text-[10px] font-mono text-[#777777] mt-0.5">
              Fulfilled & Paid Orders
            </div>
          </div>
        </div>

        {/* Repeat Buyers */}
        <div className="bg-white border border-[#E5E5E5] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#777777]">
            <span className="text-[10px] font-mono uppercase tracking-wider">
              Repeat Clients
            </span>
            <TrendingUp className="size-4 text-blue-600" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-serif font-light text-[#111111]">
              {stats ? stats.repeatCustomers : '—'}
            </div>
            <div className="text-[10px] font-mono text-[#777777] mt-0.5">
              Placed 2 or More Orders
            </div>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white border border-[#E5E5E5] p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#777777]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, email address, phone, or country..."
            className="w-full pl-9 pr-9 py-2 text-xs font-mono bg-[#FBFBFA] border border-[#E5E5E5] text-[#111111] placeholder:text-[#AAAAAA] focus:outline-none focus:ring-1 focus:ring-[#111111]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777777] hover:text-[#111111]"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs font-mono text-[#777777]">
          <span>
            {pagination.total} customer{pagination.total === 1 ? '' : 's'} found
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadCustomers(pagination.page)}
            className="underline hover:text-red-950 uppercase tracking-wider text-[11px]"
          >
            Retry
          </button>
        </div>
      )}

      {/* Customer Table */}
      <div className="bg-white border border-[#E5E5E5] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E5E5] bg-[#FBFBFA] text-[10px] font-mono uppercase tracking-[0.18em] text-[#777777]">
                <th className="py-3 px-4 font-normal">Customer</th>
                <th className="py-3 px-4 font-normal">Location</th>
                <th className="py-3 px-4 font-normal">Joined</th>
                <th className="py-3 px-4 font-normal">Orders</th>
                <th className="py-3 px-4 font-normal">Lifetime Value</th>
                <th className="py-3 px-4 font-normal">Status</th>
                <th className="py-3 px-4 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] text-xs">
              {isLoading && customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#777777]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="size-5 animate-spin text-[#111111]" />
                      <span className="font-mono text-xs uppercase tracking-wider">
                        Querying customer records...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#777777]">
                    <div className="max-w-md mx-auto space-y-2">
                      <Users className="size-8 mx-auto text-[#CCCCCC]" />
                      <p className="font-mono text-xs text-[#111111] uppercase tracking-wider font-medium">
                        {debouncedSearch
                          ? 'No customers match your query'
                          : 'No registered customers yet'}
                      </p>
                      <p className="text-xs text-[#777777] font-sans">
                        {debouncedSearch
                          ? 'Try searching with a different email or location keyword.'
                          : 'Customer records will populate here automatically as users register and place orders on the storefront.'}
                      </p>
                      {debouncedSearch && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="mt-2 text-xs font-mono text-[#111111] underline"
                        >
                          Clear search filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-[#FBFBFA] transition-colors group cursor-pointer"
                    onClick={() => handleSelectCustomer(c.id)}
                  >
                    <td className="py-3 px-4 font-sans text-[#111111]">
                      <div className="font-medium flex items-center gap-1.5">
                        <span>{c.name}</span>
                        {c.phone && (
                          <span
                            className="text-[10px] text-[#777777] font-mono"
                            title={`Phone: ${c.phone}`}
                          >
                            · {c.phone}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-[#777777]">
                        {c.email}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#111111]">
                      {c.location ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="size-3 text-[#999999] shrink-0" />
                          <span>{c.location}</span>
                        </div>
                      ) : (
                        <span className="text-[#999999]">No address yet</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#777777]">
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#111111]">
                      <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono bg-[#F5F5F2] border border-[#E5E5E5]">
                        {c.ordersCount} {c.ordersCount === 1 ? 'order' : 'orders'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#111111] font-medium">
                      {formatCents(c.totalSpent)}
                    </td>
                    <td className="py-3 px-4">
                      {c.isActive ? (
                        <span className="inline-block px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider bg-red-50 text-red-800 border border-red-200">
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCustomer(c.id);
                        }}
                        className="text-xs font-mono text-[#111111] hover:underline uppercase tracking-wider text-[11px] inline-flex items-center gap-1"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-[#E5E5E5] bg-[#FBFBFA] flex items-center justify-between text-xs font-mono text-[#777777]">
            <div>
              Page {pagination.page} of {pagination.totalPages} (
              {pagination.total} total)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.max(1, prev.page - 1),
                  }))
                }
                disabled={pagination.page <= 1 || isLoading}
                className="px-2.5 py-1 bg-white border border-[#E5E5E5] hover:border-[#111111] disabled:opacity-40 disabled:hover:border-[#E5E5E5] text-[#111111] flex items-center gap-1"
              >
                <ChevronLeft className="size-3.5" />
                <span>Prev</span>
              </button>
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.min(pagination.totalPages, prev.page + 1),
                  }))
                }
                disabled={pagination.page >= pagination.totalPages || isLoading}
                className="px-2.5 py-1 bg-white border border-[#E5E5E5] hover:border-[#111111] disabled:opacity-40 disabled:hover:border-[#E5E5E5] text-[#111111] flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Detail Drawer / Slide-Over Modal */}
      {selectedCustomerId && (
        <div
          className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
          onClick={() => setSelectedCustomerId(null)}
        >
          <div
            className="w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col border-l border-[#E5E5E5] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-[#E5E5E5] flex items-start justify-between bg-[#FBFBFA]">
              <div className="space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#777777]">
                  CLIENT DOSSIER & PROFILE
                </div>
                <h3 className="text-xl font-serif text-[#111111] font-light">
                  {customerDetail?.name || 'Customer Account'}
                </h3>
                <div className="flex items-center gap-2 text-xs font-mono text-[#777777]">
                  <Mail className="size-3 text-[#777777]" />
                  <span>{customerDetail?.email || 'Loading...'}</span>
                  {customerDetail && (
                    <button
                      onClick={() => copyToClipboard(customerDetail.email)}
                      className="hover:text-[#111111] text-[#999999]"
                      title="Copy email"
                    >
                      {copiedId ? (
                        <Check className="size-3 text-emerald-600" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedCustomerId(null)}
                  className="p-1.5 text-[#777777] hover:text-[#111111] hover:bg-[#EAEAEA] transition-colors rounded-xs"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 p-6 space-y-6">
              {isLoadingDetail ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#777777]">
                  <RefreshCw className="size-6 animate-spin text-[#111111]" />
                  <span className="font-mono text-xs uppercase tracking-wider">
                    Loading customer account details...
                  </span>
                </div>
              ) : detailError ? (
                <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-mono flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="size-4 text-red-600" />
                    <span>{detailError}</span>
                  </div>
                  <button
                    onClick={() => handleSelectCustomer(selectedCustomerId)}
                    className="underline text-[11px]"
                  >
                    Retry
                  </button>
                </div>
              ) : customerDetail ? (
                <>
                  {/* Account Status & Admin Actions */}
                  <div className="p-4 bg-[#FBFBFA] border border-[#E5E5E5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#777777]">
                          Account Status:
                        </span>
                        {customerDetail.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <ShieldCheck className="size-3 text-emerald-600" />
                            Active & Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider bg-red-50 text-red-800 border border-red-200">
                            <ShieldAlert className="size-3 text-red-600" />
                            Suspended
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-[#777777]">
                        Account ID: <span className="text-[#111111]">{customerDetail.id}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleToggleStatus}
                      disabled={isUpdatingStatus}
                      className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-colors disabled:opacity-50 ${
                        customerDetail.isActive
                          ? 'border-red-300 bg-red-50 text-red-800 hover:bg-red-100'
                          : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      {isUpdatingStatus
                        ? 'Updating...'
                        : customerDetail.isActive
                          ? 'Suspend Account'
                          : 'Reactivate Account'}
                    </button>
                  </div>

                  {/* Financial & Order KPI Summary */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-white border border-[#E5E5E5]">
                      <div className="text-[9px] font-mono uppercase tracking-wider text-[#777777]">
                        Total Orders
                      </div>
                      <div className="text-lg font-serif font-light text-[#111111] mt-1">
                        {customerDetail.metrics.totalOrders}
                      </div>
                    </div>

                    <div className="p-3 bg-white border border-[#E5E5E5]">
                      <div className="text-[9px] font-mono uppercase tracking-wider text-[#777777]">
                        Lifetime Spend
                      </div>
                      <div className="text-lg font-serif font-light text-[#111111] mt-1">
                        {formatCents(customerDetail.metrics.totalSpent)}
                      </div>
                    </div>

                    <div className="p-3 bg-white border border-[#E5E5E5]">
                      <div className="text-[9px] font-mono uppercase tracking-wider text-[#777777]">
                        Avg. Order Value
                      </div>
                      <div className="text-lg font-serif font-light text-[#111111] mt-1">
                        {formatCents(customerDetail.metrics.averageOrderValue)}
                      </div>
                    </div>
                  </div>

                  {/* Contact & Registration Information */}
                  <div className="border border-[#E5E5E5] bg-white divide-y divide-[#E5E5E5] text-xs font-mono">
                    <div className="p-3 bg-[#FBFBFA] font-semibold text-[10px] uppercase tracking-wider text-[#111111] flex items-center justify-between">
                      <span>Account Information</span>
                      <Calendar className="size-3 text-[#777777]" />
                    </div>
                    <div className="p-3 grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] text-[#777777] uppercase">
                          Registered On
                        </div>
                        <div className="text-[#111111] mt-0.5">
                          {formatDate(customerDetail.createdAt)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#777777] uppercase">
                          Phone Number
                        </div>
                        <div className="text-[#111111] mt-0.5">
                          {customerDetail.phone || 'No phone recorded'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Addresses Section */}
                  <div className="border border-[#E5E5E5] bg-white text-xs font-mono">
                    <div className="p-3 bg-[#FBFBFA] border-b border-[#E5E5E5] font-semibold text-[10px] uppercase tracking-wider text-[#111111] flex items-center justify-between">
                      <span>Shipping Destination</span>
                      <MapPin className="size-3 text-[#777777]" />
                    </div>
                    <div className="p-3">
                      {customerDetail.primaryAddress ? (
                        <div className="space-y-1 text-xs">
                          <div className="font-sans font-medium text-[#111111]">
                            {[
                              customerDetail.primaryAddress.firstName,
                              customerDetail.primaryAddress.lastName,
                            ]
                              .filter(Boolean)
                              .join(' ')}
                          </div>
                          <div className="text-[#555555]">
                            {customerDetail.primaryAddress.address1}
                            {customerDetail.primaryAddress.address2 && (
                              <span>, {customerDetail.primaryAddress.address2}</span>
                            )}
                          </div>
                          <div className="text-[#555555]">
                            {[
                              customerDetail.primaryAddress.city,
                              customerDetail.primaryAddress.stateProvince,
                              customerDetail.primaryAddress.postalCode,
                            ]
                              .filter(Boolean)
                              .join(' ')}
                          </div>
                          <div className="text-[#111111] uppercase font-semibold text-[11px] pt-1">
                            {customerDetail.primaryAddress.country}
                          </div>
                        </div>
                      ) : (
                        <div className="text-[#777777] text-xs">
                          No shipping addresses recorded for this customer yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order History */}
                  <div className="border border-[#E5E5E5] bg-white text-xs">
                    <div className="p-3 bg-[#FBFBFA] border-b border-[#E5E5E5] font-mono font-semibold text-[10px] uppercase tracking-wider text-[#111111] flex items-center justify-between">
                      <span>
                        Order History ({customerDetail.orders.length})
                      </span>
                      <ShoppingBag className="size-3 text-[#777777]" />
                    </div>

                    {customerDetail.orders.length === 0 ? (
                      <div className="p-6 text-center text-[#777777] font-mono text-xs">
                        No orders recorded for this customer account.
                      </div>
                    ) : (
                      <div className="divide-y divide-[#E5E5E5]">
                        {customerDetail.orders.map((ord) => (
                          <div
                            key={ord.id}
                            className="p-4 space-y-2 hover:bg-[#FBFBFA] transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-mono text-xs font-semibold text-[#111111]">
                                {ord.orderNumber}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider bg-[#F5F5F2] border border-[#E5E5E5] text-[#333333]">
                                  {ord.status}
                                </span>
                                <span className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  {ord.paymentStatus}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs font-mono text-[#777777]">
                              <span>{formatDate(ord.createdAt)}</span>
                              <span className="font-medium text-[#111111]">
                                {formatCents(ord.totalAmount)}
                              </span>
                            </div>

                            {/* Items Preview */}
                            <div className="pt-2 border-t border-[#F0F0EE] space-y-1 text-[11px] font-sans">
                              {ord.items.map((it, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-[#555555]"
                                >
                                  <span>
                                    {it.quantity}x {it.productName} ({it.variantName})
                                  </span>
                                  <span className="font-mono text-[#111111]">
                                    {formatCents(it.lineTotal)}
                                  </span>
                                </div>
                              ))}
                            </div>

                            <div className="pt-1 text-right">
                              <Link
                                href={`/admin/orders`}
                                className="text-[11px] font-mono uppercase tracking-wider text-[#111111] hover:underline inline-flex items-center gap-1"
                              >
                                <span>Go to Order Console</span>
                                <ExternalLink className="size-3" />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[#E5E5E5] bg-[#FBFBFA] flex items-center justify-end">
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="px-4 py-2 text-xs font-mono uppercase tracking-wider bg-[#111111] text-white hover:bg-black transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
