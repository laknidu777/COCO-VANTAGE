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
  Trash2,
  X,
  ExternalLink,
  RefreshCw,
  Tag,
  CheckCircle2,
  SlidersHorizontal,
  Image as ImageIcon,
  DollarSign,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { useAdminAuth } from '@/lib/admin-auth';
import { adminApi, AdminApiError } from '@/lib/admin-api';
import {
  ApiCategory,
  ApiProduct,
  CreateProductPayload,
  ProductStatus,
  UpdateProductPayload,
} from '@/lib/admin-types';

const IMAGE_PRESETS = [
  { label: 'Powder', url: '/powder.jpg' },
  { label: 'Blend', url: '/blend.jpg' },
  { label: 'Sticks', url: '/sticks.jpg' },
  { label: 'Process', url: '/process.jpg' },
  { label: 'Hero', url: '/hero.jpg' },
];

export default function AdminProductsPage() {
  const { token, admin } = useAdminAuth();
  const isSuperAdmin = admin?.role === 'SUPER_ADMIN';

  // Catalog data states
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Status message banner
  const [statusActionMessage, setStatusActionMessage] = useState<string | null>(
    null,
  );
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  // --- CREATE MODAL STATE ---
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formStatus, setFormStatus] = useState<ProductStatus>('DRAFT');
  const [formSellingPrice, setFormSellingPrice] = useState('24.99');
  const [formBuyingPrice, setFormBuyingPrice] = useState('12.00');
  const [formStock, setFormStock] = useState('100');
  const [formSku, setFormSku] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('/powder.jpg');
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDesc, setFormSeoDesc] = useState('');

  // --- EDIT MODAL STATE ---
  const [editingProduct, setEditingProduct] = useState<ApiProduct | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);

  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editStatus, setEditStatus] = useState<ProductStatus>('DRAFT');
  const [editSellingPrice, setEditSellingPrice] = useState('');
  const [editBuyingPrice, setEditBuyingPrice] = useState('');
  const [editStock, setEditStock] = useState('100');
  const [editSku, setEditSku] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editShortDesc, setEditShortDesc] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editFeatured, setEditFeatured] = useState(false);
  const [editSeoTitle, setEditSeoTitle] = useState('');
  const [editSeoDesc, setEditSeoDesc] = useState('');

  // Additional image add inside edit modal
  const [newImageInput, setNewImageInput] = useState('');
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

  // --- DELETE CONFIRMATION STATE ---
  const [deletingProduct, setDeletingProduct] = useState<ApiProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // --- VIEW DETAILS MODAL STATE ---
  const [viewingProduct, setViewingProduct] = useState<ApiProduct | null>(null);

  const fetchCatalog = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);

    try {
      const [prodRes, catRes] = await Promise.all([
        adminApi.getProducts(token, { limit: 100 }),
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

  // Auto-generate slug and default SKU from name in create form
  const handleNameChange = (val: string) => {
    setFormName(val);
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setFormSlug(generatedSlug);
    if (!formSku && generatedSlug) {
      const cleanPrefix = generatedSlug
        .slice(0, 6)
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
      setFormSku(`CV-${cleanPrefix}-01`);
    }
  };

  const resetCreateForm = () => {
    setFormName('');
    setFormSlug('');
    setFormCategoryId(categories[0]?.id || '');
    setFormStatus('DRAFT');
    setFormSellingPrice('24.99');
    setFormBuyingPrice('12.00');
    setFormStock('100');
    setFormSku('');
    setFormImageUrl('/powder.jpg');
    setFormShortDesc('');
    setFormDesc('');
    setFormFeatured(false);
    setFormSeoTitle('');
    setFormSeoDesc('');
    setCreateError(null);
    setCreateSuccess(false);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!formName.trim() || !formSlug.trim() || !formCategoryId) {
      setCreateError('Product name, slug, and category are mandatory.');
      return;
    }

    setIsSubmittingCreate(true);
    setCreateError(null);

    const payload: CreateProductPayload = {
      name: formName.trim(),
      slug: formSlug.trim(),
      categoryId: formCategoryId,
      status: formStatus,
      sellingPrice: formSellingPrice ? parseFloat(formSellingPrice) : undefined,
      buyingPrice: formBuyingPrice ? parseFloat(formBuyingPrice) : undefined,
      stockQuantity: formStock ? parseInt(formStock, 10) : 100,
      sku: formSku.trim() || undefined,
      imageUrl: formImageUrl.trim() || undefined,
      shortDescription: formShortDesc.trim() || undefined,
      description: formDesc.trim() || undefined,
      isFeatured: formFeatured,
      seoTitle: formSeoTitle.trim() || undefined,
      seoDescription: formSeoDesc.trim() || undefined,
    };

    try {
      await adminApi.createProduct(token, payload);
      setCreateSuccess(true);
      await fetchCatalog();

      setTimeout(() => {
        setIsCreateOpen(false);
        resetCreateForm();
      }, 1200);
    } catch (err) {
      if (err instanceof AdminApiError) {
        setCreateError(err.message);
      } else {
        setCreateError('Product creation failed. Please check inputs.');
      }
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Open Edit Modal & Populate Form
  const handleOpenEdit = (product: ApiProduct) => {
    const defaultVariant =
      product.variants?.find((v) => v.isDefault) || product.variants?.[0];
    const defaultPrice =
      defaultVariant?.prices?.find((p) => p.currency === 'USD') ||
      defaultVariant?.prices?.[0];
    const primaryImg =
      product.images?.find((img) => img.isPrimary) || product.images?.[0];

    setEditingProduct(product);
    setEditName(product.name);
    setEditSlug(product.slug);
    setEditCategoryId(product.categoryId || (categories[0]?.id ?? ''));
    setEditStatus(product.status);
    setEditSellingPrice(
      defaultPrice?.amount !== undefined
        ? (defaultPrice.amount / 100).toFixed(2)
        : '',
    );
    setEditBuyingPrice(
      defaultPrice?.buyingPrice !== undefined && defaultPrice.buyingPrice !== null
        ? (defaultPrice.buyingPrice / 100).toFixed(2)
        : '',
    );
    setEditStock(
      defaultVariant?.stockQuantity !== undefined
        ? String(defaultVariant.stockQuantity)
        : '100',
    );
    setEditSku(defaultVariant?.sku || '');
    setEditImageUrl(primaryImg?.url || '');
    setEditShortDesc(product.shortDescription || '');
    setEditDesc(product.description || '');
    setEditFeatured(product.isFeatured || false);
    setEditSeoTitle(product.seoTitle || '');
    setEditSeoDesc(product.seoDescription || '');
    setEditError(null);
    setEditSuccess(false);
    setNewImageInput('');
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingProduct) return;

    if (!editName.trim() || !editSlug.trim()) {
      setEditError('Product name and slug are required.');
      return;
    }

    setIsSubmittingEdit(true);
    setEditError(null);

    const payload: UpdateProductPayload = {
      name: editName.trim(),
      slug: editSlug.trim(),
      categoryId: editCategoryId || undefined,
      status: editStatus,
      sellingPrice: editSellingPrice ? parseFloat(editSellingPrice) : undefined,
      buyingPrice: editBuyingPrice ? parseFloat(editBuyingPrice) : undefined,
      stockQuantity: editStock ? parseInt(editStock, 10) : undefined,
      sku: editSku.trim() || undefined,
      imageUrl: editImageUrl.trim() || undefined,
      shortDescription: editShortDesc.trim() || undefined,
      description: editDesc.trim() || undefined,
      isFeatured: editFeatured,
      seoTitle: editSeoTitle.trim() || undefined,
      seoDescription: editSeoDesc.trim() || undefined,
    };

    try {
      const updated = await adminApi.updateProduct(token, editingProduct.id, payload);
      setEditSuccess(true);
      setEditingProduct(updated);
      await fetchCatalog();

      setTimeout(() => {
        setEditSuccess(false);
        setEditingProduct(null);
      }, 1000);
    } catch (err) {
      if (err instanceof AdminApiError) {
        setEditError(err.message);
      } else {
        setEditError('Failed to update product.');
      }
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Add individual image in edit modal
  const handleAddImageToProduct = async (urlToAdd?: string) => {
    if (!token || !editingProduct) return;
    const url = (urlToAdd || newImageInput).trim();
    if (!url) return;

    setIsAddingImage(true);
    try {
      await adminApi.addProductImage(token, editingProduct.id, {
        url,
        altText: editingProduct.name,
        isPrimary: editingProduct.images?.length === 0,
      });
      setNewImageInput('');
      const updatedList = await adminApi.getProducts(token, { limit: 100 });
      setProducts(updatedList.data);
      const reloaded = updatedList.data.find((p) => p.id === editingProduct.id);
      if (reloaded) setEditingProduct(reloaded);
    } catch (err) {
      alert(err instanceof AdminApiError ? err.message : 'Failed to add image.');
    } finally {
      setIsAddingImage(false);
    }
  };

  // Delete individual image in edit modal
  const handleDeleteProductImage = async (imageId: string) => {
    if (!token || !editingProduct) return;
    setDeletingImageId(imageId);
    try {
      await adminApi.deleteProductImage(token, editingProduct.id, imageId);
      const updatedList = await adminApi.getProducts(token, { limit: 100 });
      setProducts(updatedList.data);
      const reloaded = updatedList.data.find((p) => p.id === editingProduct.id);
      if (reloaded) setEditingProduct(reloaded);
    } catch (err) {
      alert(err instanceof AdminApiError ? err.message : 'Failed to delete image.');
    } finally {
      setDeletingImageId(null);
    }
  };

  // Quick publication status toggle
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

  // Execute Product Deletion
  const handleDeleteProduct = async () => {
    if (!token || !deletingProduct) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await adminApi.deleteProduct(token, deletingProduct.id);
      setStatusActionMessage(
        `Product "${deletingProduct.name}" was permanently deleted.`,
      );
      setDeletingProduct(null);
      if (editingProduct?.id === deletingProduct.id) {
        setEditingProduct(null);
      }
      await fetchCatalog();
    } catch (err) {
      if (err instanceof AdminApiError) {
        setDeleteError(err.message);
      } else {
        setDeleteError('Failed to delete product.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.variants?.some((v) =>
        v.sku.toLowerCase().includes(searchQuery.toLowerCase()),
      ) ||
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
            onClick={() => {
              resetCreateForm();
              setIsCreateOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#111111] text-white text-xs font-mono uppercase tracking-[0.15em] hover:bg-black transition-all focus:outline-none cursor-pointer shadow-xs"
          >
            <Plus className="size-3.5" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Status banner */}
      {statusActionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono flex items-center justify-between">
          <span>{statusActionMessage}</span>
          <button
            onClick={() => setStatusActionMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
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
            placeholder="Search by title, SKU, slug, or category..."
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
            className="font-mono underline uppercase text-[10px] tracking-wider cursor-pointer"
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
              Try adjusting your search terms or filters above, or add a new product.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E5E5] bg-[#FBFBFA] text-[10px] font-mono uppercase tracking-[0.18em] text-[#777777]">
                  <th className="py-3 px-4 font-normal">Product</th>
                  <th className="py-3 px-4 font-normal">Category</th>
                  <th className="py-3 px-4 font-normal">Selling Price</th>
                  <th className="py-3 px-4 font-normal">Buying Price</th>
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
                  const defaultPrice =
                    defaultVariant?.prices?.find((pr) => pr.currency === 'USD') ||
                    defaultVariant?.prices?.[0];

                  const sellingPriceNum =
                    defaultPrice?.amount !== undefined
                      ? defaultPrice.amount / 100
                      : null;
                  const buyingPriceNum =
                    defaultPrice?.buyingPrice !== undefined &&
                    defaultPrice.buyingPrice !== null
                      ? defaultPrice.buyingPrice / 100
                      : null;

                  const margin =
                    sellingPriceNum && buyingPriceNum && sellingPriceNum > 0
                      ? Math.round(
                          ((sellingPriceNum - buyingPriceNum) / sellingPriceNum) *
                            100,
                        )
                      : null;

                  const stockQuantity = defaultVariant?.stockQuantity ?? '—';
                  const sku = defaultVariant?.sku || 'No SKU';

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-[#FBFBFA] transition-colors"
                    >
                      {/* Product Image & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="size-12 relative bg-[#F5F5F2] border border-[#E5E5E5] shrink-0 overflow-hidden">
                            <Image
                              src={primaryImage}
                              alt={p.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-[#111111] truncate max-w-xs sm:max-w-md">
                              {p.name}
                            </div>
                            <div className="text-[10px] font-mono text-[#777777] flex items-center gap-2 truncate">
                              <span>SKU: {sku}</span>
                              <span>·</span>
                              <span>slug: {p.slug}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 font-mono text-[#111111]">
                        <span className="px-2 py-0.5 bg-[#F5F5F2] border border-[#E5E5E5] text-[10px] uppercase">
                          {p.category?.name || 'Uncategorized'}
                        </span>
                      </td>

                      {/* Selling Price */}
                      <td className="py-3.5 px-4 font-mono text-[#111111]">
                        {sellingPriceNum !== null ? (
                          <span className="font-semibold text-[#111111]">
                            ${sellingPriceNum.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-[#AAAAAA] italic">Not set</span>
                        )}
                      </td>

                      {/* Buying Price */}
                      <td className="py-3.5 px-4 font-mono text-[#111111]">
                        {buyingPriceNum !== null ? (
                          <div className="flex items-center gap-1.5">
                            <span>${buyingPriceNum.toFixed(2)}</span>
                            {margin !== null && (
                              <span
                                className={`text-[9px] px-1 py-0.2 border ${
                                  margin >= 40
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : margin > 0
                                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                                    : 'bg-red-50 text-red-800 border-red-200'
                                }`}
                                title="Gross profit margin"
                              >
                                {margin > 0 ? `+${margin}%` : `${margin}%`}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#AAAAAA] italic">Not set</span>
                        )}
                      </td>

                      {/* Stock Level */}
                      <td className="py-3.5 px-4 font-mono">
                        <span
                          className={`${
                            typeof stockQuantity === 'number' &&
                            stockQuantity <= 5
                              ? 'text-amber-600 font-semibold'
                              : 'text-[#111111]'
                          }`}
                        >
                          {typeof stockQuantity === 'number'
                            ? `${stockQuantity} units`
                            : stockQuantity}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
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
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Super Admin Status Dropdown */}
                          {isSuperAdmin && (
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
                              title="Toggle Publication Status"
                            >
                              <option value="ACTIVE">ACTIVE</option>
                              <option value="DRAFT">DRAFT</option>
                              <option value="ARCHIVED">ARCHIVED</option>
                            </select>
                          )}

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-[#111111] hover:bg-[#111111] hover:text-white border border-[#E5E5E5] transition-all cursor-pointer"
                            title="Edit Product, Prices & Images"
                          >
                            <Edit className="size-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError(null);
                              setDeletingProduct(p);
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 transition-all cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="size-3.5" />
                          </button>

                          {/* View Inspector */}
                          <button
                            type="button"
                            onClick={() => setViewingProduct(p)}
                            className="p-1.5 text-[#777777] hover:text-[#111111] hover:bg-[#F5F5F2] border border-transparent hover:border-[#E5E5E5] transition-all cursor-pointer"
                            title="View Raw Details"
                          >
                            <Eye className="size-3.5" />
                          </button>

                          {/* Storefront Link */}
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

      {/* ======================================================== */}
      {/* MODAL 1: CREATE NEW PRODUCT                              */}
      {/* ======================================================== */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#E5E5E5] max-w-2xl w-full p-6 sm:p-8 max-h-[92vh] overflow-y-auto shadow-2xl relative font-mono text-xs">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-6 right-6 text-[#777777] hover:text-[#111111] cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="mb-6">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#777777]">
                NEW INVENTORY ITEM · POST /api/v1/admin/products
              </span>
              <h3 className="text-xl font-serif uppercase tracking-[0.1em] text-[#111111] mt-1 font-light">
                Add New Product
              </h3>
              <p className="text-xs text-[#777777] mt-1 font-sans">
                Create a product record complete with pricing, SKU, stock quantity, and catalog picture.
              </p>
            </div>

            {createSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span>Product created successfully! Updating catalog...</span>
              </div>
            )}

            {createError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
                <AlertCircle className="size-4 text-red-600 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-5">
              {/* Basic Information */}
              <div className="space-y-3 pb-4 border-b border-[#E5E5E5]">
                <div className="text-[10px] text-[#777777] uppercase tracking-wider font-semibold">
                  1. Identification & Classification
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase text-[10px] tracking-wider text-[#111111] mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Activated Charcoal Elixir"
                      className="w-full p-2 bg-[#FBFBFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
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
                      placeholder="e.g. activated-charcoal-elixir"
                      className="w-full p-2 bg-[#FBFBFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase text-[10px] tracking-wider text-[#111111] mb-1">
                      Category *
                    </label>
                    <select
                      required
                      value={formCategoryId}
                      onChange={(e) => setFormCategoryId(e.target.value)}
                      className="w-full p-2 bg-[#FBFBFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block uppercase text-[10px] tracking-wider text-[#111111] mb-1">
                      Initial Publication Status
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) =>
                        setFormStatus(e.target.value as ProductStatus)
                      }
                      className="w-full p-2 bg-[#FBFBFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                    >
                      <option value="DRAFT">DRAFT (Unpublished)</option>
                      <option value="ACTIVE">ACTIVE (Published in Store)</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing & Inventory */}
              <div className="space-y-3 pb-4 border-b border-[#E5E5E5]">
                <div className="text-[10px] text-[#777777] uppercase tracking-wider font-semibold">
                  2. Pricing & Inventory Configuration
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase text-[10px] tracking-wider text-[#111111] mb-1">
                      Selling Price ($ USD) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#777777]">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={formSellingPrice}
                        onChange={(e) => setFormSellingPrice(e.target.value)}
                        placeholder="24.99"
                        className="w-full pl-6 pr-3 py-2 bg-[#FBFBFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block uppercase text-[10px] tracking-wider text-[#111111] mb-1">
                      Buying / Cost Price ($ USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#777777]">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formBuyingPrice}
                        onChange={(e) => setFormBuyingPrice(e.target.value)}
                        placeholder="12.00"
                        className="w-full pl-6 pr-3 py-2 bg-[#FBFBFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase text-[10px] tracking-wider text-[#111111] mb-1">
                      Initial Stock Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value)}
                      placeholder="100"
                      className="w-full p-2 bg-[#FBFBFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="block uppercase text-[10px] tracking-wider text-[#111111] mb-1">
                      SKU Code
                    </label>
                    <input
                      type="text"
                      value={formSku}
                      onChange={(e) => setFormSku(e.target.value.toUpperCase())}
                      placeholder="e.g. CV-ELX-001"
                      className="w-full p-2 bg-[#FBFBFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                    />
                  </div>
                </div>
              </div>

              {/* Product Picture / Media */}
              <div className="space-y-3 pb-4 border-b border-[#E5E5E5]">
                <div className="text-[10px] text-[#777777] uppercase tracking-wider font-semibold">
                  3. Product Picture & Media
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="size-20 relative bg-[#F5F5F2] border border-[#E5E5E5] shrink-0 overflow-hidden">
                    {formImageUrl ? (
                      <Image
                        src={formImageUrl}
                        alt="Preview"
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-[#AAAAAA]">
                        <ImageIcon className="size-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <div>
                      <label className="block uppercase text-[10px] tracking-wider text-[#111111] mb-1">
                        Primary Image URL or Preset
                      </label>
                      <input
                        type="text"
                        value={formImageUrl}
                        onChange={(e) => setFormImageUrl(e.target.value)}
                        placeholder="e.g. /powder.jpg or https://..."
                        className="w-full p-2 bg-[#FBFBFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[9px] uppercase text-[#777777]">
                        Catalog Presets:
                      </span>
                      {IMAGE_PRESETS.map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => setFormImageUrl(preset.url)}
                          className={`px-2 py-0.5 text-[9px] border transition-colors cursor-pointer ${
                            formImageUrl === preset.url
                              ? 'bg-[#111111] text-white border-[#111111]'
                              : 'bg-white text-[#555555] border-[#E5E5E5] hover:border-[#111111]'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Descriptive Content */}
              <div className="space-y-3 pb-4 border-b border-[#E5E5E5]">
                <div className="text-[10px] text-[#777777] uppercase tracking-wider font-semibold">
                  4. Descriptive Content
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
                    className="w-full p-2 bg-[#FBFBFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
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
                    placeholder="Detailed botanical formulation notes..."
                    className="w-full p-2 bg-[#FBFBFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="create-featured"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    className="accent-[#111111] cursor-pointer"
                  />
                  <label
                    htmlFor="create-featured"
                    className="text-xs uppercase tracking-wider text-[#111111] cursor-pointer"
                  >
                    Feature on Storefront Homepage
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 bg-white border border-[#E5E5E5] text-[#111111] hover:bg-[#F5F5F2] uppercase tracking-wider text-[11px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCreate}
                  className="px-5 py-2.5 bg-[#111111] text-white hover:bg-black uppercase tracking-wider text-[11px] disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSubmittingCreate ? 'Saving Product...' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT PRODUCT                                   */}
      {/* ======================================================== */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#E5E5E5] max-w-2xl w-full p-6 sm:p-8 max-h-[92vh] overflow-y-auto shadow-2xl relative font-mono text-xs">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute top-6 right-6 text-[#777777] hover:text-[#111111] cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="mb-6">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#777777]">
                EDIT CATALOG RECORD · PATCH /api/v1/admin/products/{editingProduct.id.slice(0, 8)}...
              </span>
              <h3 className="text-xl font-serif uppercase tracking-[0.1em] text-[#111111] mt-1 font-light">
                Edit Product: {editingProduct.name}
              </h3>
              <p className="text-xs text-[#777777] mt-0.5 font-sans">
                Update product information, selling and buying prices, inventory stock, and pictures.
              </p>
            </div>

            {editSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span>Changes saved successfully! Updating list...</span>
              </div>
            )}

            {editError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
                <AlertCircle className="size-4 text-red-600 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProduct} className="space-y-5">
              {/* Basic Details */}
              <div className="space-y-3 pb-4 border-b border-[#E5E5E5]">
                <div className="text-[10px] text-[#777777] uppercase tracking-wider font-semibold">
                  1. Identification & Category
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase text-[10px] tracking-wider text-[#111111] mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full p-2 bg-[#FBFBFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="block uppercase text-[10px] tracking-wider text-[#111111] mb-1">
                      Slug *
                    </label>
                    <input
                      type="text"
                      required
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value)}
                      className="w-full p-2 bg-[#FBFBFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase text-[10px] tracking-wider text-[#111111] mb-1">
                      Category
                    </label>
                    <select
                      value={editCategoryId}
                      onChange={(e) => setEditCategoryId(e.target.value)}
                      className="w-full p-2 bg-[#FBFBFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block uppercase text-[10px] tracking-wider text-[#111111] mb-1">
                      Status
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) =>
                        setEditStatus(e.target.value as ProductStatus)
                      }
                      className="w-full p-2 bg-[#FBFBFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                    >
                      <option value="ACTIVE">ACTIVE (Published)</option>
                      <option value="DRAFT">DRAFT (Unpublished)</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing & Inventory */}
              <div className="space-y-3 pb-4 border-b border-[#E5E5E5]">
                <div className="text-[10px] text-[#777777] uppercase tracking-wider font-semibold">
                  2. Pricing & Stock Levels
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase text-[10px] tracking-wider text-[#111111] mb-1">
                      Selling Price ($ USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#777777]">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editSellingPrice}
                        onChange={(e) => setEditSellingPrice(e.target.value)}
                        placeholder="24.99"
                        className="w-full pl-6 pr-3 py-2 bg-[#FBFBFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block uppercase text-[10px] tracking-wider text-[#111111] mb-1">
                      Buying / Cost Price ($ USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#777777]">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editBuyingPrice}
                        onChange={(e) => setEditBuyingPrice(e.target.value)}
                        placeholder="12.00"
                        className="w-full pl-6 pr-3 py-2 bg-[#FBFBFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase text-[10px] tracking-wider text-[#111111] mb-1">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editStock}
                      onChange={(e) => setEditStock(e.target.value)}
                      placeholder="100"
                      className="w-full p-2 bg-[#FBFBFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="block uppercase text-[10px] tracking-wider text-[#111111] mb-1">
                      SKU Code
                    </label>
                    <input
                      type="text"
                      value={editSku}
                      onChange={(e) => setEditSku(e.target.value.toUpperCase())}
                      placeholder="e.g. CV-ELX-001"
                      className="w-full p-2 bg-[#FBFBFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                    />
                  </div>
                </div>
              </div>

              {/* Pictures / Media Gallery */}
              <div className="space-y-3 pb-4 border-b border-[#E5E5E5]">
                <div className="text-[10px] text-[#777777] uppercase tracking-wider font-semibold">
                  3. Pictures & Media Gallery
                </div>

                {/* Primary Image setting */}
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="size-20 relative bg-[#F5F5F2] border border-[#E5E5E5] shrink-0 overflow-hidden">
                    {editImageUrl ? (
                      <Image
                        src={editImageUrl}
                        alt="Primary"
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-[#AAAAAA]">
                        <ImageIcon className="size-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <div>
                      <label className="block uppercase text-[10px] tracking-wider text-[#111111] mb-1">
                        Primary Image URL
                      </label>
                      <input
                        type="text"
                        value={editImageUrl}
                        onChange={(e) => setEditImageUrl(e.target.value)}
                        placeholder="e.g. /powder.jpg or https://..."
                        className="w-full p-2 bg-[#FBFBFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[9px] uppercase text-[#777777]">
                        Presets:
                      </span>
                      {IMAGE_PRESETS.map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => setEditImageUrl(preset.url)}
                          className={`px-2 py-0.5 text-[9px] border transition-colors cursor-pointer ${
                            editImageUrl === preset.url
                              ? 'bg-[#111111] text-white border-[#111111]'
                              : 'bg-white text-[#555555] border-[#E5E5E5] hover:border-[#111111]'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Existing Images Gallery */}
                {editingProduct.images && editingProduct.images.length > 0 && (
                  <div className="pt-2">
                    <div className="text-[10px] text-[#777777] uppercase mb-2">
                      Attached Images ({editingProduct.images.length})
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {editingProduct.images.map((img) => (
                        <div
                          key={img.id}
                          className="p-2 bg-[#FBFBFA] border border-[#E5E5E5] relative group flex flex-col items-center"
                        >
                          <div className="size-16 relative bg-[#EFEFEF] overflow-hidden mb-1.5 border border-[#E5E5E5]">
                            <Image
                              src={img.url}
                              alt={img.altText || 'Product picture'}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </div>
                          <div className="text-[9px] text-[#777777] truncate w-full text-center">
                            {img.isPrimary ? '★ Primary' : img.url.split('/').pop()}
                          </div>
                          <button
                            type="button"
                            disabled={deletingImageId === img.id}
                            onClick={() => handleDeleteProductImage(img.id)}
                            className="mt-1 text-[9px] text-red-600 hover:text-red-900 underline cursor-pointer"
                          >
                            {deletingImageId === img.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add another image */}
                <div className="pt-2 bg-[#FBFBFA] p-3 border border-[#E5E5E5] space-y-2">
                  <div className="text-[10px] uppercase text-[#111111] font-semibold">
                    Add Another Picture to Gallery
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newImageInput}
                      onChange={(e) => setNewImageInput(e.target.value)}
                      placeholder="Paste picture URL or select a preset..."
                      className="flex-1 p-2 bg-white border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                    />
                    <button
                      type="button"
                      disabled={isAddingImage || !newImageInput.trim()}
                      onClick={() => handleAddImageToProduct()}
                      className="px-3 py-2 bg-[#111111] text-white uppercase text-[10px] tracking-wider disabled:opacity-40 cursor-pointer"
                    >
                      {isAddingImage ? 'Adding...' : 'Attach'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Descriptions & SEO */}
              <div className="space-y-3 pb-4 border-b border-[#E5E5E5]">
                <div className="text-[10px] text-[#777777] uppercase tracking-wider font-semibold">
                  4. Descriptions & Presentation
                </div>

                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-[#111111] mb-1">
                    Short Tagline
                  </label>
                  <input
                    type="text"
                    value={editShortDesc}
                    onChange={(e) => setEditShortDesc(e.target.value)}
                    className="w-full p-2 bg-[#FBFBFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] tracking-wider text-[#111111] mb-1">
                    Full Description
                  </label>
                  <textarea
                    rows={3}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full p-2 bg-[#FBFBFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="edit-featured"
                    checked={editFeatured}
                    onChange={(e) => setEditFeatured(e.target.checked)}
                    className="accent-[#111111] cursor-pointer"
                  />
                  <label
                    htmlFor="edit-featured"
                    className="text-xs uppercase tracking-wider text-[#111111] cursor-pointer"
                  >
                    Feature on Storefront Homepage
                  </label>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteError(null);
                    setDeletingProduct(editingProduct);
                  }}
                  className="px-3 py-2 border border-red-300 text-red-600 hover:bg-red-50 text-[10px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                  <span>Delete Product</span>
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 bg-white border border-[#E5E5E5] text-[#111111] hover:bg-[#F5F5F2] uppercase tracking-wider text-[11px] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingEdit}
                    className="px-5 py-2 bg-[#111111] text-white hover:bg-black uppercase tracking-wider text-[11px] disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {isSubmittingEdit ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: DELETE CONFIRMATION                             */}
      {/* ======================================================== */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-red-200 max-w-md w-full p-6 sm:p-8 shadow-2xl relative font-mono text-xs">
            <button
              onClick={() => setDeletingProduct(null)}
              className="absolute top-6 right-6 text-[#777777] hover:text-[#111111] cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-2 bg-red-50 border border-red-200">
                <Trash2 className="size-6 text-red-600" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-red-700">
                  CONFIRM ACTION
                </span>
                <h3 className="text-base font-serif uppercase tracking-[0.05em] text-[#111111]">
                  Delete Product Record
                </h3>
              </div>
            </div>

            <p className="text-xs text-[#555555] font-sans leading-relaxed mb-4">
              Are you sure you want to permanently delete{' '}
              <strong className="text-[#111111]">
                &quot;{deletingProduct.name}&quot;
              </strong>
              ? This action will remove the product, all variants, and pricing records.
            </p>

            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
                <AlertCircle className="size-4 text-red-600 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E5E5]">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 bg-white border border-[#E5E5E5] text-[#111111] hover:bg-[#F5F5F2] uppercase tracking-wider text-[11px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteProduct}
                className="px-5 py-2 bg-red-600 text-white hover:bg-red-700 uppercase tracking-wider text-[11px] disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: VIEW RAW PRODUCT DETAILS                        */}
      {/* ======================================================== */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#E5E5E5] max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative font-mono text-xs">
            <button
              onClick={() => setViewingProduct(null)}
              className="absolute top-6 right-6 text-[#777777] hover:text-[#111111] cursor-pointer"
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

              {/* Gallery */}
              <div className="pt-3">
                <div className="text-[10px] text-[#777777] uppercase mb-2">
                  Images ({viewingProduct.images?.length || 0})
                </div>
                <div className="flex flex-wrap gap-2">
                  {viewingProduct.images?.map((im) => (
                    <div
                      key={im.id}
                      className="size-16 relative bg-[#F5F5F2] border border-[#E5E5E5] overflow-hidden"
                    >
                      <Image
                        src={im.url}
                        alt="Product picture"
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                  {(!viewingProduct.images || viewingProduct.images.length === 0) && (
                    <div className="text-[#AAAAAA] italic text-[11px]">
                      No images attached.
                    </div>
                  )}
                </div>
              </div>

              {/* Variants */}
              <div className="pt-3">
                <div className="text-[10px] text-[#777777] uppercase mb-2">
                  Variants & Prices ({viewingProduct.variants?.length || 0})
                </div>
                {viewingProduct.variants?.map((v) => (
                  <div key={v.id} className="p-2.5 bg-[#FBFBFA] border border-[#E5E5E5] mb-2">
                    <div className="flex justify-between font-medium text-[#111111]">
                      <span>{v.name}</span>
                      <span>{v.stockQuantity} in stock</span>
                    </div>
                    <div className="text-[10px] text-[#777777] mt-1 flex flex-wrap gap-3">
                      <span>SKU: {v.sku}</span>
                      <span>
                        Selling Price: $
                        {v.prices?.[0]?.amount
                          ? (v.prices[0].amount / 100).toFixed(2)
                          : '—'}
                      </span>
                      <span>
                        Buying Price: $
                        {v.prices?.[0]?.buyingPrice
                          ? (v.prices[0].buyingPrice / 100).toFixed(2)
                          : '—'}
                      </span>
                    </div>
                  </div>
                ))}
                {(!viewingProduct.variants || viewingProduct.variants.length === 0) && (
                  <div className="text-[#AAAAAA] italic text-[11px]">
                    No variants created yet. Click Edit to add price and inventory.
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = viewingProduct;
                    setViewingProduct(null);
                    handleOpenEdit(toEdit);
                  }}
                  className="px-4 py-2 border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white uppercase tracking-wider text-[11px] cursor-pointer"
                >
                  Edit This Product
                </button>
                <button
                  type="button"
                  onClick={() => setViewingProduct(null)}
                  className="px-4 py-2 bg-[#111111] text-white uppercase tracking-wider text-[11px] cursor-pointer"
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
