import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { RestaurantCart } from "@/lib/domain/cart";
import type { AcceptedPaymentMethod } from "@/lib/domain/payment-methods";

type Client = SupabaseClient<Database>;

export type DeliveryAddressInput = {
  street: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  postal_code?: string;
};

/** Single-line rendering of an order's delivery_address snapshot — used as
 *  the Google Maps destination fallback for orders placed before coordinates
 *  were captured, and anywhere else the raw jsonb needs a readable string. */
export function formatDeliveryAddress(address: {
  street?: string | null;
  number?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
}) {
  const streetLine = [address.street, address.number].filter(Boolean).join(", ");
  const cityLine = [
    address.neighborhood,
    address.city && address.state ? `${address.city} - ${address.state}` : address.city,
  ]
    .filter(Boolean)
    .join(", ");
  return [streetLine, cityLine].filter(Boolean).join(" · ");
}

export async function submitOrder(
  supabase: Client,
  cart: RestaurantCart,
  deliveryAddress: DeliveryAddressInput,
  notes?: string,
  couponCode?: string,
  paymentMethod?: AcceptedPaymentMethod,
  deliveryCoords?: { lat: number; lng: number } | null,
) {
  const items = cart.items.map((item) => ({
    menu_item_id: item.menuItemId,
    quantity: item.quantity,
    option_ids: item.options.map((o) => o.optionId),
  }));

  const args: Database["public"]["Functions"]["create_order"]["Args"] = {
    p_company_id: cart.companyId,
    p_items: items,
    p_delivery_address: deliveryAddress,
    p_notes: notes || undefined,
    p_coupon_code: couponCode || undefined,
    p_payment_method: paymentMethod,
    // Feeds the same ETA-based fee formula shown on this page
    // (computeDeliveryInfo) so the charged fee matches what was displayed.
    p_delivery_lat: deliveryCoords?.lat,
    p_delivery_lng: deliveryCoords?.lng,
  };

  // create_order is declared RETURNS public.orders (a single row, not
  // SETOF), so the RPC result is already a single object.
  return supabase.rpc("create_order", args);
}
