"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map as MapIcon, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/cart/cart-provider";
import { cartItemCount } from "@/lib/domain/cart";
import { SideMenu } from "@/components/layout/side-menu";
import { SearchNavButton } from "@/components/layout/search-nav-button";

function NavLink({
  href,
  icon: Icon,
  label,
  active,
  badge,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex flex-1 flex-col items-center gap-0.5 py-1 text-xs",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <Icon className="size-5" />
      {label}
      {Boolean(badge) && (
        <span className="absolute top-0 right-1/3 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
          {badge! > 9 ? "9+" : badge}
        </span>
      )}
    </Link>
  );
}

export function BottomNavClient({
  isAdmin,
  hasCompany,
  fullName,
  avatarUrl,
  email,
}: {
  isAdmin: boolean;
  hasCompany: boolean;
  fullName: string | null;
  avatarUrl: string | null;
  email: string | null;
}) {
  const pathname = usePathname();
  const { cart } = useCart();
  const count = cartItemCount(cart);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t bg-background px-1 pt-1 sm:hidden"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.25rem)" }}
    >
      <NavLink href="/" icon={Home} label="Início" active={pathname === "/"} />
      <NavLink href="/mapa" icon={MapIcon} label="Mapa" active={pathname === "/mapa"} />
      <SearchNavButton />
      <NavLink
        href="/carrinho"
        icon={ShoppingBag}
        label="Carrinho"
        active={pathname === "/carrinho"}
        badge={count}
      />
      <SideMenu
        loggedIn
        isAdmin={isAdmin}
        hasCompany={hasCompany}
        fullName={fullName}
        avatarUrl={avatarUrl}
        email={email}
        trigger={
          <button
            type="button"
            className="flex flex-1 flex-col items-center gap-0.5 py-1 text-xs text-muted-foreground"
          >
            <User className="size-5" />
            Perfil
          </button>
        }
      />
    </nav>
  );
}
