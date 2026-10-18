import { apiClient, ApiError } from './api-client';

export interface BackendCartItem {
  id: string;
  variantId: string;
  sku: string;
  variantName: string;
  product: {
    id: string;
    name: string;
    slug: string;
    status: string;
  };
  quantity: number;
  unitPrice: number | null; // in integer cents (e.g. 1599 = $15.99)
  lineTotal: number | null; // in integer cents
  currency: string;
  image: {
    url: string;
    altText: string | null;
  } | null;
  stockQuantity: number;
  available: boolean;
}

export interface BackendCart {
  id: string;
  currency: string;
  items: BackendCartItem[];
  itemCount: number;
  subtotal: number; // in integer cents
  expiresAt: string;
}

export interface CreateCartResponse {
  token: string;
  cart: {
    id: string;
    currency: string;
    expiresAt: string;
    items: BackendCartItem[];
    itemCount: number;
    subtotal: number;
  };
}

export const cartApi = {
  /**
   * Creates a new anonymous shopping cart and returns the 64-char token.
   */
  async createCart(currency = 'USD'): Promise<CreateCartResponse> {
    return apiClient.post<CreateCartResponse>('/cart', undefined, {
      params: { currency },
    });
  },

  /**
   * Retrieves the current cart using the X-Cart-Token header.
   */
  async getCart(token: string): Promise<BackendCart> {
    return apiClient.get<BackendCart>('/cart', {
      cartToken: token,
    });
  },

  /**
   * Adds a product variant to the cart.
   */
  async addItem(
    token: string,
    dto: { variantId: string; quantity: number; currency: string },
  ): Promise<BackendCart> {
    return apiClient.post<BackendCart>('/cart/items', dto, {
      cartToken: token,
    });
  },

  /**
   * Updates a cart item's quantity.
   */
  async updateItem(
    token: string,
    itemId: string,
    quantity: number,
  ): Promise<BackendCart> {
    return apiClient.patch<BackendCart>(`/cart/items/${itemId}`, { quantity }, {
      cartToken: token,
    });
  },

  /**
   * Removes an individual item from the cart.
   */
  async removeItem(token: string, itemId: string): Promise<BackendCart> {
    return apiClient.delete<BackendCart>(`/cart/items/${itemId}`, {
      cartToken: token,
    });
  },

  /**
   * Clears all items from the cart.
   */
  async clearCart(token: string): Promise<BackendCart> {
    return apiClient.delete<BackendCart>('/cart/items', {
      cartToken: token,
    });
  },
};

export { ApiError };
