"use client";

import Link from "next/link";
import { ClipboardList, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-provider";
import { cartSubtotal } from "@/lib/domain/cart";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function CartPage() {
  const { cart, updateQuantity, removeItem, clearCart } = useCart();

  if (!cart || cart.items.length === 0) {
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

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Carrinho · {cart.companyName}</h1>
        <button
          type="button"
          className="text-sm text-muted-foreground hover:text-destructive"
          onClick={clearCart}
        >
          Esvaziar
        </button>
      </div>

      <div className="flex flex-col divide-y rounded-lg border">
        {cart.items.map((item) => {
          const optionsTotal = item.options.reduce((s, o) => s + o.priceDelta, 0);
          const lineTotal = (item.unitPrice + optionsTotal) * item.quantity;
          return (
            <div key={item.key} className="flex items-start justify-between gap-3 p-3">
              <div className="flex flex-col">
                <span className="font-medium">{item.name}</span>
                {item.options.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {item.options.map((o) => o.name).join(", ")}
                  </span>
                )}
                <div className="mt-1 flex items-center gap-2">
                  <Button
                    size="icon-sm"
                    variant="outline"
                    onClick={() => updateQuantity(item.key, item.quantity - 1)}
                  >
                    −
                  </Button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    onClick={() => updateQuantity(item.key, item.quantity + 1)}
                  >
                    +
                  </Button>
                  <button
                    type="button"
                    className="ml-2 text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(item.key)}
                  >
                    remover
                  </button>
                </div>
              </div>
              <span className="text-sm font-medium">{currency.format(lineTotal)}</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium">{currency.format(cartSubtotal(cart))}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        A taxa de entrega é calculada no checkout.
      </p>

      <Button render={<Link href="/checkout" />} nativeButton={false}>
        Ir para o checkout
      </Button>
    </div>
  );
}
