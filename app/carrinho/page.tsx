"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardList, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-provider";
import { RestaurantCartCard } from "@/components/cart/restaurant-cart-card";
import { RestaurantCartDetail } from "@/components/cart/restaurant-cart-detail";

export default function CartPage() {
  const { cart } = useCart();
  const [viewingCompanyId, setViewingCompanyId] = useState<string | null>(null);

  const activeRestaurant = cart?.find((r) => r.companyId === viewingCompanyId) ?? null;

  if (!cart || cart.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col p-6">
        <div className="flex justify-end">
          <Button
            render={<Link href="/conta/pedidos" />}
            nativeButton={false}
            variant="secondary"
            className="rounded-full"
          >
            <ClipboardList className="size-4" />
            Pedidos
          </Button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-6 py-10 text-center">
          <div className="relative flex size-28 items-center justify-center">
            <span className="absolute top-0 right-4 size-2.5 rounded-full bg-emerald-400" />
            <span className="absolute top-3 -right-1 size-6 rotate-45 rounded-md bg-amber-400" />
            <span className="absolute bottom-2 -left-2 size-5 rounded-full bg-primary/15" />
            <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
              <ShoppingCart className="size-9 text-primary" strokeWidth={1.75} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-semibold">
              Adicione itens para começar a encher um carrinho
            </h1>
            <p className="max-w-xs text-sm text-muted-foreground">
              Depois que você adicionar itens de um restaurante ou loja, seu carrinho aparecerá
              aqui.
            </p>
          </div>

          <Button render={<Link href="/" />} nativeButton={false} size="lg" className="rounded-full px-6">
            Começar a comprar
          </Button>
        </div>
      </div>
    );
  }

  if (activeRestaurant) {
    return (
      <RestaurantCartDetail
        restaurant={activeRestaurant}
        hasOtherRestaurants={cart.length > 1}
        onBack={() => setViewingCompanyId(null)}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-3 p-6">
      {cart.map((restaurant) => (
        <RestaurantCartCard
          key={restaurant.companyId}
          restaurant={restaurant}
          onViewCart={() => setViewingCompanyId(restaurant.companyId)}
        />
      ))}
    </div>
  );
}
