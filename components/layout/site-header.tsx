import Image from "next/image";
import Link from "next/link";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { AuthToggleButton } from "@/components/auth/auth-toggle-button";
import { CartButton } from "@/components/cart/cart-button";
import { SideMenu } from "@/components/layout/side-menu";
import { AddressBar } from "@/components/home/address-bar";
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
      {user && (
        <div className="min-w-0 flex-1">
          <AddressBar userId={user.id} initialAddress={initialAddress} />
        </div>
      )}
      <div className="ml-auto flex shrink-0 items-center gap-1">
        {user ? (
          <>
            <span className="hidden sm:flex">
              <CartButton />
            </span>
            <NotificationBell userId={user.id} />
            <span className="hidden sm:flex">
              <SideMenu
                loggedIn
                isAdmin={isAdmin}
                hasCompany={hasCompany}
                fullName={fullName}
                avatarUrl={avatarUrl}
                email={user.email ?? null}
              />
            </span>
          </>
        ) : (
          <>
            <AuthToggleButton />
            <SideMenu
              loggedIn={false}
              isAdmin={false}
              hasCompany={false}
              fullName={null}
              avatarUrl={null}
              email={null}
            />
          </>
        )}
      </div>
    </header>
  );
}
