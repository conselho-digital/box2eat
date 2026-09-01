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
    // Pinned directly above the fixed mobile bottom nav (logged-in only) —
    // fixed instead of sticky so it always sits flush against the nav's
    // exact height (safe-area included) instead of drifting with scroll
    // and leaving a gap of bare page background between the two. Desktop
    // has no bottom nav, so it just sticks to the true bottom there.
    <div
      className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] z-30 border-t bg-primary p-3 text-primary-foreground sm:sticky sm:bottom-0"
    >
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
