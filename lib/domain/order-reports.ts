import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type Client = SupabaseClient<Database>;

export type OrderReportType = "restaurant_report" | "delivery_partner_report" | "refund_request";

export async function submitOrderReport(
  supabase: Client,
  orderId: string,
  userId: string,
  type: OrderReportType,
  message: string,
) {
  return supabase.from("order_reports").insert({
    order_id: orderId,
    user_id: userId,
    type,
    message,
  });
}

/** Whether the customer has already opened any complaint for this order —
 *  used to hold back the post-delivery review prompt while one is open. */
export async function hasOrderReport(supabase: Client, orderId: string) {
  return supabase
    .from("order_reports")
    .select("id", { count: "exact", head: true })
    .eq("order_id", orderId);
}
