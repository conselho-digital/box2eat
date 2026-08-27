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
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  options: CartOptionSelection[];
};

type CartContextValue = {
  cart: Cart | null;
  addItem: (input: AddItemInput) => { replaced: boolean };
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
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
    let replaced = false;

    setCart((current) => {
      if (current && current.companyId !== input.companyId) {
        replaced = true;
      }
      const base: Cart =
        current && current.companyId === input.companyId
          ? current
          : { companyId: input.companyId, companyName: input.companyName, companySlug: input.companySlug, items: [] };

      const existing = base.items.find((item) => item.key === key);
      const items = existing
        ? base.items.map((item) =>
            item.key === key ? { ...item, quantity: item.quantity + input.quantity } : item,
          )
        : [
            ...base.items,
            {
              key,
              menuItemId: input.menuItemId,
              name: input.name,
              unitPrice: input.unitPrice,
              quantity: input.quantity,
              options: input.options,
            },
          ];

      return { ...base, items };
    });

    return { replaced };
  }

  function removeItem(key: string) {
    setCart((current) => {
      if (!current) return current;
      const items = current.items.filter((item) => item.key !== key);
      return items.length > 0 ? { ...current, items } : null;
    });
  }

  function updateQuantity(key: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(key);
      return;
    }
    setCart((current) => {
      if (!current) return current;
      return {
        ...current,
        items: current.items.map((item) => (item.key === key ? { ...item, quantity } : item)),
      };
    });
  }

  function clearCart() {
    setCart(null);
  }

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
