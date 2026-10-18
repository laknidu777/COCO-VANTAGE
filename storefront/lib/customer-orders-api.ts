import { apiClient, ApiError } from './api-client';

export interface CustomerOrderItem {
  id: string;
  productName: string;
  variantName: string;
  sku: string;
  unitPrice: number; // in integer cents
  quantity: number;
  lineTotal: number; // in integer cents
}

export interface CustomerOrderSummary {
  id: string;
  orderNumber: string;
  currency: string;
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  itemsCount: number;
  items: CustomerOrderItem[];
}

export interface CustomerAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  stateProvince?: string;
  postalCode: string;
  country: string;
}

export interface CustomerOrderDetail {
  id: string;
  orderNumber: string;
  email: string;
  phone: string | null;
  currency: string;
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  shippingAddress: CustomerAddress;
  billingAddress: CustomerAddress;
  customerNote: string | null;
  createdAt: string;
  updatedAt: string;
  items: CustomerOrderItem[];
}

export interface CustomerOrdersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CustomerOrdersResponse {
  data: CustomerOrderSummary[];
  pagination: CustomerOrdersPagination;
}

export const customerOrdersApi = {
  /**
   * Fetches the authenticated customer's order history with pagination.
   */
  async listOrders(
    token: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<CustomerOrdersResponse> {
    return apiClient.get<CustomerOrdersResponse>('/customer/orders', {
      token,
      params: { page, limit },
    });
  },

  /**
   * Fetches detail for a specific customer-owned order.
   * Returns generic 404 (via ApiError) if the order doesn't exist or is not owned by this customer.
   */
  async getOrder(token: string, orderId: string): Promise<CustomerOrderDetail> {
    return apiClient.get<CustomerOrderDetail>(`/customer/orders/${orderId}`, {
      token,
    });
  },
};

export { ApiError };
