import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type Client = SupabaseClient<Database>;

export type Favorite = Database["public"]["Tables"]["favorites"]["Row"] & {
  companies: Database["public"]["Tables"]["companies"]["Row"];
};

export async function listFavorites(supabase: Client) {
  return supabase
    .from("favorites")
    .select("*, companies(*)")
    .order("created_at", { ascending: false })
    .returns<Favorite[]>();
}

export async function isFavorite(supabase: Client, companyId: string) {
  const { data } = await supabase
    .from("favorites")
    .select("id")
    .eq("company_id", companyId)
    .maybeSingle();
  return Boolean(data);
}

export async function listFavoriteCompanyIds(supabase: Client): Promise<Set<string>> {
  const { data } = await supabase.from("favorites").select("company_id");
  return new Set((data ?? []).map((row) => row.company_id));
}

export async function addFavorite(
  supabase: Client,
  userId: string,
  companyId: string,
) {
  return supabase.from("favorites").insert({ user_id: userId, company_id: companyId });
}

export async function removeFavorite(supabase: Client, companyId: string) {
  return supabase.from("favorites").delete().eq("company_id", companyId);
}
