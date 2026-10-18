export type CountryCode = "US" | "CA";

export type DeliveryMethodId = "standard" | "priority";

export interface DeliveryMethod {
  id: DeliveryMethodId;
  name: string;
  estimate: string;
  rate: number; // in USD
  description: string;
}

export const DELIVERY_METHODS: DeliveryMethod[] = [
  {
    id: "standard",
    name: "Complimentary Botanical Dispatch",
    estimate: "2–4 business days",
    rate: 0.0,
    description: "Climate-calibrated courier dispatch with complete batch provenance tracking.",
  },
];

export type PaymentMethodId = "stripe";

export interface PaymentOption {
  id: PaymentMethodId;
  title: string;
  subtitle: string;
}

export const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: "stripe",
    title: "Stripe Secure Checkout",
    subtitle: "Credit card, debit card, Apple Pay, and Google Pay via Stripe.",
  },
];

export interface CheckoutFormData {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: CountryCode;
  billingSameAsShipping: boolean;
  billingFirstName: string;
  billingLastName: string;
  billingAddressLine1: string;
  billingAddressLine2: string;
  billingCity: string;
  billingStateProvince: string;
  billingPostalCode: string;
  billingCountry: CountryCode;
  customerNote: string;
}

export interface CheckoutCalculation {
  merchandiseSubtotal: number;
  shippingEstimate: number;
  taxEstimate: number;
  totalEstimate: number;
}

/**
 * Computes checkout estimates matching the backend contract:
 * - Shipping is complimentary ($0.00) across all formulations.
 * - Tax is $0.00 at order creation (calculated/handled transparently).
 * - Total equals merchandise subtotal server-authoritatively.
 */
export function calculateCheckoutEstimates(
  subtotal: number,
): CheckoutCalculation {
  const safeSubtotal = Number(subtotal.toFixed(2));
  return {
    merchandiseSubtotal: safeSubtotal,
    shippingEstimate: 0.0,
    taxEstimate: 0.0,
    totalEstimate: safeSubtotal,
  };
}
