import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type Client = SupabaseClient<Database>;

export type OrderReportType = "restaurant_report" | "refund_request";

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
