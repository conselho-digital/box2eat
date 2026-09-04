import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type Client = SupabaseClient<Database>;

export type OrderReportType = "restaurant_report" | "delivery_partner_report" | "refund_request";

export const MAX_REPORT_PHOTOS = 5;

export async function submitOrderReport(
  supabase: Client,
  orderId: string,
  userId: string,
  type: OrderReportType,
  message: string,
  photoPaths: string[] = [],
) {
  return supabase.from("order_reports").insert({
    order_id: orderId,
    user_id: userId,
    type,
    message,
    photo_urls: photoPaths.length > 0 ? photoPaths : null,
  });
}

/** Uploads to the private order-report-photos bucket, under the
 *  reporting user's own folder (matches the storage RLS policy) — stores
 *  just the storage path, resolved to a signed URL on read since the
 *  bucket isn't public. */
export async function uploadReportPhoto(supabase: Client, userId: string, file: File) {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("order-report-photos")
    .upload(path, file, { upsert: false });
  if (error) return { data: null, error };
  return { data: path, error: null };
}

/** Signed URL for displaying a report photo (admin review, or the
 *  reporting user themselves) — the bucket is private. */
export async function getReportPhotoUrl(supabase: Client, path: string) {
  const { data, error } = await supabase.storage
    .from("order-report-photos")
    .createSignedUrl(path, 3600);
  return { data: data?.signedUrl ?? null, error };
}

/** Whether the customer has an OPEN complaint for this order — used to
 *  hold back the post-delivery review prompt (and, server-side, the
 *  payout release) while one is open. Once admin resolves it, this goes
 *  back to zero and the review prompt (and the release) unblock. */
export async function hasOrderReport(supabase: Client, orderId: string) {
  return supabase
    .from("order_reports")
    .select("id", { count: "exact", head: true })
    .eq("order_id", orderId)
    .eq("status", "open");
}
