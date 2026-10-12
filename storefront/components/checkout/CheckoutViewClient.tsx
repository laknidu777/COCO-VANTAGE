"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  CreditCard,
  Lock,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import {
  CheckoutFormData,
  DELIVERY_METHODS,
  PAYMENT_OPTIONS,
  calculateCheckoutEstimates,
} from "@/lib/checkout";

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
  deliveryMethodId: "standard",
  paymentMethodId: "card",
};

interface FormErrors {
  email?: string;
  firstName?: string;
  lastName?: string;
  addressLine1?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
}

export function CheckoutViewClient() {
  const { items, subtotal, totalCount, clearCart } = useCart();
  const [formData, setFormData] = useState<CheckoutFormData>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderReference, setOrderReference] = useState<string>("");

  const calculation = calculateCheckoutEstimates(
    subtotal,
    formData.deliveryMethodId
  );

  const validateField = (field: keyof CheckoutFormData, value: string): string | undefined => {
    switch (field) {
      case "email":
        if (!value.trim()) return "Email address is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Please enter a valid email format";
        return undefined;
      case "firstName":
        return !value.trim() ? "First name is required" : undefined;
      case "lastName":
        return !value.trim() ? "Last name is required" : undefined;
      case "addressLine1":
        return !value.trim() ? "Street address is required" : undefined;
      case "city":
        return !value.trim() ? "City is required" : undefined;
      case "stateProvince":
        return !value.trim() ? "State or Province is required" : undefined;
      case "postalCode":
        return !value.trim() ? "ZIP or Postal Code is required" : undefined;
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
      stateProvince: validateField("stateProvince", formData.stateProvince),
      postalCode: validateField("postalCode", formData.postalCode),
    };

    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleChange = (
    field: keyof CheckoutFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const err = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const handleBlur = (field: keyof CheckoutFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    // Mark all as touched
    setTouched({
      email: true,
      firstName: true,
      lastName: true,
      addressLine1: true,
      city: true,
      stateProvince: true,
      postalCode: true,
    });

    const isValid = validateAll();
    if (!isValid) {
      window.scrollTo({ top: 180, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);
    // Simulate brief order confirmation transition
    setTimeout(() => {
      const generatedRef = `CV-DEMO-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderReference(generatedRef);
      setIsSubmitted(true);
      setIsSubmitting(false);
      clearCart();
      window.scrollTo({ top: 100, behavior: "smooth" });
    }, 600);
  };

  // If order is completed in mock test flow
  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-16 sm:py-24 space-y-8">
        <div className="border border-[#111111] bg-white p-8 sm:p-12 text-center space-y-6">
          <div className="mx-auto flex size-14 items-center justify-center border border-[#111111] bg-[#F5F5F2]">
            <CheckCircle2 className="size-7 text-[#111111]" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#777777]">
              Simulation Complete · Non-Commercial Order
            </span>
            <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-tight text-[#111111]">
              TEST ORDER PLACED
            </h1>
            <p className="font-mono text-sm font-semibold text-[#111111]">
              Reference: {orderReference}
            </p>
          </div>

          <div className="border border-[#E5E5E5] bg-[#F5F5F2] p-5 text-left text-xs space-y-2 text-[#777777]">
            <p className="font-medium text-[#111111]">
              Demonstration Environment Notice:
            </p>
            <p>
              This is a development test order for COCO-VANTAGE. No payment was charged, no banking credentials were collected, and no real delivery will occur.
            </p>
            <div className="pt-2 border-t border-[#E5E5E5] text-[11px] font-mono text-[#111111]">
              Dispatched confirmation preview sent to: <span className="underline">{formData.email}</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-[#111111] text-white uppercase tracking-widest text-xs font-semibold hover:bg-black transition-colors w-full sm:w-auto"
            >
              <span>RETURN TO COLLECTION</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart guard
  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 sm:py-28 px-6 space-y-8 border border-[#E5E5E5] bg-white p-10 sm:p-14">
        <div className="mx-auto flex size-16 items-center justify-center border border-[#111111] bg-[#F5F5F2]">
          <span className="text-2xl font-mono text-[#111111]">∅</span>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#777777]">
            Checkout · 0 Items
          </p>
          <h2 className="text-2xl sm:text-3xl font-light uppercase tracking-tight text-[#111111]">
            YOUR CART IS EMPTY
          </h2>
          <p className="text-sm text-[#777777] leading-relaxed max-w-sm mx-auto">
            You must add at least one formulation to your selection before proceeding through checkout.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-[#111111] text-white uppercase tracking-[0.2em] text-xs font-semibold hover:bg-black transition-colors"
          >
            <span>EXPLORE SHOP</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
      {/* LEFT COLUMN: Customer, Shipping, Delivery, Payment Form */}
      <form
        onSubmit={handlePlaceOrder}
        noValidate
        className="lg:col-span-7 space-y-10"
      >
        {/* Notice of Demo Checkout */}
        <div className="border border-[#111111] bg-white p-4.5 flex items-start gap-3">
          <Lock className="size-4 text-[#111111] shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-[#777777]">
            <span className="font-semibold text-[#111111] uppercase tracking-wider block font-mono text-[11px]">
              Prototype Checkout Mode
            </span>
            No payment credentials or credit cards will be collected. This form validates contact and destination information for preview purposes.
          </div>
        </div>

        {/* 1. Contact Information */}
        <section aria-labelledby="contact-heading" className="space-y-4">
          <div className="border-b border-[#E5E5E5] pb-2">
            <h2
              id="contact-heading"
              className="text-xs font-mono uppercase tracking-[0.2em] text-[#111111] font-semibold"
            >
              01. Contact Information
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="checkout-email"
                className="block text-xs font-mono uppercase tracking-wider text-[#777777] mb-1.5"
              >
                Email Address <span className="text-[#111111]">*</span>
              </label>
              <input
                id="checkout-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                placeholder="client@domain.com"
                className={`w-full h-11 px-3.5 bg-white border text-xs font-mono text-[#111111] placeholder:text-[#AAAAAA] focus:outline-hidden transition-colors ${
                  errors.email
                    ? "border-red-600 focus:border-red-600"
                    : "border-[#E5E5E5] focus:border-[#111111]"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-[11px] font-mono text-red-600 flex items-center gap-1">
                  <AlertCircle className="size-3 shrink-0" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="checkout-phone"
                className="block text-xs font-mono uppercase tracking-wider text-[#777777] mb-1.5"
              >
                Phone Number <span className="text-[#AAAAAA]">(Optional for dispatch updates)</span>
              </label>
              <input
                id="checkout-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full h-11 px-3.5 bg-white border border-[#E5E5E5] focus:border-[#111111] text-xs font-mono text-[#111111] placeholder:text-[#AAAAAA] focus:outline-hidden transition-colors"
              />
            </div>
          </div>
        </section>

        {/* 2. Shipping Address */}
        <section aria-labelledby="shipping-heading" className="space-y-4">
          <div className="border-b border-[#E5E5E5] pb-2">
            <h2
              id="shipping-heading"
              className="text-xs font-mono uppercase tracking-[0.2em] text-[#111111] font-semibold"
            >
              02. Shipping Destination
            </h2>
          </div>

          <div className="space-y-4">
            {/* Country Selector */}
            <div>
              <label
                htmlFor="checkout-country"
                className="block text-xs font-mono uppercase tracking-wider text-[#777777] mb-1.5"
              >
                Country / Region <span className="text-[#111111]">*</span>
              </label>
              <select
                id="checkout-country"
                value={formData.country}
                onChange={(e) =>
                  handleChange("country", e.target.value as "US" | "CA")
                }
                className="w-full h-11 px-3.5 bg-white border border-[#E5E5E5] focus:border-[#111111] text-xs font-mono uppercase text-[#111111] focus:outline-hidden transition-colors cursor-pointer"
              >
                <option value="US">United States (Domestic Dispatch)</option>
                <option value="CA">Canada (Cross-Border Courier)</option>
              </select>
            </div>

            {/* First & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="checkout-firstName"
                  className="block text-xs font-mono uppercase tracking-wider text-[#777777] mb-1.5"
                >
                  First Name <span className="text-[#111111]">*</span>
                </label>
                <input
                  id="checkout-firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  onBlur={() => handleBlur("firstName")}
                  className={`w-full h-11 px-3.5 bg-white border text-xs font-mono text-[#111111] focus:outline-hidden transition-colors ${
                    errors.firstName
                      ? "border-red-600 focus:border-red-600"
                      : "border-[#E5E5E5] focus:border-[#111111]"
                  }`}
                />
                {errors.firstName && (
                  <p className="mt-1 text-[11px] font-mono text-red-600">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="checkout-lastName"
                  className="block text-xs font-mono uppercase tracking-wider text-[#777777] mb-1.5"
                >
                  Last Name <span className="text-[#111111]">*</span>
                </label>
                <input
                  id="checkout-lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  onBlur={() => handleBlur("lastName")}
                  className={`w-full h-11 px-3.5 bg-white border text-xs font-mono text-[#111111] focus:outline-hidden transition-colors ${
                    errors.lastName
                      ? "border-red-600 focus:border-red-600"
                      : "border-[#E5E5E5] focus:border-[#111111]"
                  }`}
                />
                {errors.lastName && (
                  <p className="mt-1 text-[11px] font-mono text-red-600">
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Address Line 1 */}
            <div>
              <label
                htmlFor="checkout-addressLine1"
                className="block text-xs font-mono uppercase tracking-wider text-[#777777] mb-1.5"
              >
                Street Address <span className="text-[#111111]">*</span>
              </label>
              <input
                id="checkout-addressLine1"
                type="text"
                placeholder="100 Obsidian Way"
                value={formData.addressLine1}
                onChange={(e) => handleChange("addressLine1", e.target.value)}
                onBlur={() => handleBlur("addressLine1")}
                className={`w-full h-11 px-3.5 bg-white border text-xs font-mono text-[#111111] placeholder:text-[#AAAAAA] focus:outline-hidden transition-colors ${
                  errors.addressLine1
                    ? "border-red-600 focus:border-red-600"
                    : "border-[#E5E5E5] focus:border-[#111111]"
                }`}
              />
              {errors.addressLine1 && (
                <p className="mt-1 text-[11px] font-mono text-red-600">
                  {errors.addressLine1}
                </p>
              )}
            </div>

            {/* Address Line 2 */}
            <div>
              <label
                htmlFor="checkout-addressLine2"
                className="block text-xs font-mono uppercase tracking-wider text-[#777777] mb-1.5"
              >
                Apartment, Suite, Unit <span className="text-[#AAAAAA]">(Optional)</span>
              </label>
              <input
                id="checkout-addressLine2"
                type="text"
                placeholder="Suite 4B"
                value={formData.addressLine2}
                onChange={(e) => handleChange("addressLine2", e.target.value)}
                className="w-full h-11 px-3.5 bg-white border border-[#E5E5E5] focus:border-[#111111] text-xs font-mono text-[#111111] placeholder:text-[#AAAAAA] focus:outline-hidden transition-colors"
              />
            </div>

            {/* City, State, Postal Code */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="checkout-city"
                  className="block text-xs font-mono uppercase tracking-wider text-[#777777] mb-1.5"
                >
                  City <span className="text-[#111111]">*</span>
                </label>
                <input
                  id="checkout-city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  onBlur={() => handleBlur("city")}
                  className={`w-full h-11 px-3.5 bg-white border text-xs font-mono text-[#111111] focus:outline-hidden transition-colors ${
                    errors.city
                      ? "border-red-600 focus:border-red-600"
                      : "border-[#E5E5E5] focus:border-[#111111]"
                  }`}
                />
                {errors.city && (
                  <p className="mt-1 text-[11px] font-mono text-red-600">
                    {errors.city}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="checkout-stateProvince"
                  className="block text-xs font-mono uppercase tracking-wider text-[#777777] mb-1.5"
                >
                  State / Province <span className="text-[#111111]">*</span>
                </label>
                <input
                  id="checkout-stateProvince"
                  type="text"
                  placeholder="NY or ON"
                  value={formData.stateProvince}
                  onChange={(e) => handleChange("stateProvince", e.target.value)}
                  onBlur={() => handleBlur("stateProvince")}
                  className={`w-full h-11 px-3.5 bg-white border text-xs font-mono text-[#111111] placeholder:text-[#AAAAAA] focus:outline-hidden transition-colors ${
                    errors.stateProvince
                      ? "border-red-600 focus:border-red-600"
                      : "border-[#E5E5E5] focus:border-[#111111]"
                  }`}
                />
                {errors.stateProvince && (
                  <p className="mt-1 text-[11px] font-mono text-red-600">
                    {errors.stateProvince}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="checkout-postalCode"
                  className="block text-xs font-mono uppercase tracking-wider text-[#777777] mb-1.5"
                >
                  ZIP / Postal Code <span className="text-[#111111]">*</span>
                </label>
                <input
                  id="checkout-postalCode"
                  type="text"
                  placeholder="10001"
                  value={formData.postalCode}
                  onChange={(e) => handleChange("postalCode", e.target.value)}
                  onBlur={() => handleBlur("postalCode")}
                  className={`w-full h-11 px-3.5 bg-white border text-xs font-mono text-[#111111] placeholder:text-[#AAAAAA] focus:outline-hidden transition-colors ${
                    errors.postalCode
                      ? "border-red-600 focus:border-red-600"
                      : "border-[#E5E5E5] focus:border-[#111111]"
                  }`}
                />
                {errors.postalCode && (
                  <p className="mt-1 text-[11px] font-mono text-red-600">
                    {errors.postalCode}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 3. Delivery Method */}
        <section aria-labelledby="delivery-heading" className="space-y-4">
          <div className="border-b border-[#E5E5E5] pb-2">
            <h2
              id="delivery-heading"
              className="text-xs font-mono uppercase tracking-[0.2em] text-[#111111] font-semibold"
            >
              03. Delivery Method
            </h2>
          </div>

          <div className="space-y-3">
            {DELIVERY_METHODS.map((method) => {
              const isSelected = formData.deliveryMethodId === method.id;
              // Check if free standard shipping applies
              const isFreeStandard = method.id === "standard" && subtotal >= 50;
              const displayRate = isFreeStandard
                ? "FREE"
                : `$${method.rate.toFixed(2)}`;

              return (
                <label
                  key={method.id}
                  className={`flex items-start justify-between gap-4 p-4 border cursor-pointer transition-all ${
                    isSelected
                      ? "border-[#111111] bg-white ring-1 ring-[#111111]"
                      : "border-[#E5E5E5] bg-white hover:border-[#777777]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value={method.id}
                      checked={isSelected}
                      onChange={() =>
                        handleChange("deliveryMethodId", method.id)
                      }
                      className="mt-0.5 accent-black size-4 cursor-pointer"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#111111] block">
                        {method.name}
                      </span>
                      <p className="text-[11px] text-[#777777]">
                        Estimated: {method.estimate} · {method.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold text-[#111111] shrink-0">
                    {displayRate}
                  </span>
                </label>
              );
            })}
          </div>
          <p className="text-[10px] font-mono text-[#777777] uppercase tracking-wider">
            *Demo rates and delivery windows are simulated estimates for architectural validation.
          </p>
        </section>

        {/* 4. Payment Method Selection (No credentials asked) */}
        <section aria-labelledby="payment-heading" className="space-y-4">
          <div className="border-b border-[#E5E5E5] pb-2">
            <h2
              id="payment-heading"
              className="text-xs font-mono uppercase tracking-[0.2em] text-[#111111] font-semibold"
            >
              04. Payment Method (Selection Only)
            </h2>
          </div>

          <div className="space-y-3">
            {PAYMENT_OPTIONS.map((opt) => {
              const isSelected = formData.paymentMethodId === opt.id;
              return (
                <label
                  key={opt.id}
                  className={`flex items-start gap-3 p-4 border cursor-pointer transition-all ${
                    isSelected
                      ? "border-[#111111] bg-white ring-1 ring-[#111111]"
                      : "border-[#E5E5E5] bg-white hover:border-[#777777]"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={opt.id}
                    checked={isSelected}
                    onChange={() => handleChange("paymentMethodId", opt.id)}
                    className="mt-0.5 accent-black size-4 cursor-pointer"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#111111] block">
                      {opt.title}
                    </span>
                    <p className="text-[11px] text-[#777777]">
                      {opt.subtitle}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="border border-[#E5E5E5] bg-[#FFFFFF] p-3.5 flex items-center gap-2.5 text-[11px] font-mono text-[#777777]">
            <CreditCard className="size-4 text-[#111111] shrink-0" />
            <span>
              Secure tokenized billing will connect to Stripe / Medusa in production. No payment is charged.
            </span>
          </div>
        </section>

        {/* Submit Button */}
        <div className="pt-4 space-y-3">
          <button
            type="submit"
            disabled={isSubmitting || items.length === 0}
            className="w-full h-14 bg-[#111111] text-white uppercase tracking-[0.2em] text-xs font-semibold hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>
              {isSubmitting
                ? "PROCESSING TEST ORDER..."
                : `PLACE TEST ORDER · $${calculation.totalEstimate.toFixed(2)}`}
            </span>
            <ArrowRight className="size-4" />
          </button>

          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[#777777]">
            <Link
              href="/cart"
              className="hover:text-[#111111] transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="size-3" />
              <span>Return to Cart</span>
            </Link>
            <span className="text-[10px]">[Demo Environment]</span>
          </div>
        </div>
      </form>

      {/* RIGHT COLUMN: Order Summary */}
      <aside aria-label="Order Summary" className="lg:col-span-5 sticky top-28">
        <div className="border border-[#E5E5E5] bg-white p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
            <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#111111]">
              Order Summary
            </h2>
            <span className="text-xs font-mono text-[#777777]">
              {totalCount} {totalCount === 1 ? "Item" : "Items"}
            </span>
          </div>

          {/* Product Items List */}
          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-4 py-2 border-b border-[#E5E5E5]/60 last:border-b-0"
              >
                <div className="relative size-16 shrink-0 overflow-hidden border border-[#E5E5E5] bg-[#F5F5F2]">
                  <Image
                    src={item.product.image}
                    alt={item.product.alt}
                    fill
                    sizes="64px"
                    className="object-cover object-center grayscale"
                  />
                  <span className="absolute top-0 right-0 bg-[#111111] text-white text-[9px] font-mono px-1.5 py-0.5">
                    ×{item.quantity}
                  </span>
                </div>

                <div className="flex-1 min-w-0 space-y-0.5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#111111] truncate">
                    {item.product.name}
                  </h3>
                  <p className="text-[10px] font-mono uppercase text-[#777777]">
                    {item.product.category} · {item.product.weight}
                  </p>
                  <p className="text-[11px] font-mono text-[#777777]">
                    ${item.product.price.toFixed(2)} each
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-mono text-xs font-semibold text-[#111111]">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Calculations */}
          <div className="space-y-3 border-t border-[#E5E5E5] pt-4 text-xs">
            <div className="flex justify-between text-[#777777]">
              <span>Merchandise Subtotal</span>
              <span className="font-mono text-[#111111] font-medium">
                ${calculation.merchandiseSubtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-[#777777]">
              <span>
                Shipping Estimate ({formData.deliveryMethodId === "standard" ? "Standard" : "Express"})
              </span>
              <span className="font-mono text-[#111111] font-medium">
                {calculation.shippingEstimate === 0
                  ? "FREE"
                  : `$${calculation.shippingEstimate.toFixed(2)}`}
              </span>
            </div>

            <div className="flex justify-between text-[#777777]">
              <span className="flex items-center gap-1">
                <span>Estimated Tax</span>
                <span className="text-[10px] text-[#AAAAAA]">(7.5% demo)</span>
              </span>
              <span className="font-mono text-[#111111] font-medium">
                ${calculation.taxEstimate.toFixed(2)}
              </span>
            </div>

            <div className="border-t border-[#E5E5E5] pt-4 flex justify-between items-baseline">
              <div className="space-y-0.5">
                <span className="text-sm font-semibold uppercase tracking-wider text-[#111111]">
                  Estimated Total
                </span>
                <p className="text-[10px] font-mono text-[#777777]">
                  All taxes &amp; shipping included (USD)
                </p>
              </div>
              <span className="text-2xl font-mono font-semibold text-[#111111]">
                ${calculation.totalEstimate.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Assurance badges */}
          <div className="border-t border-[#E5E5E5] pt-4 space-y-2 text-[10px] font-mono text-[#777777] uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-[#111111]" />
              <span>Simulated Prototype · No real payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="size-3.5 text-[#111111]" />
              <span>Complimentary standard courier on orders &gt; $50</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
