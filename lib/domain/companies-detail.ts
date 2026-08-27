import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type Client = SupabaseClient<Database>;

export async function getMyMembership(
  supabase: Client,
  companyId: string,
  userId: string,
) {
  return supabase
    .from("company_members")
    .select("*, companies(*)")
    .eq("company_id", companyId)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();
}

export async function getCompanyBySlug(supabase: Client, slug: string) {
  return supabase.from("companies").select("*").eq("slug", slug).maybeSingle();
}
