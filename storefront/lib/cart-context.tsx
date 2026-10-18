"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  cartApi,
  BackendCart,
  BackendCartItem,
  ApiError,
} from "@/lib/cart-api";
import { formatCurrency, StoreProduct } from "@/lib/store-api";
import { DemonstrationProduct } from "@/lib/data/products";

export interface UnifiedCartItem {
  id: string; // cart item UUID
  variantId: string;
  sku: string;
  variantName: string;
  quantity: number;
  unitPrice: number; // in dollars (e.g. 15.99)
  unitPriceInCents: number; // in cents (e.g. 1599)
  lineTotal: number; // in dollars (e.g. 31.98)
  lineTotalInCents: number; // in cents (e.g. 3198)
  currency: string;
  available: boolean;
  stockQuantity: number;
  formattedUnitPrice: string;
  formattedLineTotal: string;
  image: string;
  alt: string;
  // Product adapter for backward compatibility with existing components
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    priceInCents: number;
    currency: string;
    image: string;
    alt: string;
    weight: string;
    category: string;
  };
  raw: BackendCartItem;
}

// Backward-compatibility alias
export type CartItem = UnifiedCartItem;

interface CartContextType {
  items: UnifiedCartItem[];
  cart: BackendCart | null;
  totalCount: number;
  itemCount: number;
  subtotal: number; // in dollars
  subtotalInCents: number; // in integer cents
  formattedSubtotal: string;
  currency: string;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  clearError: () => void;
  addItem: (
    target: string | StoreProduct | DemonstrationProduct,
    quantity?: number,
    currency?: string,
  ) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  removeItem: (itemId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_TOKEN_STORAGE_KEY = "coco_vantage_cart_token_v1";

function mapBackendItemToUnified(
  item: BackendCartItem,
  cartCurrency: string,
): UnifiedCartItem {
  const cents = item.unitPrice ?? 0;
  const lineCents = item.lineTotal ?? cents * item.quantity;
  const unitPrice = Number((cents / 100).toFixed(2));
  const lineTotal = Number((lineCents / 100).toFixed(2));
  const currency = item.currency || cartCurrency || "USD";

  const image = item.image?.url || "/powder.jpg";
  const alt = item.image?.altText || item.variantName || item.product.name;

  return {
    id: item.id,
    variantId: item.variantId,
    sku: item.sku,
    variantName: item.variantName,
    quantity: item.quantity,
    unitPrice,
    unitPriceInCents: cents,
    lineTotal,
    lineTotalInCents: lineCents,
    currency,
    available: item.available,
    stockQuantity: item.stockQuantity,
    formattedUnitPrice: formatCurrency(cents, currency),
    formattedLineTotal: formatCurrency(lineCents, currency),
    image,
    alt,
    product: {
      id: item.product.id,
      slug: item.product.slug,
      name: item.product.name,
      price: unitPrice,
      priceInCents: cents,
      currency,
      image,
      alt,
      weight: item.variantName.includes("(")
        ? item.variantName.split("(")[1]?.replace(")", "") || ""
        : "",
      category: "Formulations",
    },
    raw: item,
  };
}

// Module-level singleton promise to prevent concurrent React dev-mode double-initializations
let initPromise: Promise<{ token: string; cart: BackendCart }> | null = null;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [cart, setCart] = useState<BackendCart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tokenRef = useRef<string | null>(null);
  tokenRef.current = token;

  const clearError = useCallback(() => setError(null), []);

  /**
   * Initializes or restores the cart from the backend.
   */
  const initializeCart = useCallback(async (): Promise<{
    token: string;
    cart: BackendCart;
  }> => {
    if (typeof window === "undefined") {
      throw new Error("Cannot initialize cart on server");
    }

    const storedToken = localStorage.getItem(CART_TOKEN_STORAGE_KEY);

    // If an existing 64-char token exists in browser storage, attempt to fetch it
    if (storedToken && storedToken.length === 64 && /^[a-f0-9]+$/i.test(storedToken)) {
      try {
        const existingCart = await cartApi.getCart(storedToken);
        setToken(storedToken);
        setCart(existingCart);
        return { token: storedToken, cart: existingCart };
      } catch (err) {
        // If 404 (not found) or 410 (expired), safely discard dead token
        if (err instanceof ApiError && (err.statusCode === 404 || err.statusCode === 410)) {
          localStorage.removeItem(CART_TOKEN_STORAGE_KEY);
        } else {
          // Network issue or other unexpected error
          throw err;
        }
      }
    }

    // Otherwise, create a fresh anonymous shopping cart
    const createRes = await cartApi.createCart("USD");
    try {
      localStorage.setItem(CART_TOKEN_STORAGE_KEY, createRes.token);
    } catch {
      // Ignore localStorage write error if cookies/storage disabled
    }
    setToken(createRes.token);
    setCart(createRes.cart);
    return { token: createRes.token, cart: createRes.cart };
  }, []);

  // Run initialization once on mount
  useEffect(() => {
    let isMounted = true;

    if (!initPromise) {
      initPromise = initializeCart();
    }

    initPromise
      .then((res) => {
        if (isMounted) {
          setToken(res.token);
          setCart(res.cart);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : "Failed to connect to cart service";
          setError(msg);
          setIsLoading(false);
        }
      })
      .finally(() => {
        initPromise = null;
      });

    return () => {
      isMounted = false;
    };
  }, [initializeCart]);

  /**
   * Helper to ensure an active token exists before mutation
   */
  const ensureToken = async (): Promise<string> => {
    if (tokenRef.current) {
      return tokenRef.current;
    }
    const res = await initializeCart();
    return res.token;
  };

  /**
   * Refreshes the cart from the backend using the current token.
   */
  const refreshCart = useCallback(async () => {
    if (!tokenRef.current) return;
    try {
      const refreshed = await cartApi.getCart(tokenRef.current);
      setCart(refreshed);
    } catch (err) {
      if (err instanceof ApiError && (err.statusCode === 404 || err.statusCode === 410)) {
        localStorage.removeItem(CART_TOKEN_STORAGE_KEY);
        setToken(null);
        await initializeCart();
      }
    }
  }, [initializeCart]);

  /**
   * Adds an item to the cart using its variant ID.
   */
  const addItem = useCallback(
    async (
      target: string | StoreProduct | DemonstrationProduct,
      quantity = 1,
      currencyOverride?: string,
    ): Promise<boolean> => {
      if (quantity < 1) return false;
      setIsMutating(true);
      setError(null);

      try {
        const activeToken = await ensureToken();

        let variantId = "";
        let currency = currencyOverride || cart?.currency || "USD";

        if (typeof target === "string") {
          variantId = target;
        } else if ("variants" in target && Array.isArray(target.variants) && target.variants.length > 0) {
          // StoreProduct: choose default or first active variant
          const selectedVariant =
            target.variants.find((v) => v.isDefault && v.isActive && v.stockQuantity > 0) ||
            target.variants.find((v) => v.isActive && v.stockQuantity > 0) ||
            target.variants[0];

          if (!selectedVariant) {
            throw new Error("No active variant available for this product.");
          }
          variantId = selectedVariant.id;
          currency = target.currency || currency;
        } else if ("id" in target) {
          // If a product ID was passed, verify if it's already a variant UUID
          variantId = target.id;
        }

        if (!variantId) {
          throw new Error("A valid product variant is required to add to cart.");
        }

        const updatedCart = await cartApi.addItem(activeToken, {
          variantId,
          quantity,
          currency,
        });

        setCart(updatedCart);
        return true;
      } catch (err) {
        const msg =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
            ? err.message
            : "Failed to add item to cart";
        setError(msg);
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    [cart?.currency],
  );

  /**
   * Updates an item's quantity in the cart.
   */
  const updateQuantity = useCallback(
    async (itemId: string, quantity: number): Promise<boolean> => {
      if (!tokenRef.current) return false;
      setIsMutating(true);
      setError(null);

      try {
        if (quantity < 1) {
          // Decrementing below 1 removes item
          const updatedCart = await cartApi.removeItem(tokenRef.current, itemId);
          setCart(updatedCart);
          return true;
        }

        const updatedCart = await cartApi.updateItem(
          tokenRef.current,
          itemId,
          quantity,
        );
        setCart(updatedCart);
        return true;
      } catch (err) {
        const msg =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
            ? err.message
            : "Failed to update item quantity";
        setError(msg);
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    [],
  );

  /**
   * Removes an item from the cart.
   */
  const removeItem = useCallback(
    async (itemId: string): Promise<boolean> => {
      if (!tokenRef.current) return false;
      setIsMutating(true);
      setError(null);

      try {
        const updatedCart = await cartApi.removeItem(tokenRef.current, itemId);
        setCart(updatedCart);
        return true;
      } catch (err) {
        const msg =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
            ? err.message
            : "Failed to remove item";
        setError(msg);
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    [],
  );

  /**
   * Clears all items from the cart.
   */
  const clearCart = useCallback(async (): Promise<boolean> => {
    if (!tokenRef.current) return false;
    setIsMutating(true);
    setError(null);

    try {
      const updatedCart = await cartApi.clearCart(tokenRef.current);
      setCart(updatedCart);
      return true;
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Failed to clear cart";
      setError(msg);
      return false;
    } finally {
      setIsMutating(false);
    }
  }, []);

  const cartCurrency = cart?.currency || "USD";
  const rawItems = cart?.items || [];
  const items: UnifiedCartItem[] = rawItems.map((item) =>
    mapBackendItemToUnified(item, cartCurrency),
  );

  const subtotalInCents = cart?.subtotal ?? 0;
  const subtotal = Number((subtotalInCents / 100).toFixed(2));
  const formattedSubtotal = formatCurrency(subtotalInCents, cartCurrency);
  const itemCount = cart?.itemCount ?? 0;
  const totalCount = itemCount;

  return (
    <CartContext.Provider
      value={{
        items,
        cart,
        totalCount,
        itemCount,
        subtotal,
        subtotalInCents,
        formattedSubtotal,
        currency: cartCurrency,
        isLoading,
        isMutating,
        error,
        clearError,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
