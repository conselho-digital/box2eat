import { createClient } from "@/lib/supabase/server";
import { getAccountMenuData } from "@/lib/domain/account-menu";
import { BottomNavClient } from "@/components/layout/bottom-nav-client";

export async function BottomNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { isAdmin, hasCompany, fullName, avatarUrl } = await getAccountMenuData(supabase, user.id);

  return (
    <BottomNavClient
      isAdmin={isAdmin}
      hasCompany={hasCompany}
      fullName={fullName}
      avatarUrl={avatarUrl}
      email={user.email ?? null}
    />
  );
}
