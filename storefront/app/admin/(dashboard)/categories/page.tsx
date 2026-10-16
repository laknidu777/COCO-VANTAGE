'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FolderTree,
  Plus,
  RefreshCw,
  AlertCircle,
  Package,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { adminApi, AdminApiError } from '@/lib/admin-api';
import { ApiCategory } from '@/lib/admin-types';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminApi.getCategories();
      // For each category, fetch details to get active products count
      const categoriesWithProducts = await Promise.all(
        res.data.map(async (cat) => {
          try {
            const detail = await adminApi.getCategoryBySlug(cat.slug);
            return detail.data;
          } catch {
            return cat;
          }
        }),
      );
      setCategories(categoriesWithProducts);
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch categories.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#777777]">
            CATALOG HIERARCHY · NESTJS / PRISMA
          </div>
          <h2 className="text-xl sm:text-2xl font-serif uppercase tracking-[0.1em] text-[#111111] font-light mt-0.5">
            Category Catalog
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchCategories}
            title="Refresh Categories"
            disabled={isLoading}
            className="p-2.5 bg-white border border-[#E5E5E5] text-[#111111] hover:bg-[#F5F5F2] transition-colors focus:outline-none cursor-pointer"
          >
            <RefreshCw
              className={`size-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Backend Capability Banner */}
      <div className="p-4 bg-white border border-[#E5E5E5] flex items-start gap-3">
        <Info className="size-4 text-[#111111] shrink-0 mt-0.5" />
        <div className="text-xs font-mono text-[#555555] leading-relaxed">
          <strong className="text-[#111111] uppercase tracking-wider block mb-0.5">
            Backend Endpoint Capability Notice
          </strong>
          Active categories are retrieved live from <code className="text-[#111111] bg-[#F5F5F2] px-1 py-0.5">GET /api/v1/categories</code> and <code className="text-[#111111] bg-[#F5F5F2] px-1 py-0.5">GET /api/v1/categories/:slug</code>.
          The backend service currently provides read-only category endpoints. Creating or updating categories requires implementing <code className="text-[#111111] bg-[#F5F5F2] px-1 py-0.5">POST /api/v1/admin/categories</code> and <code className="text-[#111111] bg-[#F5F5F2] px-1 py-0.5">PATCH /api/v1/admin/categories/:id</code> in NestJS.
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
            onClick={fetchCategories}
            className="font-mono underline uppercase text-[10px] tracking-wider"
          >
            Retry Query
          </button>
        </div>
      )}

      {/* Category Cards Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-xs font-mono text-[#777777]">
          <div className="w-6 h-6 border-2 border-[#111111] border-t-transparent animate-spin mx-auto mb-3" />
          Fetching categories from NestJS API...
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white border border-[#E5E5E5] p-12 text-center">
          <Layers className="size-8 text-[#CCCCCC] mx-auto mb-3" />
          <h4 className="text-sm font-mono uppercase tracking-[0.15em] text-[#111111]">
            No Categories Configured
          </h4>
          <p className="text-xs text-[#777777] mt-1 font-sans">
            Seed categories into the database to view them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const productCount = cat.products?.length || 0;
            return (
              <div
                key={cat.id}
                className="bg-white border border-[#E5E5E5] p-6 flex flex-col justify-between hover:border-[#111111] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#777777]">
                      Sort Order: {cat.sortOrder}
                    </span>
                    <span className="px-2 py-0.5 bg-[#F5F5F2] border border-[#E5E5E5] text-[10px] font-mono uppercase text-[#111111]">
                      {productCount} {productCount === 1 ? 'Product' : 'Products'}
                    </span>
                  </div>

                  <h3 className="text-lg font-serif uppercase tracking-[0.1em] text-[#111111] font-light">
                    {cat.name}
                  </h3>

                  <div className="text-[11px] font-mono text-[#777777] mb-3">
                    slug: /{cat.slug}
                  </div>

                  <p className="text-xs text-[#555555] font-sans leading-relaxed mb-4">
                    {cat.description || 'No description provided.'}
                  </p>

                  {/* Products preview */}
                  {cat.products && cat.products.length > 0 && (
                    <div className="space-y-1.5 pt-3 border-t border-[#E5E5E5]">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#777777] mb-1">
                        Active Products:
                      </div>
                      {cat.products.slice(0, 3).map((prod) => (
                        <div
                          key={prod.id}
                          className="text-xs font-mono flex items-center justify-between text-[#111111]"
                        >
                          <span className="truncate pr-2">• {prod.name}</span>
                          {prod.isFeatured && (
                            <span className="text-[9px] uppercase px-1 bg-[#111111] text-white shrink-0">
                              Featured
                            </span>
                          )}
                        </div>
                      ))}
                      {cat.products.length > 3 && (
                        <div className="text-[10px] font-mono text-[#777777]">
                          + {cat.products.length - 3} more product(s)
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-[#E5E5E5] flex items-center justify-between">
                  <Link
                    href={`/admin/products`}
                    className="text-xs font-mono uppercase tracking-wider text-[#111111] hover:underline flex items-center gap-1"
                  >
                    <span>View Products</span>
                    <ArrowRight className="size-3" />
                  </Link>

                  <span className="text-[10px] font-mono text-emerald-600">
                    ● Live Catalog
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
