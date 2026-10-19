import {
  AdminUser,
  ApiCategory,
  ApiOrder,
  ApiProduct,
  CreateProductPayload,
  HealthCheckResponse,
  InventoryResponse,
  LoginResponse,
  OrderStatus,
  PaginatedResponse,
  ProductStatus,
  UpdateProductPayload,
  ApiCustomerDetail,
  PaginatedCustomersResponse,
} from './admin-types';

import { apiClient, ApiError, API_PREFIX } from './api-client';

export class AdminApiError extends ApiError {
  constructor(message: string, statusCode: number, data?: unknown) {
    super(message, statusCode, data);
    this.name = 'AdminApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  try {
    return await apiClient.request<T>(path, {
      ...options,
      token,
    });
  } catch (error) {
    if (error instanceof AdminApiError) {
      throw error;
    }
    if (error instanceof ApiError) {
      throw new AdminApiError(error.message, error.statusCode, error.data);
    }
    const message =
      error instanceof Error ? error.message : 'Network request failed';
    throw new AdminApiError(
      `Cannot connect to backend service (${message}).`,
      0,
    );
  }
}

export const adminApi = {
  // Health
  async getHealth(): Promise<HealthCheckResponse> {
    return request<HealthCheckResponse>('/health');
  },

  // Auth
  async login(email: string, password: string): Promise<LoginResponse> {
    return request<LoginResponse>(`${API_PREFIX}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async getMe(token: string): Promise<AdminUser> {
    return request<AdminUser>(
      `${API_PREFIX}/auth/me`,
      { method: 'GET' },
      token,
    );
  },

  // Categories (Public endpoint)
  async getCategories(): Promise<{ data: ApiCategory[] }> {
    return request<{ data: ApiCategory[] }>(`${API_PREFIX}/categories`);
  },

  async getCategoryBySlug(
    slug: string,
  ): Promise<{ data: ApiCategory }> {
    return request<{ data: ApiCategory }>(`${API_PREFIX}/categories/${slug}`);
  },

  // Products (Admin endpoint - requires auth)
  async getProducts(
    token: string,
    params: { page?: number; limit?: number } = {},
  ): Promise<PaginatedResponse<ApiProduct>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<PaginatedResponse<ApiProduct>>(
      `${API_PREFIX}/admin/products${queryString}`,
      { method: 'GET' },
      token,
    );
  },

  async createProduct(
    token: string,
    payload: CreateProductPayload,
  ): Promise<ApiProduct> {
    return request<ApiProduct>(
      `${API_PREFIX}/admin/products`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  async updateProductStatus(
    token: string,
    id: string,
    status: ProductStatus,
  ): Promise<ApiProduct> {
    return request<ApiProduct>(
      `${API_PREFIX}/admin/products/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      },
      token,
    );
  },

  async updateProduct(
    token: string,
    id: string,
    payload: UpdateProductPayload,
  ): Promise<ApiProduct> {
    return request<ApiProduct>(
      `${API_PREFIX}/admin/products/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  async deleteProduct(
    token: string,
    id: string,
  ): Promise<{ message: string; id: string }> {
    return request<{ message: string; id: string }>(
      `${API_PREFIX}/admin/products/${id}`,
      {
        method: 'DELETE',
      },
      token,
    );
  },

  async addProductImage(
    token: string,
    productId: string,
    payload: {
      url: string;
      altText?: string;
      isPrimary?: boolean;
      sortOrder?: number;
    },
  ): Promise<any> {
    return request<any>(
      `${API_PREFIX}/admin/products/${productId}/images`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  async deleteProductImage(
    token: string,
    productId: string,
    imageId: string,
  ): Promise<{ message: string }> {
    return request<{ message: string }>(
      `${API_PREFIX}/admin/products/${productId}/images/${imageId}`,
      {
        method: 'DELETE',
      },
      token,
    );
  },

  // Inventory (Admin endpoint)
  async getInventory(
    token: string,
    lowStock = false,
  ): Promise<InventoryResponse> {
    return request<InventoryResponse>(
      `${API_PREFIX}/admin/inventory?lowStock=${lowStock}`,
      { method: 'GET' },
      token,
    );
  },

  // Orders (Admin endpoint)
  async getOrders(
    token: string,
    params: { page?: number; limit?: number; status?: string } = {},
  ): Promise<PaginatedResponse<ApiOrder>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.status && params.status !== 'ALL') {
      query.set('status', params.status);
    }
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<PaginatedResponse<ApiOrder>>(
      `${API_PREFIX}/admin/orders${queryString}`,
      { method: 'GET' },
      token,
    );
  },

  async getOrderById(token: string, id: string): Promise<ApiOrder> {
    return request<ApiOrder>(
      `${API_PREFIX}/admin/orders/${id}`,
      { method: 'GET' },
      token,
    );
  },

  async updateOrderStatus(
    token: string,
    id: string,
    status: OrderStatus,
  ): Promise<ApiOrder> {
    return request<ApiOrder>(
      `${API_PREFIX}/admin/orders/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      },
      token,
    );
  },

  // Customers (Admin endpoints)
  async getCustomers(
    token: string,
    params: { page?: number; limit?: number; search?: string } = {},
  ): Promise<PaginatedCustomersResponse> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.search && params.search.trim()) {
      query.set('search', params.search.trim());
    }
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<PaginatedCustomersResponse>(
      `${API_PREFIX}/admin/customers${queryString}`,
      { method: 'GET' },
      token,
    );
  },

  async getCustomerById(
    token: string,
    id: string,
  ): Promise<ApiCustomerDetail> {
    return request<ApiCustomerDetail>(
      `${API_PREFIX}/admin/customers/${id}`,
      { method: 'GET' },
      token,
    );
  },

  async updateCustomerStatus(
    token: string,
    id: string,
    isActive: boolean,
  ): Promise<{ id: string; email: string; isActive: boolean }> {
    return request<{ id: string; email: string; isActive: boolean }>(
      `${API_PREFIX}/admin/customers/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      },
      token,
    );
  },
};
