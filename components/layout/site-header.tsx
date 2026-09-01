import Image from "next/image";
import Link from "next/link";
import { SiteHeaderContent } from "@/components/layout/site-header-content";
import { IosBackButton } from "@/components/layout/ios-back-button";
import { CompanyDashboardTabsRow } from "@/components/companies/company-dashboard-tabs-row";
import { getCurrentUser, getCachedAccountMenuData } from "@/lib/domain/current-user";
import { getMyAddress } from "@/lib/domain/address";

export async function SiteHeader() {
  const { supabase, user } = await getCurrentUser();

  const [menuData, addressResult] = await Promise.all([
    user
      ? getCachedAccountMenuData(user.id)
      : Promise.resolve({ isAdmin: false, hasCompany: false, fullName: null, avatarUrl: null }),
    user ? getMyAddress(supabase, user.id) : Promise.resolve({ data: null }),
  ]);
  const { isAdmin, hasCompany, fullName, avatarUrl } = menuData;
  const initialAddress = addressResult.data;

  return (
    <header className="border-b">
      <div className="flex items-center gap-2 p-3 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image src="/brand/box2eat-logo.png" alt="Box2eat" width={28} height={31} />
          <span className="hidden font-semibold sm:inline">Box2eat</span>
        </Link>
        <IosBackButton />
        <SiteHeaderContent
          user={user ? { id: user.id, email: user.email ?? null } : null}
          isAdmin={isAdmin}
          hasCompany={hasCompany}
          fullName={fullName}
          avatarUrl={avatarUrl}
          initialAddress={initialAddress}
        />
      </div>
      <CompanyDashboardTabsRow />
    </header>
  );
}
