export type AdminRole = 'ADMIN' | 'SUPER_ADMIN';

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  admin: AdminUser;
}

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  products?: Array<{
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

export interface ApiProductImage {
  id: string;
  productId: string;
  variantId: string | null;
  type: string;
  url: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
}

export interface ApiVariantPrice {
  id: string;
  variantId: string;
  currency: string;
  amount: number; // in cents
  createdAt: string;
  updatedAt: string;
}

export interface ApiProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  sizeValue: string | null;
  sizeUnit: string | null;
  weightGrams: number | null;
  barcode: string | null;
  isDefault: boolean;
  isActive: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  createdAt: string;
  updatedAt: string;
  prices: ApiVariantPrice[];
  images?: ApiProductImage[];
}

export interface ApiProduct {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  status: ProductStatus;
  isFeatured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  images: ApiProductImage[];
  variants: ApiProductVariant[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  product: {
    id: string;
    name: string;
    slug: string;
  };
  isLowStock: boolean;
}

export interface InventoryResponse {
  items: InventoryItem[];
  total: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderPayment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  createdAt: string;
}

export interface ApiOrder {
  id: string;
  orderNumber?: string;
  userId: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: number; // in cents
  subtotal: number;
  tax: number;
  shippingFee: number;
  currency: string;
  customerEmail: string;
  customerName?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    items: number;
  };
  items?: OrderItem[];
  payments?: OrderPayment[];
}

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  database: {
    status: string;
    type: string;
  };
}

export interface CreateProductPayload {
  name: string;
  slug: string;
  categoryId: string;
  shortDescription?: string;
  description?: string;
  isFeatured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
}
