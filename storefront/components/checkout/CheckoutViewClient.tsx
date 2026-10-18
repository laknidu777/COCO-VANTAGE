"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Truck,
  CreditCard,
  Lock,
  Loader2,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useCustomerAuth } from "@/lib/customer-auth";
import {
  checkoutApi,
  CreateOrderPayload,
  OrderResponse,
  isValidStripeCheckoutUrl,
  ApiError,
} from "@/lib/checkout-api";
import {
  CheckoutFormData,
  DELIVERY_METHODS,
  PAYMENT_OPTIONS,
  calculateCheckoutEstimates,
} from "@/lib/checkout";
import { formatCurrency } from "@/lib/store-api";

const INITIAL_FORM_STATE: CheckoutFormData = {
  email: "",
  phone: "",
  firstName: "",
  lastName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  stateProvince: "",
  postalCode: "",
  country: "US",
  billingSameAsShipping: true,
  billingFirstName: "",
  billingLastName: "",
  billingAddressLine1: "",
  billingAddressLine2: "",
  billingCity: "",
  billingStateProvince: "",
  billingPostalCode: "",
  billingCountry: "US",
  customerNote: "",
};

interface FormErrors {
  email?: string;
  firstName?: string;
  lastName?: string;
  addressLine1?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  billingFirstName?: string;
  billingLastName?: string;
  billingAddressLine1?: string;
  billingCity?: string;
  billingPostalCode?: string;
}

type CheckoutPhase =
  | "idle"
  | "submitting_order"
  | "initiating_payment"
  | "redirecting"
  | "payment_retry";

export function CheckoutViewClient() {
  const { items, subtotal, subtotalInCents, formattedSubtotal, totalCount, token, isLoading: isCartLoading, refreshCart } = useCart();
  const { customer, isAuthenticated, token: customerToken } = useCustomerAuth();

  const [formData, setFormData] = useState<CheckoutFormData>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [phase, setPhase] = useState<CheckoutPhase>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // In-memory reference to order if created, to avoid duplicate order creation on retry
  const [createdOrder, setCreatedOrder] = useState<OrderResponse | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string>("");

  // Pre-fill email if customer is logged in
  useEffect(() => {
    if (isAuthenticated && customer?.email) {
      setFormData((prev) => {
        if (!prev.email) {
          return { ...prev, email: customer.email };
        }
        return prev;
      });
    }
  }, [isAuthenticated, customer]);

  const calculation = calculateCheckoutEstimates(subtotal);

  const validateField = (field: keyof CheckoutFormData, value: string): string | undefined => {
    switch (field) {
      case "email":
        if (!value.trim()) return "Email address is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
          return "Please provide a valid email format";
        return undefined;
      case "firstName":
        return !value.trim() ? "First name is required" : undefined;
      case "lastName":
        return !value.trim() ? "Last name is required" : undefined;
      case "addressLine1":
        return !value.trim() ? "Street address is required" : undefined;
      case "city":
        return !value.trim() ? "City is required" : undefined;
      case "postalCode":
        return !value.trim() ? "Postal / ZIP code is required" : undefined;
      case "billingFirstName":
        if (!formData.billingSameAsShipping && !value.trim())
          return "Billing first name is required";
        return undefined;
      case "billingLastName":
        if (!formData.billingSameAsShipping && !value.trim())
          return "Billing last name is required";
        return undefined;
      case "billingAddressLine1":
        if (!formData.billingSameAsShipping && !value.trim())
          return "Billing street address is required";
        return undefined;
      case "billingCity":
        if (!formData.billingSameAsShipping && !value.trim())
          return "Billing city is required";
        return undefined;
      case "billingPostalCode":
        if (!formData.billingSameAsShipping && !value.trim())
          return "Billing postal code is required";
        return undefined;
      default:
        return undefined;
    }
  };

  const validateAll = (): boolean => {
    const nextErrors: FormErrors = {
      email: validateField("email", formData.email),
      firstName: validateField("firstName", formData.firstName),
      lastName: validateField("lastName", formData.lastName),
      addressLine1: validateField("addressLine1", formData.addressLine1),
      city: validateField("city", formData.city),
      postalCode: validateField("postalCode", formData.postalCode),
    };

    if (!formData.billingSameAsShipping) {
      nextErrors.billingFirstName = validateField("billingFirstName", formData.billingFirstName);
      nextErrors.billingLastName = validateField("billingLastName", formData.billingLastName);
      nextErrors.billingAddressLine1 = validateField("billingAddressLine1", formData.billingAddressLine1);
      nextErrors.billingCity = validateField("billingCity", formData.billingCity);
      nextErrors.billingPostalCode = validateField("billingPostalCode", formData.billingPostalCode);
    }

    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleChange = (field: keyof CheckoutFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field] && typeof value === "string") {
      const err = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const handleBlur = (field: keyof CheckoutFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const val = formData[field];
    if (typeof val === "string") {
      const err = validateField(field, val);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  /**
   * Main Checkout Submission:
   * 1. Validates fields.
   * 2. Calls POST /api/v1/checkout/orders.
   * 3. Calls POST /api/v1/checkout/orders/:orderId/payment-session.
   * 4. Validates Stripe URL and redirects.
   */
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || phase !== "idle") return;

    setTouched({
      email: true,
      firstName: true,
      lastName: true,
      addressLine1: true,
      city: true,
      postalCode: true,
      billingFirstName: !formData.billingSameAsShipping,
      billingLastName: !formData.billingSameAsShipping,
      billingAddressLine1: !formData.billingSameAsShipping,
      billingCity: !formData.billingSameAsShipping,
      billingPostalCode: !formData.billingSameAsShipping,
    });

    const isValid = validateAll();
    if (!isValid) {
      window.scrollTo({ top: 180, behavior: "smooth" });
      return;
    }

    if (!token) {
      setErrorMessage("No active shopping cart session. Please return to your cart.");
      return;
    }

    setErrorMessage(null);
    setPhase("submitting_order");

    const email = formData.email.trim().toLowerCase();
    setSubmittedEmail(email);

    // Build payload matching backend CreateOrderDto
    const shippingAddress = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      address1: formData.addressLine1.trim(),
      address2: formData.addressLine2.trim() || undefined,
      city: formData.city.trim(),
      stateProvince: formData.stateProvince.trim() || undefined,
      postalCode: formData.postalCode.trim(),
      country: formData.country.trim().toUpperCase(),
    };

    const billingAddress = formData.billingSameAsShipping
      ? shippingAddress
      : {
          firstName: formData.billingFirstName.trim(),
          lastName: formData.billingLastName.trim(),
          address1: formData.billingAddressLine1.trim(),
          address2: formData.billingAddressLine2.trim() || undefined,
          city: formData.billingCity.trim(),
          stateProvince: formData.billingStateProvince.trim() || undefined,
          postalCode: formData.billingPostalCode.trim(),
          country: formData.billingCountry.trim().toUpperCase(),
        };

    const orderPayload: CreateOrderPayload = {
      email,
      phone: formData.phone.trim() || undefined,
      shippingAddress,
      billingAddress,
      customerNote: formData.customerNote.trim() || undefined,
    };

    let order: OrderResponse;

    try {
      // Step 1: Create Order (linking to customer account if authenticated)
      order = await checkoutApi.createOrder(
        orderPayload,
        token,
        customerToken || undefined,
      );
      setCreatedOrder(order);
      // Synchronize cart state since backend cleared cart items
      refreshCart().catch(() => {});
    } catch (err) {
      setPhase("idle");
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Failed to create order. Please review your cart and details.";
      setErrorMessage(msg);
      window.scrollTo({ top: 180, behavior: "smooth" });
      return;
    }

    // Step 2: Initiate Stripe Payment Session
    await initiateStripeSession(order.id, email, order.orderNumber);
  };

  /**
   * Initiates payment session for an already-created order.
   * Can be safely retried without recreating the order.
   */
  const initiateStripeSession = async (orderId: string, email: string, orderNumber?: string) => {
    setPhase("initiating_payment");
    setErrorMessage(null);

    try {
      const session = await checkoutApi.createPaymentSession(orderId, email);

      if (!isValidStripeCheckoutUrl(session.checkoutUrl)) {
        throw new Error("Received an unverified payment gateway redirect address.");
      }

      setPhase("redirecting");
      // Redirect safely to official Stripe Checkout URL
      window.location.href = session.checkoutUrl;
    } catch (err) {
      setPhase("payment_retry");
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Order created, but unable to initialize secure Stripe checkout session.";
      setErrorMessage(
        `${msg} (Order Reference: ${orderNumber || orderId}). You can retry initiating your payment session below.`
      );
    }
  };

  // Safe retry handler for an existing created order
  const handleRetryPayment = () => {
    if (!createdOrder) return;
    initiateStripeSession(
      createdOrder.id,
      submittedEmail || createdOrder.email,
      createdOrder.orderNumber
    );
  };

  // Loading cart guard
  if (isCartLoading) {
    return (
      <div className="max-w-7xl mx-auto py-24 text-center space-y-4">
        <Loader2 className="size-8 animate-spin mx-auto text-[#111111]" />
        <p className="text-xs font-mono uppercase tracking-widest text-[#777777]">
          Synchronizing botanical cart archive...
        </p>
      </div>
    );
  }

  // Empty cart guard (only when not in payment retry state for a created order)
  if (items.length === 0 && !createdOrder) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 sm:py-28 px-6 space-y-8 border border-[#E5E5E5] bg-white p-10 sm:p-14">
        <div className="mx-auto flex size-16 items-center justify-center border border-[#111111] bg-[#F5F5F2]">
          <span className="text-2xl font-mono text-[#111111]">∅</span>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#777777]">
            Archive · 0 Items
          </p>
          <h2 className="text-2xl sm:text-3xl font-light uppercase tracking-tight text-[#111111]">
            CHECKOUT UNAVAILABLE
          </h2>
          <p className="text-sm text-[#777777] leading-relaxed max-w-sm mx-auto">
            Your shopping selection is currently empty. Please add botanical formulations from The Collection before proceeding to checkout.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 h-13 px-8 bg-[#111111] text-white uppercase tracking-[0.2em] text-xs font-semibold hover:bg-black transition-colors w-full sm:w-auto"
          >
            <span>EXPLORE THE COLLECTION</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Global Error Banner */}
      {errorMessage && (
        <div className="border border-red-300 bg-red-50 p-4 sm:p-6 text-xs text-red-800 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <h3 className="font-semibold uppercase tracking-wider text-red-900 font-mono">
                {phase === "payment_retry" ? "Order Secured · Payment Action Required" : "Checkout Error"}
              </h3>
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          </div>

          {/* Payment Session Retry Button */}
          {phase === "payment_retry" && createdOrder && (
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleRetryPayment}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#111111] text-white font-mono uppercase text-xs tracking-wider hover:bg-black transition-colors cursor-pointer"
              >
                <RefreshCw className="size-3.5" />
                <span>Retry Stripe Payment Session</span>
              </button>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-6 py-2.5 border border-[#111111] bg-white text-[#111111] font-mono uppercase text-xs tracking-wider hover:bg-[#F5F5F2] transition-colors"
              >
                Return to Shop
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Redirecting Overlay / Banner */}
      {phase === "redirecting" && (
        <div className="border border-[#111111] bg-white p-6 sm:p-8 text-center space-y-4 shadow-sm animate-pulse">
          <Loader2 className="size-8 animate-spin mx-auto text-[#111111]" />
          <h2 className="text-sm font-mono uppercase tracking-widest text-[#111111]">
            Redirecting to Stripe Secure Checkout
          </h2>
          <p className="text-xs text-[#777777] max-w-md mx-auto">
            Your botanical allocation has been registered. You are being redirected to Stripe to finalize payment.
          </p>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Form Details */}
          <div className="lg:col-span-7 space-y-10">
            {/* 1. Contact Information */}
            <section className="space-y-4 border border-[#E5E5E5] bg-white p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
                <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#111111]">
                  1. Contact Information
                </h2>
                {isAuthenticated && (
                  <span className="text-[10px] font-mono text-[#777777] uppercase">
                    Account: {customer?.email}
                  </span>
                )}
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#777777] mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    disabled={phase !== "idle"}
                    placeholder="patron@domain.com"
                    className={`w-full h-11 px-3.5 text-xs font-mono border bg-[#F5F5F2] focus:bg-white focus:outline-none transition-colors ${
                      errors.email ? "border-red-500" : "border-[#E5E5E5] focus:border-[#111111]"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-[10px] font-mono text-red-600 mt-1">{errors.email}</p>
                  )}
                  <p className="text-[10px] font-mono text-[#777777] mt-1">
                    Stripe Checkout receipt and dispatch tracking will be transmitted here.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#777777] mb-1.5">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    disabled={phase !== "idle"}
                    placeholder="+1 (555) 012-3456"
                    className="w-full h-11 px-3.5 text-xs font-mono border border-[#E5E5E5] bg-[#F5F5F2] focus:bg-white focus:border-[#111111] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </section>

            {/* 2. Shipping Address */}
            <section className="space-y-4 border border-[#E5E5E5] bg-white p-6 sm:p-8">
              <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#111111] border-b border-[#E5E5E5] pb-4">
                2. Shipping Address
              </h2>

              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#777777] mb-1.5">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      onBlur={() => handleBlur("firstName")}
                      disabled={phase !== "idle"}
                      className={`w-full h-11 px-3.5 text-xs font-mono border bg-[#F5F5F2] focus:bg-white focus:outline-none transition-colors ${
                        errors.firstName ? "border-red-500" : "border-[#E5E5E5] focus:border-[#111111]"
                      }`}
                    />
                    {errors.firstName && (
                      <p className="text-[10px] font-mono text-red-600 mt-1">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#777777] mb-1.5">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      onBlur={() => handleBlur("lastName")}
                      disabled={phase !== "idle"}
                      className={`w-full h-11 px-3.5 text-xs font-mono border bg-[#F5F5F2] focus:bg-white focus:outline-none transition-colors ${
                        errors.lastName ? "border-red-500" : "border-[#E5E5E5] focus:border-[#111111]"
                      }`}
                    />
                    {errors.lastName && (
                      <p className="text-[10px] font-mono text-red-600 mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#777777] mb-1.5">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.addressLine1}
                    onChange={(e) => handleChange("addressLine1", e.target.value)}
                    onBlur={() => handleBlur("addressLine1")}
                    disabled={phase !== "idle"}
                    placeholder="123 Botanical Way"
                    className={`w-full h-11 px-3.5 text-xs font-mono border bg-[#F5F5F2] focus:bg-white focus:outline-none transition-colors ${
                      errors.addressLine1 ? "border-red-500" : "border-[#E5E5E5] focus:border-[#111111]"
                    }`}
                  />
                  {errors.addressLine1 && (
                    <p className="text-[10px] font-mono text-red-600 mt-1">{errors.addressLine1}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#777777] mb-1.5">
                    Apartment, Suite, Unit (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.addressLine2}
                    onChange={(e) => handleChange("addressLine2", e.target.value)}
                    disabled={phase !== "idle"}
                    placeholder="Suite 4B"
                    className="w-full h-11 px-3.5 text-xs font-mono border border-[#E5E5E5] bg-[#F5F5F2] focus:bg-white focus:border-[#111111] focus:outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#777777] mb-1.5">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      onBlur={() => handleBlur("city")}
                      disabled={phase !== "idle"}
                      className={`w-full h-11 px-3.5 text-xs font-mono border bg-[#F5F5F2] focus:bg-white focus:outline-none transition-colors ${
                        errors.city ? "border-red-500" : "border-[#E5E5E5] focus:border-[#111111]"
                      }`}
                    />
                    {errors.city && (
                      <p className="text-[10px] font-mono text-red-600 mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#777777] mb-1.5">
                      State / Province
                    </label>
                    <input
                      type="text"
                      value={formData.stateProvince}
                      onChange={(e) => handleChange("stateProvince", e.target.value)}
                      disabled={phase !== "idle"}
                      placeholder="NY"
                      className="w-full h-11 px-3.5 text-xs font-mono border border-[#E5E5E5] bg-[#F5F5F2] focus:bg-white focus:border-[#111111] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#777777] mb-1.5">
                      Postal / ZIP <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => handleChange("postalCode", e.target.value)}
                      onBlur={() => handleBlur("postalCode")}
                      disabled={phase !== "idle"}
                      className={`w-full h-11 px-3.5 text-xs font-mono border bg-[#F5F5F2] focus:bg-white focus:outline-none transition-colors ${
                        errors.postalCode ? "border-red-500" : "border-[#E5E5E5] focus:border-[#111111]"
                      }`}
                    />
                    {errors.postalCode && (
                      <p className="text-[10px] font-mono text-red-600 mt-1">{errors.postalCode}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#777777] mb-1.5">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                    disabled={phase !== "idle"}
                    className="w-full h-11 px-3.5 text-xs font-mono border border-[#E5E5E5] bg-[#F5F5F2] focus:bg-white focus:border-[#111111] focus:outline-none transition-colors"
                  >
                    <option value="US">United States (Domestic)</option>
                    <option value="CA">Canada (Cross-Border Tracked)</option>
                  </select>
                </div>
              </div>
            </section>

            {/* 3. Dispatch & Packaging (Transparent $0 Complimentary Dispatch) */}
            <section className="space-y-4 border border-[#E5E5E5] bg-white p-6 sm:p-8">
              <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#111111] border-b border-[#E5E5E5] pb-4">
                3. Dispatch & Packaging
              </h2>

              <div className="space-y-3 pt-2">
                {DELIVERY_METHODS.map((method) => (
                  <div
                    key={method.id}
                    className="p-4 border border-[#111111] bg-[#F5F5F2] flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <Truck className="size-4.5 text-[#111111] shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
                            {method.name}
                          </span>
                          <span className="text-[10px] font-mono bg-white border border-[#E5E5E5] px-2 py-0.5 text-[#777777]">
                            {method.estimate}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#777777] leading-relaxed">
                          {method.description}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold text-[#111111] whitespace-nowrap">
                      COMPLIMENTARY
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Payment Gateway Selection */}
            <section className="space-y-4 border border-[#E5E5E5] bg-white p-6 sm:p-8">
              <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#111111] border-b border-[#E5E5E5] pb-4">
                4. Payment Method
              </h2>

              <div className="space-y-3 pt-2">
                {PAYMENT_OPTIONS.map((opt) => (
                  <div
                    key={opt.id}
                    className="p-4 border border-[#111111] bg-[#F5F5F2] flex items-start gap-3.5"
                  >
                    <CreditCard className="size-4.5 text-[#111111] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
                          {opt.title}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#777777]">
                          <Lock className="size-3" />
                          <span>TLS 256-Bit</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-[#777777]">
                        {opt.subtitle}
                      </p>
                    </div>
                  </div>
                ))}

                <p className="text-[11px] text-[#777777] leading-relaxed pt-1">
                  Upon placing your order, you will be redirected to Stripe&apos;s hosted payment gateway to securely submit payment. No card credentials are stored or handled directly on COCO-VANTAGE servers.
                </p>
              </div>
            </section>

            {/* 5. Dispatch Notes */}
            <section className="space-y-4 border border-[#E5E5E5] bg-white p-6 sm:p-8">
              <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#111111] border-b border-[#E5E5E5] pb-4">
                5. Special Instructions (Optional)
              </h2>

              <div className="pt-2">
                <textarea
                  value={formData.customerNote}
                  onChange={(e) => handleChange("customerNote", e.target.value)}
                  disabled={phase !== "idle"}
                  rows={3}
                  maxLength={1000}
                  placeholder="Special instructions regarding packaging or courier access..."
                  className="w-full p-3.5 text-xs font-mono border border-[#E5E5E5] bg-[#F5F5F2] focus:bg-white focus:border-[#111111] focus:outline-none transition-colors"
                />
              </div>
            </section>
          </div>

          {/* Right Column: Order Review & Authoritative Totals */}
          <div className="lg:col-span-5 sticky top-28 space-y-6">
            <div className="border border-[#E5E5E5] bg-white p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
                <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#111111]">
                  Order Review ({totalCount} {totalCount === 1 ? "Item" : "Items"})
                </h2>
                <Link
                  href="/cart"
                  className="text-[11px] font-mono uppercase tracking-wider text-[#777777] hover:text-[#111111] transition-colors"
                >
                  Edit Cart
                </Link>
              </div>

              {/* Items List */}
              <div className="divide-y divide-[#E5E5E5] max-h-80 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative size-12 border border-[#E5E5E5] bg-[#F5F5F2] shrink-0 overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.alt}
                          fill
                          sizes="48px"
                          className="object-cover grayscale"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold uppercase tracking-wider text-[#111111] truncate">
                          {item.product.name}
                        </p>
                        <p className="text-[10px] font-mono text-[#777777]">
                          Qty {item.quantity} · {item.formattedUnitPrice}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-medium text-[#111111] shrink-0">
                      {item.formattedLineTotal}
                    </span>
                  </div>
                ))}
              </div>

              {/* Authoritative Totals Calculation */}
              <div className="space-y-3.5 border-t border-[#E5E5E5] pt-4 text-xs">
                <div className="flex justify-between items-center text-[#777777]">
                  <span>Merchandise Subtotal</span>
                  <span className="font-mono text-[#111111] font-medium">
                    {formattedSubtotal}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[#777777]">
                  <span>Botanical Courier Dispatch</span>
                  <span className="font-mono text-[11px] text-[#111111]">
                    Complimentary ($0.00)
                  </span>
                </div>

                <div className="flex justify-between items-center text-[#777777]">
                  <span>Estimated Tax</span>
                  <span className="font-mono text-[11px] text-[#111111]">
                    Inclusive ($0.00)
                  </span>
                </div>

                <div className="border-t border-[#E5E5E5] pt-4 flex justify-between items-baseline">
                  <div className="space-y-0.5">
                    <span className="text-sm font-semibold uppercase tracking-wider text-[#111111]">
                      Final Order Total
                    </span>
                    <p className="text-[10px] font-mono text-[#777777]">
                      Authoritative Stripe charge amount
                    </p>
                  </div>
                  <span className="text-xl font-mono font-semibold text-[#111111]">
                    {formattedSubtotal}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={phase !== "idle"}
                  className={`inline-flex items-center justify-center gap-2 w-full h-13 uppercase tracking-[0.2em] text-xs font-semibold transition-all duration-300 border ${
                    phase !== "idle"
                      ? "bg-[#333333] text-white border-[#333333] cursor-wait"
                      : "bg-[#111111] text-white border-[#111111] hover:bg-black cursor-pointer"
                  }`}
                >
                  {phase === "submitting_order" ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>SECURING ORDER ALLOCATION...</span>
                    </>
                  ) : phase === "initiating_payment" || phase === "redirecting" ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>PREPARING STRIPE CHECKOUT...</span>
                    </>
                  ) : (
                    <>
                      <span>PROCEED TO STRIPE PAYMENT</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>

                <Link
                  href="/cart"
                  className="inline-flex items-center justify-center w-full py-2.5 text-xs font-mono uppercase tracking-widest text-[#777777] hover:text-[#111111] transition-colors"
                >
                  ← Return to Cart
                </Link>
              </div>

              {/* Security Assurance */}
              <div className="pt-4 border-t border-[#E5E5E5] space-y-1.5 text-[10px] font-mono text-[#777777] uppercase tracking-wider">
                <div className="flex items-center gap-2 text-[#111111]">
                  <ShieldCheck className="size-3.5 text-green-700" />
                  <span>Stripe Hosted Payment Gateway</span>
                </div>
                <p>✓ Automated inventory reservation</p>
                <p>✓ Purity verification and airtight seal dispatch</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
