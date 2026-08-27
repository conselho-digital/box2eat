"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { CartProvider } from "@/components/cart/cart-provider";
import { CartBar } from "@/components/cart/cart-bar";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        {children}
        <CartBar />
      </CartProvider>
    </QueryClientProvider>
  );
}
