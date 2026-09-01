import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getAccountMenuData } from "@/lib/domain/account-menu";

/** SiteHeader and BottomNav both need the current user + the same account
 *  menu data (isAdmin, hasCompany, profile) on every page load — cache()
 *  de-dupes the underlying auth/DB calls across those sibling Server
 *  Components within a single request instead of running them twice. */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
});

export const getCachedAccountMenuData = cache(async (userId: string) => {
  const { supabase } = await getCurrentUser();
  return getAccountMenuData(supabase, userId);
});
