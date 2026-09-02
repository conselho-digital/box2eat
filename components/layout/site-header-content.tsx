"use client";

import { usePathname } from "next/navigation";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { AuthToggleButton } from "@/components/auth/auth-toggle-button";
import { CartButton } from "@/components/cart/cart-button";
import { SideMenu } from "@/components/layout/side-menu";
import { AddressBar } from "@/components/home/address-bar";
import { AccountTabs, ACCOUNT_TABS } from "@/components/account/account-tabs";
import { useMapStats } from "@/components/map/map-stats-context";
import { CompanyListHeaderButton } from "@/components/companies/company-list-header-button";
import { CompanyPublicLink } from "@/components/companies/company-public-link";
import { useCompanyDashboardHeader } from "@/components/companies/company-dashboard-header-context";
import type { UserAddress } from "@/lib/domain/address";

/** The navbar's middle slot and notification bell are route-dependent (home
 *  gets the address bar, /conta gets its tabs, /carrinho gets a title) —
 *  this needs to react to client-side navigation, so it's split out from the
 *  server-rendered SiteHeader shell into its own client component. */
export function SiteHeaderContent({
  user,
  isAdmin,
  hasCompany,
  fullName,
  avatarUrl,
  initialAddress,
}: {
  user: { id: string; email: string | null } | null;
  isAdmin: boolean;
  hasCompany: boolean;
  fullName: string | null;
  avatarUrl: string | null;
  initialAddress: UserAddress | null;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAccount = pathname === "/conta" || pathname.startsWith("/conta/");
  const isCart = pathname === "/carrinho";
  const isCheckout = pathname === "/checkout";
  const isMapa = pathname === "/mapa";
  const isEmpresas = pathname === "/empresas";
  const companyDashboardMatch = pathname.match(/^\/empresas\/([^/]+)/);
  const companyDashboardId = companyDashboardMatch?.[1];
  const { visibleCount } = useMapStats();
  const { company } = useCompanyDashboardHeader();

  return (
    <>
      {user && isHome && (
        <div className="min-w-0 flex-1">
          <AddressBar userId={user.id} initialAddress={initialAddress} />
        </div>
      )}
      {isAccount && (
        <div className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <AccountTabs tabs={ACCOUNT_TABS} />
        </div>
      )}
      {isCart && <p className="min-w-0 flex-1 truncate font-semibold">Carrinho</p>}
      {isCheckout && <p className="min-w-0 flex-1 truncate font-semibold">Checkout</p>}
      {isMapa && (
        <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
          {visibleCount === null
            ? "Carregando…"
            : `${visibleCount} ${visibleCount === 1 ? "restaurante" : "restaurantes"}`}
        </p>
      )}
      {user && isEmpresas && <p className="min-w-0 flex-1 truncate font-semibold">Meus restaurantes</p>}
      {companyDashboardId && company && (
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{company.name}</p>
          <CompanyPublicLink slug={company.slug} />
        </div>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-1">
        {user ? (
          <>
            {isEmpresas && <CompanyListHeaderButton />}
            <span className="hidden sm:flex">
              <CartButton />
            </span>
            {isHome && <NotificationBell userId={user.id} />}
            <span className="hidden sm:flex">
              <SideMenu
                loggedIn
                isAdmin={isAdmin}
                hasCompany={hasCompany}
                fullName={fullName}
                avatarUrl={avatarUrl}
                email={user.email}
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
    </>
  );
}
