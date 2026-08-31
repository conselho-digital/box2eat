"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/cart/cart-provider";
import { cartItemCount } from "@/lib/domain/cart";

export function CartButton() {
  const { cart } = useCart();
  const count = cartItemCount(cart);

  return (
    <Link href="/carrinho" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative")}>
      <ShoppingBag />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
