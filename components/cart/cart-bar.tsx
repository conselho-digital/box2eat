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
    // Sits above the fixed mobile bottom nav (logged-in only, ~56px tall) so
    // it isn't covered by it; desktop has no bottom nav, so no offset there.
    <div className="sticky bottom-14 z-30 border-t bg-primary p-3 text-primary-foreground sm:bottom-0">
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
