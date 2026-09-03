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

export async function submitOrder(
  supabase: Client,
  cart: RestaurantCart,
  deliveryAddress: DeliveryAddressInput,
  notes?: string,
  couponCode?: string,
  paymentMethod?: AcceptedPaymentMethod,
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
  };

  // create_order is declared RETURNS public.orders (a single row, not
  // SETOF), so the RPC result is already a single object.
  return supabase.rpc("create_order", args);
}
