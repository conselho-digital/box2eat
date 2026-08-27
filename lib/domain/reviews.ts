import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type Client = SupabaseClient<Database>;

export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type ReviewTargetType = "company" | "delivery_partner";

export async function listReviewsForOrder(supabase: Client, orderId: string) {
  return supabase.from("reviews").select("*").eq("order_id", orderId).returns<Review[]>();
}

// This RPC is declared RETURNS public.reviews (a single row, not SETOF), so
// the result is already a single object — no .single() needed.
export async function submitReview(
  supabase: Client,
  orderId: string,
  targetType: ReviewTargetType,
  rating: number,
  comment?: string,
) {
  return supabase.rpc("submit_review", {
    p_order_id: orderId,
    p_target_type: targetType,
    p_rating: rating,
    p_comment: comment,
  });
}
