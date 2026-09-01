"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, ShoppingCart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/cart/cart-provider";
import { cartItemCount } from "@/lib/domain/cart";
import { SideMenu } from "@/components/layout/side-menu";
import { SearchNavButton } from "@/components/layout/search-nav-button";

const CIRCLE_BASE =
  "relative flex size-12 items-center justify-center rounded-full shadow-md transition-colors";
const CIRCLE_ACTIVE = "bg-foreground text-background";
const CIRCLE_INACTIVE = "bg-card text-foreground";

function NavCircle({
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
    <Link href={href} aria-label={label} className={cn(CIRCLE_BASE, active ? CIRCLE_ACTIVE : CIRCLE_INACTIVE)}>
      <Icon className="size-5" />
      {Boolean(badge) && (
        <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
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
    // z-[1100]: Leaflet's own panes/controls (e.g. loaded map tiles) go up
    // to z-index 1000 and don't form their own stacking context, so at the
    // old z-40 they could paint right over these buttons on the map page —
    // invisible in a sandbox with no tile access, very visible with real
    // tiles loaded. Match the same z-index used for dialogs above the map.
    <nav
      className="fixed inset-x-0 bottom-0 z-[1100] flex items-center justify-center gap-3 px-4 pt-3 sm:hidden"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
    >
      <NavCircle href="/" icon={Home} label="Início" active={pathname === "/"} />
      <NavCircle href="/mapa" icon={MapPin} label="Mapa" active={pathname === "/mapa"} />
      <SearchNavButton className={cn(CIRCLE_BASE, CIRCLE_INACTIVE)} />
      <NavCircle
        href="/carrinho"
        icon={ShoppingCart}
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
          <button type="button" aria-label="Perfil" className={cn(CIRCLE_BASE, CIRCLE_INACTIVE)}>
            <User className="size-5" />
          </button>
        }
      />
    </nav>
  );
}
