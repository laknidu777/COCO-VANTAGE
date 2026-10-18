import { apiClient, ApiError } from './api-client';
import {
  ApiProduct,
  ApiProductVariant,
  ApiCategory,
  PaginatedResponse,
} from './admin-types';

export interface StoreProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug?: string;
  description: string;
  shortDescription: string;
  price: number; // in dollars (e.g. 15.99)
  priceInCents: number; // in cents (e.g. 1599)
  currency: string; // e.g. "USD"
  formattedPrice: string; // e.g. "$15.99"
  image: string;
  gallery: string[];
  alt: string;
  featured: boolean;
  weight: string;
  tagline: string;
  origin?: string;
  formulation?: string;
  sensoryNotes?: string[];
  suggestedUse?: string;
  isAvailable: boolean;
  stockQuantity: number;
  variants: ApiProductVariant[];
  raw: ApiProduct;
}

export interface StoreCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
}

export interface StoreCategoryWithProducts extends StoreCategory {
  products: Array<{
    id: string;
    name: string;
    slug: string;
    shortDescription: string | null;
    isFeatured: boolean;
    images: Array<{
      url: string;
      altText: string | null;
    }>;
  }>;
}

/**
 * Formats integer cents into a localized currency string safely.
 * e.g. formatCurrency(1599, 'USD') -> "$15.99"
 */
export function formatCurrency(
  amountInCents: number,
  currency = 'USD',
  locale = 'en-US',
): string {
  const safeCurrency = (currency || 'USD').toUpperCase();
  const dollars = amountInCents / 100;

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: safeCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(dollars);
  } catch {
    // Fallback if currency code is unusual
    return `${safeCurrency} ${dollars.toFixed(2)}`;
  }
}

/**
 * Maps a raw backend ApiProduct into a rich, consistent StoreProduct.
 */
export function mapApiProductToStoreProduct(apiProduct: ApiProduct): StoreProduct {
  const variants = apiProduct.variants || [];
  const defaultVariant = variants.find((v) => v.isDefault) || variants[0];

  // Price resolution: prefer USD or first available price on default variant
  const defaultPriceEntry =
    defaultVariant?.prices?.find((p) => p.currency === 'USD') ||
    defaultVariant?.prices?.[0];

  const priceInCents = defaultPriceEntry ? defaultPriceEntry.amount : 0;
  const currency = defaultPriceEntry?.currency || 'USD';
  const price = Number((priceInCents / 100).toFixed(2));
  const formattedPrice = formatCurrency(priceInCents, currency);

  // Image resolution: prefer primary product image or fallback
  const primaryImage =
    apiProduct.images?.find((img) => img.isPrimary) || apiProduct.images?.[0];

  let fallbackImage = '/powder.jpg';
  const lowerName = apiProduct.name.toLowerCase();
  if (lowerName.includes('stick') || lowerName.includes('quill')) {
    fallbackImage = '/sticks.jpg';
  } else if (lowerName.includes('blend')) {
    fallbackImage = '/blend.jpg';
  }

  const image = primaryImage?.url || fallbackImage;
  const alt = primaryImage?.altText || `${apiProduct.name} - COCO-VANTAGE`;

  const gallery =
    apiProduct.images && apiProduct.images.length > 0
      ? apiProduct.images.map((img) => img.url)
      : [image];

  // Weight resolution
  let weight = '100g / 3.5 oz';
  if (defaultVariant?.weightGrams) {
    const oz = (defaultVariant.weightGrams * 0.035274).toFixed(1);
    weight = `${defaultVariant.weightGrams}g / ${oz} oz`;
  } else if (defaultVariant?.sizeValue && defaultVariant?.sizeUnit) {
    weight = `${defaultVariant.sizeValue} ${defaultVariant.sizeUnit}`;
  }

  const categoryName = apiProduct.category?.name || 'Formulations';
  const shortDesc = apiProduct.shortDescription || '';
  const description = apiProduct.description || apiProduct.shortDescription || '';

  const totalStock = variants.reduce(
    (acc, v) => acc + (v.isActive ? v.stockQuantity : 0),
    0,
  );
  const isAvailable = variants.some(
    (v) => v.isActive && v.stockQuantity > 0,
  );

  return {
    id: apiProduct.id,
    slug: apiProduct.slug,
    name: apiProduct.name,
    category: categoryName,
    categorySlug: apiProduct.category?.slug,
    description,
    shortDescription: shortDesc,
    price,
    priceInCents,
    currency,
    formattedPrice,
    image,
    gallery,
    alt,
    featured: apiProduct.isFeatured || false,
    weight,
    tagline: shortDesc || 'Botanical Formulation · Single Origin',
    origin: 'Ceylon (Sri Lanka) Single-Origin Estate',
    formulation: '100% Micro-Milled Botanical Charcoal & Cinnamomum Verum',
    sensoryNotes: ['Smoky Sweetness', 'Warm Woody Undertone', 'Velvety Texture'],
    suggestedUse: 'Incorporate into botanical lattes, morning infusions, or artisanal decoctions.',
    isAvailable,
    stockQuantity: totalStock,
    variants,
    raw: apiProduct,
  };
}

export const storeApi = {
  /**
   * Fetch paginated list of active products from the backend.
   */
  async getProducts(params: { page?: number; limit?: number } = {}): Promise<{
    products: StoreProduct[];
    pagination: PaginatedResponse<ApiProduct>['pagination'];
  }> {
    const response = await apiClient.get<PaginatedResponse<ApiProduct>>('/products', {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 24,
      },
    });

    return {
      products: (response.data || []).map(mapApiProductToStoreProduct),
      pagination: response.pagination,
    };
  },

  /**
   * Fetch an active product by slug. Returns null if not found (404).
   */
  async getProductBySlug(slug: string): Promise<StoreProduct | null> {
    try {
      const response = await apiClient.get<{ data: ApiProduct }>(
        `/products/${encodeURIComponent(slug)}`,
      );

      if (!response || !response.data) {
        return null;
      }

      return mapApiProductToStoreProduct(response.data);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) {
        return null;
      }
      throw err;
    }
  },

  /**
   * Fetch active categories from the backend.
   */
  async getCategories(): Promise<StoreCategory[]> {
    const response = await apiClient.get<{ data: StoreCategory[] }>('/categories');
    return response.data || [];
  },

  /**
   * Fetch category with its active products by slug.
   */
  async getCategoryBySlug(slug: string): Promise<StoreCategoryWithProducts | null> {
    try {
      const response = await apiClient.get<{ data: StoreCategoryWithProducts }>(
        `/categories/${encodeURIComponent(slug)}`,
      );
      return response.data || null;
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) {
        return null;
      }
      throw err;
    }
  },

  /**
   * Deterministically retrieve featured products for the homepage.
   */
  async getFeaturedProducts(limit = 3): Promise<StoreProduct[]> {
    const { products } = await this.getProducts({ page: 1, limit: 20 });
    const featured = products.filter((p) => p.featured);

    if (featured.length >= limit) {
      return featured.slice(0, limit);
    }

    // Fill remaining slots deterministically with available products
    const nonFeatured = products.filter((p) => !p.featured);
    return [...featured, ...nonFeatured].slice(0, limit);
  },
};
