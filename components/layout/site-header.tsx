import Image from "next/image";
import Link from "next/link";
import { SiteHeaderContent } from "@/components/layout/site-header-content";
import { IosBackButton } from "@/components/layout/ios-back-button";
import { createClient } from "@/lib/supabase/server";
import { getAccountMenuData } from "@/lib/domain/account-menu";
import { getMyAddress } from "@/lib/domain/address";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { isAdmin, hasCompany, fullName, avatarUrl } = user
    ? await getAccountMenuData(supabase, user.id)
    : { isAdmin: false, hasCompany: false, fullName: null, avatarUrl: null };

  const initialAddress = user ? (await getMyAddress(supabase, user.id)).data : null;

  return (
    <header className="flex items-center gap-2 border-b p-3 px-4 sm:px-6">
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
    </header>
  );
}
