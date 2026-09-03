import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type Client = SupabaseClient<Database>;

export type OrderMessageThread = "restaurant_courier" | "courier_customer";

export type OrderMessage = Database["public"]["Tables"]["order_messages"]["Row"];

export async function listOrderMessages(supabase: Client, orderId: string, thread: OrderMessageThread) {
  return supabase
    .from("order_messages")
    .select("*")
    .eq("order_id", orderId)
    .eq("thread", thread)
    .order("created_at", { ascending: true })
    .returns<OrderMessage[]>();
}

export async function sendOrderMessage(supabase: Client, orderId: string, body: string) {
  return supabase.rpc("send_order_message", { p_order_id: orderId, p_body: body });
}

/** Realtime: fires when a new message is posted to either thread of an order. */
export function subscribeToOrderMessages(supabase: Client, orderId: string, onChange: () => void) {
  const channel = supabase
    .channel(`order-messages-${orderId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "order_messages", filter: `order_id=eq.${orderId}` },
      onChange,
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
