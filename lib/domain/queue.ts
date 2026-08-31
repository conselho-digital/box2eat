import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type Client = SupabaseClient<Database>;

export type QueueInfo = {
  hasQueue: boolean;
  avgMinutes: number | null;
};

/** For each company, whether it currently has an unfinished order in the
 *  queue, and (from today's already-delivered orders) how long an order
 *  has been taking on average — used to estimate a new order's wait.
 *  Goes through a SECURITY DEFINER RPC since a customer's own RLS view of
 *  `orders` only covers their own orders, not every restaurant's queue. */
export async function listCompanyQueueInfo(
  supabase: Client,
  companyIds: string[],
): Promise<Map<string, QueueInfo>> {
  const info = new Map<string, QueueInfo>(companyIds.map((id) => [id, { hasQueue: false, avgMinutes: null }]));
  if (companyIds.length === 0) return info;

  const { data } = await supabase.rpc("get_company_queue_info", { p_company_ids: companyIds });

  for (const row of data ?? []) {
    info.set(row.company_id, {
      hasQueue: row.has_queue,
      avgMinutes: row.avg_minutes !== null ? Math.round(row.avg_minutes) : null,
    });
  }

  return info;
}
