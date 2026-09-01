import { getCurrentUser, getCachedAccountMenuData } from "@/lib/domain/current-user";
import { BottomNavClient } from "@/components/layout/bottom-nav-client";

export async function BottomNav() {
  const { user } = await getCurrentUser();
  if (!user) return null;

  const { isAdmin, hasCompany, fullName, avatarUrl } = await getCachedAccountMenuData(user.id);

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
