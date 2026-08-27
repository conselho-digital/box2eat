import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type Client = SupabaseClient<Database>;

export type OrderWithItems = Database["public"]["Tables"]["orders"]["Row"] & {
  companies: Pick<Database["public"]["Tables"]["companies"]["Row"], "id" | "name" | "slug">;
  order_items: Database["public"]["Tables"]["order_items"]["Row"][];
};

export async function listMyOrders(supabase: Client) {
  return supabase
    .from("orders")
    .select("*, companies(id, name, slug), order_items(*)")
    .order("created_at", { ascending: false })
    .returns<OrderWithItems[]>();
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
