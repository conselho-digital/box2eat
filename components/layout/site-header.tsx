import Image from "next/image";
import Link from "next/link";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { AuthToggleButton } from "@/components/auth/auth-toggle-button";
import { CartButton } from "@/components/cart/cart-button";
import { SideMenu } from "@/components/layout/side-menu";
import { createClient } from "@/lib/supabase/server";
import { isPlatformAdmin } from "@/lib/domain/admin";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = user ? await isPlatformAdmin(supabase, user.id) : false;

  const profile = user
    ? (
        await supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).single()
      ).data
    : null;

  const hasCompany = user
    ? Boolean(
        (
          await supabase
            .from("company_members")
            .select("id")
            .eq("status", "active")
            .limit(1)
            .maybeSingle()
        ).data,
      )
    : false;

  return (
    <header className="flex items-center justify-between border-b p-3 px-6">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/brand/box2eat-logo.png" alt="Box2eat" width={28} height={31} />
        <span className="font-semibold">Box2eat</span>
      </Link>
      <div className="flex items-center gap-1">
        {user ? (
          <>
            <CartButton />
            <NotificationBell userId={user.id} />
          </>
        ) : (
          <AuthToggleButton />
        )}
        <SideMenu
          loggedIn={Boolean(user)}
          isAdmin={isAdmin}
          hasCompany={hasCompany}
          fullName={profile?.full_name ?? null}
          avatarUrl={profile?.avatar_url ?? null}
          email={user?.email ?? null}
        />
      </div>
    </header>
  );
}
