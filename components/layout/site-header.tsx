import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { LogoutButton } from "@/components/auth/logout-button";
import { AuthToggleButton } from "@/components/auth/auth-toggle-button";
import { SideMenu } from "@/components/layout/side-menu";
import { createClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="flex items-center justify-between border-b p-3 px-6">
      <div className="flex items-center gap-1">
        <SideMenu />
        <Link href="/" className="flex items-center gap-2">
          <Image src="/brand/box2eat-logo.png" alt="Box2eat" width={28} height={31} />
          <span className="font-semibold">Box2eat</span>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        {user ? (
          <>
            <NotificationBell userId={user.id} />
            <Button render={<Link href="/conta" />} nativeButton={false} variant="ghost" size="sm">
              Minha conta
            </Button>
            <LogoutButton />
          </>
        ) : (
          <AuthToggleButton />
        )}
      </div>
    </header>
  );
}
