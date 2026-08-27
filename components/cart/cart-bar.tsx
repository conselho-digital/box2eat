"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/cart-provider";
import { cartItemCount, cartSubtotal } from "@/lib/domain/cart";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function CartBar() {
  const { cart } = useCart();
  const count = cartItemCount(cart);

  if (!cart || count === 0) return null;

  return (
    <div className="sticky bottom-0 z-10 border-t bg-primary p-3 text-primary-foreground">
      <Link
        href="/carrinho"
        className="mx-auto flex w-full max-w-2xl items-center justify-between text-sm font-medium"
      >
        <span>
          {count} item{count > 1 ? "s" : ""} · {cart.companyName}
        </span>
        <span>Ver carrinho · {currency.format(cartSubtotal(cart))}</span>
      </Link>
    </div>
  );
}
