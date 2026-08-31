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
  children,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <InstallAppProvider>
        <CartProvider>
          {header}
          {children}
          <CartBar />
          <MustSetPasswordDialog />
          <RegisterServiceWorker />
        </CartProvider>
      </InstallAppProvider>
    </QueryClientProvider>
  );
}
