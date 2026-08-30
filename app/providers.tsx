"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { CartProvider } from "@/components/cart/cart-provider";
import { CartBar } from "@/components/cart/cart-bar";
import { MustSetPasswordDialog } from "@/components/auth/must-set-password-dialog";

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
      <CartProvider>
        {header}
        {children}
        <CartBar />
        <MustSetPasswordDialog />
      </CartProvider>
    </QueryClientProvider>
  );
}
