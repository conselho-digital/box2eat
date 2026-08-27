import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type Client = SupabaseClient<Database>;

export type OrderWithItems = Database["public"]["Tables"]["orders"]["Row"] & {
  companies: Pick<Database["public"]["Tables"]["companies"]["Row"], "id" | "name" | "slug">;
  order_items: Database["public"]["Tables"]["order_items"]["Row"][];
};

export type CompanyOrder = Database["public"]["Tables"]["orders"]["Row"] & {
  order_items: Database["public"]["Tables"]["order_items"]["Row"][];
  profiles: Pick<Database["public"]["Tables"]["profiles"]["Row"], "full_name" | "phone">;
  delivery_partners: Pick<
    Database["public"]["Tables"]["delivery_partners"]["Row"],
    "vehicle_type" | "vehicle_plate"
  > | null;
};

const ACTIVE_STATUSES = ["placed", "accepted", "preparing", "ready_for_pickup"];

export async function listMyOrders(supabase: Client) {
  return supabase
    .from("orders")
    .select("*, companies(id, name, slug), order_items(*)")
    .order("created_at", { ascending: false })
    .returns<OrderWithItems[]>();
}

export async function getOrder(supabase: Client, orderId: string) {
  return supabase
    .from("orders")
    .select("*, companies(id, name, slug), order_items(*)")
    .eq("id", orderId)
    .single<OrderWithItems>();
}

export async function listCompanyOrders(supabase: Client, companyId: string) {
  return supabase
    .from("orders")
    .select("*, order_items(*), profiles(full_name, phone), delivery_partners(vehicle_type, vehicle_plate)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .returns<CompanyOrder[]>();
}

export function isActiveOrder(status: string) {
  return ACTIVE_STATUSES.includes(status);
}

export function groupOrdersByCompany(orders: OrderWithItems[]) {
  const groups = new Map<string, { company: OrderWithItems["companies"]; orders: OrderWithItems[] }>();
  for (const order of orders) {
    const key = order.companies.id;
    if (!groups.has(key)) {
      groups.set(key, { company: order.companies, orders: [] });
    }
    groups.get(key)!.orders.push(order);
  }
  return Array.from(groups.values());
}

// These RPCs are all declared RETURNS public.orders (a single row, not
// SETOF), so the result is already a single object — no .single() needed.

export async function acceptOrder(supabase: Client, orderId: string) {
  return supabase.rpc("accept_order", { p_order_id: orderId });
}

export async function rejectOrder(supabase: Client, orderId: string, reason?: string) {
  return supabase.rpc("reject_order", { p_order_id: orderId, p_reason: reason });
}

export async function markPreparing(supabase: Client, orderId: string) {
  return supabase.rpc("mark_preparing", { p_order_id: orderId });
}

export async function markReady(supabase: Client, orderId: string) {
  return supabase.rpc("mark_ready", { p_order_id: orderId });
}

export async function markDelivered(supabase: Client, orderId: string) {
  return supabase.rpc("mark_delivered", { p_order_id: orderId });
}

export async function cancelOrder(supabase: Client, orderId: string, reason?: string) {
  return supabase.rpc("cancel_order", { p_order_id: orderId, p_reason: reason });
}

/** Realtime: fires on any change to a single order (e.g. status updates for order tracking). */
export function subscribeToOrder(
  supabase: Client,
  orderId: string,
  onChange: () => void,
) {
  const channel = supabase
    .channel(`order-${orderId}`)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
      onChange,
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/** Realtime: fires on any change to orders for a company (new orders + status updates in the queue). */
export function subscribeToCompanyOrders(
  supabase: Client,
  companyId: string,
  onChange: () => void,
) {
  const channel = supabase
    .channel(`company-orders-${companyId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "orders", filter: `company_id=eq.${companyId}` },
      onChange,
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Realtime: fires on any order change visible to the current delivery
 * partner — unclaimed ready-for-pickup orders becoming available, and
 * updates to orders assigned to them. Unfiltered at the channel level;
 * RLS still governs which rows actually reach this client.
 */
export function subscribeToDeliveryUpdates(supabase: Client, userId: string, onChange: () => void) {
  const channel = supabase
    .channel(`delivery-updates-${userId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, onChange)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
