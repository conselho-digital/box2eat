"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { CartProvider } from "@/components/cart/cart-provider";
import { CartBar } from "@/components/cart/cart-bar";
import { MustSetPasswordDialog } from "@/components/auth/must-set-password-dialog";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";
import { InstallAppProvider } from "@/components/pwa/install-app-provider";

export function Providers({
  header,
  bottomNav,
  children,
}: {
  header: React.ReactNode;
  bottomNav: React.ReactNode;
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <InstallAppProvider>
        <CartProvider>
          {header}
          {/* Bottom padding reserves room above the fixed mobile bottom nav
              (logged-in only) so page content isn't hidden behind it. */}
          <div className="flex flex-1 flex-col pb-20 sm:pb-0">{children}</div>
          <CartBar />
          {bottomNav}
          <MustSetPasswordDialog />
          <RegisterServiceWorker />
        </CartProvider>
      </InstallAppProvider>
    </QueryClientProvider>
  );
}
