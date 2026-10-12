export type CountryCode = "US" | "CA";

export type DeliveryMethodId = "standard" | "express";

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
    name: "Standard Botanical Dispatch",
    estimate: "3–5 business days",
    rate: 8.0,
    description: "Climate-calibrated courier dispatch with complete batch tracking.",
  },
  {
    id: "express",
    name: "Express Priority Courier",
    estimate: "1–2 business days",
    rate: 18.0,
    description: "Expedited air transport with guaranteed priority handling.",
  },
];

export type PaymentMethodId = "card" | "wallet" | "bank";

export interface PaymentOption {
  id: PaymentMethodId;
  title: string;
  subtitle: string;
}

export const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: "card",
    title: "Credit or Debit Card",
    subtitle: "Visa, Mastercard, American Express (Demonstration selection)",
  },
  {
    id: "wallet",
    title: "Digital Wallet",
    subtitle: "Apple Pay, Google Pay (Demonstration selection)",
  },
  {
    id: "bank",
    title: "Direct Bank Transfer",
    subtitle: "Wire or electronic transfer (Demonstration selection)",
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
  deliveryMethodId: DeliveryMethodId;
  paymentMethodId: PaymentMethodId;
}

export interface CheckoutCalculation {
  merchandiseSubtotal: number;
  shippingEstimate: number;
  taxEstimate: number;
  totalEstimate: number;
}

/**
 * Reusable utility to compute checkout estimates.
 * Free standard shipping on merchandise subtotal >= $50.
 * Demonstrative tax rate of 7.5% (clearly marked as estimate).
 */
export function calculateCheckoutEstimates(
  subtotal: number,
  deliveryMethodId: DeliveryMethodId
): CheckoutCalculation {
  const method =
    DELIVERY_METHODS.find((m) => m.id === deliveryMethodId) ||
    DELIVERY_METHODS[0];

  // Complimentary standard shipping on subtotal >= 50
  let shippingEstimate = method.rate;
  if (method.id === "standard" && subtotal >= 50) {
    shippingEstimate = 0.0;
  }

  // Provisional demonstrative tax estimate (7.5%)
  const taxEstimate = subtotal > 0 ? Number((subtotal * 0.075).toFixed(2)) : 0;

  const totalEstimate = Number(
    (subtotal + shippingEstimate + taxEstimate).toFixed(2)
  );

  return {
    merchandiseSubtotal: Number(subtotal.toFixed(2)),
    shippingEstimate,
    taxEstimate,
    totalEstimate,
  };
}
