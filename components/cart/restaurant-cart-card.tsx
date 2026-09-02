"use client";

import Image from "next/image";
import Link from "next/link";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { restaurantItemCount, restaurantSubtotal, type RestaurantCart } from "@/lib/domain/cart";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function RestaurantCartCard({
  restaurant,
  onViewCart,
}: {
  restaurant: RestaurantCart;
  onViewCart: () => void;
}) {
  const count = restaurantItemCount(restaurant);

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3">
      <div className="flex gap-3">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
          {restaurant.companyLogoUrl ? (
            <Image src={restaurant.companyLogoUrl} alt="" fill className="object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <Store className="size-6" />
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-col justify-center">
          <p className="truncate font-semibold">{restaurant.companyName}</p>
          <p className="text-sm text-muted-foreground">
            {count} item{count > 1 ? "s" : ""} · {currency.format(restaurantSubtotal(restaurant))}
          </p>
          {restaurant.companyAddress && (
            <p className="truncate text-xs text-muted-foreground">{restaurant.companyAddress}</p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" className="flex-1" onClick={onViewCart}>
          Ver carrinho
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          render={<Link href={`/${restaurant.companySlug}`} />}
          nativeButton={false}
        >
          Ver loja
        </Button>
      </div>
    </div>
  );
}
