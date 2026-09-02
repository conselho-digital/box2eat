"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  cartItemKey,
  loadCart,
  saveCart,
  type Cart,
  type CartOptionSelection,
} from "@/lib/domain/cart";

type AddItemInput = {
  companyId: string;
  companyName: string;
  companySlug: string;
  companyLogoUrl: string | null;
  companyAddress: string | null;
  menuItemId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  options: CartOptionSelection[];
};

type CartContextValue = {
  cart: Cart | null;
  /** False until the localStorage hydration effect below has run — code
   *  that redirects away on an "empty" cart must wait for this, since the
   *  cart is always null for that first render even when localStorage
   *  actually has items. */
  hydrated: boolean;
  addItem: (input: AddItemInput) => void;
  removeItem: (companyId: string, key: string) => void;
  updateQuantity: (companyId: string, key: string, quantity: number) => void;
  removeRestaurant: (companyId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // One-time hydration from localStorage after mount, to avoid an
    // SSR/client markup mismatch (server always renders an empty cart).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCart(loadCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveCart(cart);
  }, [cart, hydrated]);

  function addItem(input: AddItemInput) {
    const key = cartItemKey(
      input.menuItemId,
      input.options.map((o) => o.optionId),
    );

    setCart((current) => {
      const restaurants = current ?? [];
      const existingRestaurant = restaurants.find((r) => r.companyId === input.companyId);

      const baseItems = existingRestaurant?.items ?? [];
      const existingItem = baseItems.find((item) => item.key === key);
      const items = existingItem
        ? baseItems.map((item) =>
            item.key === key ? { ...item, quantity: item.quantity + input.quantity } : item,
          )
        : [
            ...baseItems,
            {
              key,
              menuItemId: input.menuItemId,
              name: input.name,
              description: input.description,
              imageUrl: input.imageUrl,
              unitPrice: input.unitPrice,
              quantity: input.quantity,
              options: input.options,
            },
          ];

      const updatedRestaurant = {
        companyId: input.companyId,
        companyName: input.companyName,
        companySlug: input.companySlug,
        companyLogoUrl: input.companyLogoUrl,
        companyAddress: input.companyAddress,
        items,
      };

      if (existingRestaurant) {
        return restaurants.map((r) => (r.companyId === input.companyId ? updatedRestaurant : r));
      }
      return [...restaurants, updatedRestaurant];
    });
  }

  function removeItem(companyId: string, key: string) {
    setCart((current) => {
      if (!current) return current;
      const next = current
        .map((restaurant) => {
          if (restaurant.companyId !== companyId) return restaurant;
          return { ...restaurant, items: restaurant.items.filter((item) => item.key !== key) };
        })
        .filter((restaurant) => restaurant.items.length > 0);
      return next.length > 0 ? next : null;
    });
  }

  function updateQuantity(companyId: string, key: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(companyId, key);
      return;
    }
    setCart((current) => {
      if (!current) return current;
      return current.map((restaurant) => {
        if (restaurant.companyId !== companyId) return restaurant;
        return {
          ...restaurant,
          items: restaurant.items.map((item) =>
            item.key === key ? { ...item, quantity } : item,
          ),
        };
      });
    });
  }

  function removeRestaurant(companyId: string) {
    setCart((current) => {
      if (!current) return current;
      const next = current.filter((restaurant) => restaurant.companyId !== companyId);
      return next.length > 0 ? next : null;
    });
  }

  function clearCart() {
    setCart(null);
  }

  return (
    <CartContext.Provider
      value={{ cart, hydrated, addItem, removeItem, updateQuantity, removeRestaurant, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
