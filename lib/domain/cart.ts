export type CartOptionSelection = {
  optionId: string;
  name: string;
  priceDelta: number;
};

export type CartItem = {
  key: string;
  menuItemId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  options: CartOptionSelection[];
};

export type RestaurantCart = {
  companyId: string;
  companyName: string;
  companySlug: string;
  companyLogoUrl: string | null;
  companyAddress: string | null;
  items: CartItem[];
};

export type Cart = RestaurantCart[];

const STORAGE_KEY = "box2eat-cart";

// Older builds stored a single { companyId, companyName, companySlug, items }
// object instead of an array of restaurants — migrate it in place so carts
// saved before the multi-restaurant redesign don't just disappear.
type LegacyCart = {
  companyId: string;
  companyName: string;
  companySlug: string;
  items: Omit<CartItem, "description" | "imageUrl">[];
};

function migrateLegacyCart(parsed: LegacyCart): Cart {
  return [
    {
      companyId: parsed.companyId,
      companyName: parsed.companyName,
      companySlug: parsed.companySlug,
      companyLogoUrl: null,
      companyAddress: null,
      items: parsed.items.map((item) => ({
        ...item,
        description: null,
        imageUrl: null,
      })),
    },
  ];
}

export function loadCart(): Cart | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Cart;
    if (parsed && typeof parsed === "object" && "companyId" in parsed) {
      return migrateLegacyCart(parsed as LegacyCart);
    }
    return null;
  } catch {
    return null;
  }
}

export function saveCart(cart: Cart | null) {
  if (typeof window === "undefined") return;
  try {
    if (cart && cart.length > 0) {
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

export function restaurantSubtotal(restaurant: RestaurantCart) {
  return restaurant.items.reduce((sum, item) => {
    const optionsTotal = item.options.reduce((s, o) => s + o.priceDelta, 0);
    return sum + (item.unitPrice + optionsTotal) * item.quantity;
  }, 0);
}

export function restaurantItemCount(restaurant: RestaurantCart) {
  return restaurant.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartSubtotal(cart: Cart | null) {
  if (!cart) return 0;
  return cart.reduce((sum, restaurant) => sum + restaurantSubtotal(restaurant), 0);
}

export function cartItemCount(cart: Cart | null) {
  if (!cart) return 0;
  return cart.reduce((sum, restaurant) => sum + restaurantItemCount(restaurant), 0);
}

export function findRestaurantCart(cart: Cart | null, companyId: string) {
  return cart?.find((restaurant) => restaurant.companyId === companyId) ?? null;
}
