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
} from './admin-types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_PREFIX = '/api/v1';

export class AdminApiError extends Error {
  statusCode: number;
  data?: unknown;

  constructor(message: string, statusCode: number, data?: unknown) {
    super(message);
    this.name = 'AdminApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers = new Headers(options.headers || {});

  headers.set('Accept', 'application/json');

  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      if (data && typeof data === 'object') {
        const payload = data as { message?: string | string[]; error?: string };
        if (Array.isArray(payload.message)) {
          errorMessage = payload.message.join(', ');
        } else if (payload.message) {
          errorMessage = payload.message;
        } else if (payload.error) {
          errorMessage = payload.error;
        }
      }
      throw new AdminApiError(errorMessage, response.status, data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof AdminApiError) {
      throw error;
    }
    const message =
      error instanceof Error ? error.message : 'Network request failed';
    throw new AdminApiError(
      `Cannot connect to backend service (${message}). Ensure backend is active at ${API_BASE_URL}.`,
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
};
