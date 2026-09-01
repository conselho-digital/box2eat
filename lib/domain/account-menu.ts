import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { isPlatformAdmin } from "@/lib/domain/admin";

type Client = SupabaseClient<Database>;

/** Shared by the top navbar's hamburger and the bottom nav's Perfil button —
 *  both render the same SideMenu and need the same account context. */
export async function getAccountMenuData(supabase: Client, userId: string) {
  const [isAdmin, profileResult, membershipResult] = await Promise.all([
    isPlatformAdmin(supabase, userId),
    supabase.from("profiles").select("full_name, avatar_url").eq("id", userId).single(),
    supabase.from("company_members").select("id").eq("status", "active").limit(1).maybeSingle(),
  ]);

  return {
    isAdmin,
    hasCompany: Boolean(membershipResult.data),
    fullName: profileResult.data?.full_name ?? null,
    avatarUrl: profileResult.data?.avatar_url ?? null,
  };
}
