import { apiClient, ApiError } from './api-client';

export interface CheckoutAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  stateProvince?: string;
  postalCode: string;
  country: string; // 2-letter ISO (e.g. "US", "CA")
}

export interface CreateOrderPayload {
  email: string;
  phone?: string;
  shippingAddress: CheckoutAddress;
  billingAddress: CheckoutAddress;
  customerNote?: string;
}

export interface OrderItemResponse {
  productName: string;
  variantName: string;
  sku: string;
  unitPrice: number; // in integer cents
  quantity: number;
  lineTotal: number; // in integer cents
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  email: string;
  currency: string;
  subtotal: number; // in integer cents
  shippingAmount: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number; // in integer cents
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItemResponse[];
}

export interface PaymentSessionResponse {
  orderId: string;
  orderNumber: string;
  checkoutUrl: string;
  sessionId: string;
}

/**
 * Validates that a returned redirect URL is a secure, official Stripe Checkout URL.
 */
export function isValidStripeCheckoutUrl(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== 'string') return false;
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'https:') return false;

    // Verify it is on checkout.stripe.com or a valid official stripe.com subdomain
    const hostname = parsed.hostname.toLowerCase();
    return (
      hostname === 'checkout.stripe.com' ||
      hostname.endsWith('.stripe.com')
    );
  } catch {
    return false;
  }
}

export const checkoutApi = {
  /**
   * Creates a pending order from the cart identified by X-Cart-Token, optionally linked to an authenticated customer.
   */
  async createOrder(
    payload: CreateOrderPayload,
    cartToken: string,
    customerToken?: string,
  ): Promise<OrderResponse> {
    return apiClient.post<OrderResponse>('/checkout/orders', payload, {
      cartToken,
      token: customerToken,
    });
  },

  /**
   * Initiates or retrieves an existing open Stripe Checkout Session for an order.
   */
  async createPaymentSession(
    orderId: string,
    email: string,
  ): Promise<PaymentSessionResponse> {
    return apiClient.post<PaymentSessionResponse>(
      `/checkout/orders/${orderId}/payment-session`,
      { email },
    );
  },
};

export { ApiError };
