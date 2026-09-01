"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { CartProvider } from "@/components/cart/cart-provider";
import { CartBar } from "@/components/cart/cart-bar";
import { MustSetPasswordDialog } from "@/components/auth/must-set-password-dialog";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";
import { InstallAppProvider } from "@/components/pwa/install-app-provider";
import { MapStatsProvider } from "@/components/map/map-stats-context";
import { CompanyListHeaderProvider } from "@/components/companies/company-list-header-context";
import { CompanyDashboardHeaderProvider } from "@/components/companies/company-dashboard-header-context";

export function Providers({
  header,
  bottomNav,
  children,
}: {
  header: React.ReactNode;
  bottomNav: React.ReactNode;
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        // Default is 0 (refetch on every mount) — most of this app's data
        // (account info, addresses, favorites, admin lists) doesn't change
        // moment-to-moment, so re-opening a menu/dialog was re-fetching
        // everything even seconds after the last fetch. Queries that do
        // need live data already invalidate explicitly (e.g. notifications
        // via Realtime), so this doesn't make anything feel stale.
        defaultOptions: { queries: { staleTime: 30_000 } },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <InstallAppProvider>
        <MapStatsProvider>
          <CompanyListHeaderProvider>
            <CompanyDashboardHeaderProvider>
              <CartProvider>
                {header}
                {/* Bottom padding reserves room above the fixed mobile bottom nav
                    (logged-in only) so page content isn't hidden behind it. Pages
                    that want to bleed under the nav (e.g. the map) cancel this
                    with a matching negative margin on their own root. */}
                <div className="flex flex-1 flex-col pb-20 sm:pb-0">{children}</div>
                <CartBar />
                {bottomNav}
                <MustSetPasswordDialog />
                <RegisterServiceWorker />
              </CartProvider>
            </CompanyDashboardHeaderProvider>
          </CompanyListHeaderProvider>
        </MapStatsProvider>
      </InstallAppProvider>
    </QueryClientProvider>
  );
}
