export type CartOptionSelection = {
  optionId: string;
  name: string;
  priceDelta: number;
};

export type CartItem = {
  key: string;
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  options: CartOptionSelection[];
};

export type Cart = {
  companyId: string;
  companyName: string;
  companySlug: string;
  items: CartItem[];
};

const STORAGE_KEY = "box2eat-cart";

export function loadCart(): Cart | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Cart) : null;
  } catch {
    return null;
  }
}

export function saveCart(cart: Cart | null) {
  if (typeof window === "undefined") return;
  try {
    if (cart && cart.items.length > 0) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // localStorage unavailable (private mode, etc.) — cart just won't persist
  }
}

export function cartItemKey(menuItemId: string, optionIds: string[]) {
  return `${menuItemId}:${[...optionIds].sort().join(",")}`;
}

export function cartSubtotal(cart: Cart | null) {
  if (!cart) return 0;
  return cart.items.reduce((sum, item) => {
    const optionsTotal = item.options.reduce((s, o) => s + o.priceDelta, 0);
    return sum + (item.unitPrice + optionsTotal) * item.quantity;
  }, 0);
}

export function cartItemCount(cart: Cart | null) {
  if (!cart) return 0;
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}
