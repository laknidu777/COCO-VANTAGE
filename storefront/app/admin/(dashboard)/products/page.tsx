'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Package,
  Plus,
  Search,
  Filter,
  Check,
  AlertCircle,
  Eye,
  Edit,
  X,
  ExternalLink,
  RefreshCw,
  Tag,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { useAdminAuth } from '@/lib/admin-auth';
import { adminApi, AdminApiError } from '@/lib/admin-api';
import {
  ApiCategory,
  ApiProduct,
  CreateProductPayload,
  ProductStatus,
} from '@/lib/admin-types';

export default function AdminProductsPage() {
  const { token, admin } = useAdminAuth();
  const isSuperAdmin = admin?.role === 'SUPER_ADMIN';

  // Data states
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Modal / Drawer state for creating a product
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDesc, setFormSeoDesc] = useState('');

  // Selected product for viewing details
  const [viewingProduct, setViewingProduct] = useState<ApiProduct | null>(null);

  // Status updating state
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [statusActionMessage, setStatusActionMessage] = useState<string | null>(
    null,
  );

  const fetchCatalog = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);

    try {
      const [prodRes, catRes] = await Promise.all([
        adminApi.getProducts(token, { limit: 50 }),
        adminApi.getCategories(),
      ]);

      setProducts(prodRes.data);
      setCategories(catRes.data);
      if (catRes.data.length > 0 && !formCategoryId) {
        setFormCategoryId(catRes.data[0].id);
      }
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError(err.message);
      } else {
        setError('Failed to load products from API.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [token]);

  // Auto-generate slug from name
  const handleNameChange = (val: string) => {
    setFormName(val);
    setFormSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, ''),
    );
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!formName.trim() || !formSlug.trim() || !formCategoryId) {
      setCreateError('Product name, slug, and category are mandatory.');
      return;
    }

    setIsSubmitting(true);
    setCreateError(null);

    const payload: CreateProductPayload = {
      name: formName.trim(),
      slug: formSlug.trim(),
      categoryId: formCategoryId,
      shortDescription: formShortDesc.trim() || undefined,
      description: formDesc.trim() || undefined,
      isFeatured: formFeatured,
      seoTitle: formSeoTitle.trim() || undefined,
      seoDescription: formSeoDesc.trim() || undefined,
    };

    try {
      const created = await adminApi.createProduct(token, payload);
      setCreateSuccess(true);
      // Reset form
      setFormName('');
      setFormSlug('');
      setFormShortDesc('');
      setFormDesc('');
      setFormFeatured(false);
      setFormSeoTitle('');
      setFormSeoDesc('');

      // Refresh list
      await fetchCatalog();

      setTimeout(() => {
        setCreateSuccess(false);
        setIsCreateOpen(false);
      }, 1500);
    } catch (err) {
      if (err instanceof AdminApiError) {
        setCreateError(err.message);
      } else {
        setCreateError('Product creation failed. Please check inputs.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (
    productId: string,
    nextStatus: ProductStatus,
  ) => {
    if (!token) return;
    setStatusUpdatingId(productId);
    setStatusActionMessage(null);

    try {
      await adminApi.updateProductStatus(token, productId, nextStatus);
      setStatusActionMessage(`Product status updated to ${nextStatus}.`);
      await fetchCatalog();
    } catch (err) {
      if (err instanceof AdminApiError) {
        alert(
          err.statusCode === 403
            ? 'Forbidden: Changing publication status requires SUPER_ADMIN permissions.'
            : err.message,
        );
      } else {
        alert('Failed to update status.');
      }
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category?.name &&
        p.category.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' || p.status === statusFilter;

    const matchesCategory =
      categoryFilter === 'ALL' || p.categoryId === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#777777]">
            CATALOG REPOSITORY · NESTJS / PRISMA
          </div>
          <h2 className="text-xl sm:text-2xl font-serif uppercase tracking-[0.1em] text-[#111111] font-light mt-0.5">
            Product Management
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchCatalog}
            title="Refresh Products"
            disabled={isLoading}
            className="p-2.5 bg-white border border-[#E5E5E5] text-[#111111] hover:bg-[#F5F5F2] transition-colors focus:outline-none cursor-pointer"
          >
            <RefreshCw
              className={`size-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </button>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#111111] text-white text-xs font-mono uppercase tracking-[0.15em] hover:bg-black transition-all focus:outline-none cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Create Draft Product</span>
          </button>
        </div>
      </div>

      {/* Status banner */}
      {statusActionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono flex items-center justify-between">
          <span>{statusActionMessage}</span>
          <button
            onClick={() => setStatusActionMessage(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="bg-white border border-[#E5E5E5] p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#777777]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by title, slug, or formulation..."
            className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-[#FBFBFA] border border-[#E5E5E5] text-[#111111] placeholder:text-[#AAAAAA] focus:outline-none focus:ring-1 focus:ring-[#111111]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-[#777777] uppercase text-[10px] tracking-wider">
              Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-2.5 bg-[#FBFBFA] border border-[#E5E5E5] text-xs font-mono text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-[#777777] uppercase text-[10px] tracking-wider">
              Category:
            </span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-1.5 px-2.5 bg-[#FBFBFA] border border-[#E5E5E5] text-xs font-mono text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {(searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setCategoryFilter('ALL');
              }}
              className="text-[11px] font-mono text-[#777777] hover:text-[#111111] underline focus:outline-none cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchCatalog}
            className="font-mono underline uppercase text-[10px] tracking-wider"
          >
            Retry Query
          </button>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white border border-[#E5E5E5] overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-xs font-mono text-[#777777]">
            <div className="w-6 h-6 border-2 border-[#111111] border-t-transparent animate-spin mx-auto mb-3" />
            Loading catalog from NestJS API...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <Package className="size-8 text-[#CCCCCC] mx-auto mb-3" />
            <h4 className="text-sm font-mono uppercase tracking-[0.15em] text-[#111111]">
              No Products Match Current Criteria
            </h4>
            <p className="text-xs text-[#777777] mt-1 font-sans">
              Try adjusting your search terms or filters above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E5E5] bg-[#FBFBFA] text-[10px] font-mono uppercase tracking-[0.18em] text-[#777777]">
                  <th className="py-3 px-4 font-normal">Product</th>
                  <th className="py-3 px-4 font-normal">Category</th>
                  <th className="py-3 px-4 font-normal">Price (USD)</th>
                  <th className="py-3 px-4 font-normal">Stock Level</th>
                  <th className="py-3 px-4 font-normal">Status</th>
                  <th className="py-3 px-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] text-xs">
                {filteredProducts.map((p) => {
                  const primaryImage =
                    p.images?.find((img) => img.isPrimary)?.url ||
                    p.images?.[0]?.url ||
                    '/powder.jpg';

                  const defaultVariant =
                    p.variants?.find((v) => v.isDefault) || p.variants?.[0];
                  const primaryPrice =
                    defaultVariant?.prices?.[0]?.amount !== undefined
                      ? (defaultVariant.prices[0].amount / 100).toFixed(2)
                      : '—';
                  const stockQuantity = defaultVariant?.stockQuantity ?? '—';

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-[#FBFBFA] transition-colors"
                    >
                      {/* Product Image & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="size-11 relative bg-[#F5F5F2] border border-[#E5E5E5] shrink-0 overflow-hidden">
                            <Image
                              src={primaryImage}
                              alt={p.name}
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-[#111111] truncate">
                              {p.name}
                            </div>
                            <div className="text-[10px] font-mono text-[#777777] truncate">
                              slug: {p.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 font-mono text-[#111111]">
                        <span className="px-2 py-0.5 bg-[#F5F5F2] border border-[#E5E5E5] text-[10px] uppercase">
                          {p.category?.name || 'Uncategorized'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-mono text-[#111111] font-medium">
                        ${primaryPrice}
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4 font-mono">
                        <span
                          className={`${
                            typeof stockQuantity === 'number' && stockQuantity <= 5
                              ? 'text-amber-600 font-semibold'
                              : 'text-[#111111]'
                          }`}
                        >
                          {stockQuantity} units
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider border ${
                            p.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : p.status === 'DRAFT'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Super Admin Status Toggle */}
                          {isSuperAdmin && (
                            <div className="relative group inline-block">
                              <select
                                value={p.status}
                                disabled={statusUpdatingId === p.id}
                                onChange={(e) =>
                                  handleUpdateStatus(
                                    p.id,
                                    e.target.value as ProductStatus,
                                  )
                                }
                                className="text-[10px] font-mono uppercase py-1 px-1.5 bg-white border border-[#E5E5E5] hover:border-[#111111] focus:outline-none cursor-pointer"
                              >
                                <option value="ACTIVE">Set Active</option>
                                <option value="DRAFT">Set Draft</option>
                                <option value="ARCHIVED">Set Archived</option>
                              </select>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => setViewingProduct(p)}
                            className="p-1.5 text-[#777777] hover:text-[#111111] hover:bg-[#F5F5F2] border border-transparent hover:border-[#E5E5E5] transition-all cursor-pointer"
                            title="View Raw Product Details"
                          >
                            <Eye className="size-3.5" />
                          </button>

                          <a
                            href={`/products/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-[#777777] hover:text-[#111111] hover:bg-[#F5F5F2] border border-transparent hover:border-[#E5E5E5] transition-all"
                            title="Preview On Storefront"
                          >
                            <ExternalLink className="size-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over / Modal for Creating a Draft Product */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#E5E5E5] max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-6 right-6 text-[#777777] hover:text-[#111111]"
            >
              <X className="size-5" />
            </button>

            <div className="mb-6">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#777777]">
                LIVE API MUTATION · POST /api/v1/admin/products
              </span>
              <h3 className="text-xl font-serif uppercase tracking-[0.1em] text-[#111111] mt-1 font-light">
                Create Draft Product
              </h3>
              <p className="text-xs text-[#777777] mt-1">
                Creates a live product record in PostgreSQL with default draft status.
              </p>
            </div>

            {createSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>Product created successfully! Refreshing catalog...</span>
              </div>
            )}

            {createError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-900 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="size-4 text-red-600" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block uppercase text-[10px] tracking-wider text-[#111111] mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Micro-Carbon Botanical Elixir"
                  className="w-full p-2.5 bg-[#FBFBFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block uppercase text-[10px] tracking-wider text-[#111111] mb-1">
                  Slug (URL identifier) *
                </label>
                <input
                  type="text"
                  required
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="e.g. micro-carbon-botanical-elixir"
                  className="w-full p-2.5 bg-[#FBFBFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block uppercase text-[10px] tracking-wider text-[#111111] mb-1">
                  Category *
                </label>
                <select
                  required
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                  className="w-full p-2.5 bg-[#FBFBFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block uppercase text-[10px] tracking-wider text-[#111111] mb-1">
                  Short Tagline
                </label>
                <input
                  type="text"
                  value={formShortDesc}
                  onChange={(e) => setFormShortDesc(e.target.value)}
                  placeholder="e.g. Single-Origin Ceylon Charcoal"
                  className="w-full p-2.5 bg-[#FBFBFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block uppercase text-[10px] tracking-wider text-[#111111] mb-1">
                  Full Description
                </label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Detailed architectural botanical formulation notes..."
                  className="w-full p-2.5 bg-[#FBFBFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="accent-[#111111]"
                />
                <label htmlFor="featured-check" className="text-xs uppercase tracking-wider text-[#111111] cursor-pointer">
                  Feature on Storefront Homepage
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 bg-white border border-[#E5E5E5] text-[#111111] hover:bg-[#F5F5F2] uppercase tracking-wider text-[11px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#111111] text-white hover:bg-black uppercase tracking-wider text-[11px] disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Creating...' : 'Submit to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Viewing Product Details */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#E5E5E5] max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative font-mono text-xs">
            <button
              onClick={() => setViewingProduct(null)}
              className="absolute top-6 right-6 text-[#777777] hover:text-[#111111]"
            >
              <X className="size-5" />
            </button>

            <div className="mb-4">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#777777]">
                Product Inspector
              </span>
              <h3 className="text-lg font-serif uppercase tracking-[0.1em] text-[#111111] mt-0.5">
                {viewingProduct.name}
              </h3>
              <div className="text-[11px] text-[#777777]">
                UUID: {viewingProduct.id}
              </div>
            </div>

            <div className="space-y-4 divide-y divide-[#E5E5E5]">
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="text-[10px] text-[#777777] uppercase">Category</div>
                  <div className="font-medium text-[#111111]">
                    {viewingProduct.category?.name || 'Unassigned'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#777777] uppercase">Publication Status</div>
                  <div className="font-medium text-[#111111]">{viewingProduct.status}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#777777] uppercase">Created At</div>
                  <div className="text-[#111111]">
                    {new Date(viewingProduct.createdAt).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#777777] uppercase">Featured Flag</div>
                  <div className="text-[#111111]">{viewingProduct.isFeatured ? 'Yes' : 'No'}</div>
                </div>
              </div>

              <div className="pt-3">
                <div className="text-[10px] text-[#777777] uppercase mb-1">
                  Variants & Prices ({viewingProduct.variants?.length || 0})
                </div>
                {viewingProduct.variants?.map((v) => (
                  <div key={v.id} className="p-2.5 bg-[#FBFBFA] border border-[#E5E5E5] mb-2">
                    <div className="flex justify-between font-medium text-[#111111]">
                      <span>{v.name}</span>
                      <span>{v.stockQuantity} in stock</span>
                    </div>
                    <div className="text-[10px] text-[#777777]">
                      SKU: {v.sku} · Price: $
                      {v.prices?.[0]?.amount ? (v.prices[0].amount / 100).toFixed(2) : '—'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingProduct(null)}
                  className="px-4 py-2 bg-[#111111] text-white uppercase tracking-wider text-[11px]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
