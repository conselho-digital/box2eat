"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-provider";
import { restaurantSubtotal, type RestaurantCart } from "@/lib/domain/cart";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function RestaurantCartDetail({
  restaurant,
  hasOtherRestaurants,
  onBack,
}: {
  restaurant: RestaurantCart;
  hasOtherRestaurants: boolean;
  onBack: () => void;
}) {
  const router = useRouter();
  const { removeItem, updateQuantity, removeRestaurant } = useCart();

  function handleRemoveRestaurant() {
    if (!window.confirm(`Remover todos os itens de ${restaurant.companyName} do carrinho?`)) return;
    removeRestaurant(restaurant.companyId);
    onBack();
  }

  function handleContinue() {
    if (hasOtherRestaurants) {
      window.alert(
        "Você tem itens de mais de um restaurante no carrinho. Deixe apenas os itens de um restaurante para continuar.",
      );
      return;
    }
    router.push("/checkout/opcionais");
  }

  return (
    // pb clears the fixed "Continuar" button at the bottom of this view.
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-6 pb-[calc(env(safe-area-inset-bottom)+6rem)]">
      <button
        type="button"
        onClick={onBack}
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Voltar
      </button>

      <div className="flex items-center justify-between gap-2">
        <Link href={`/${restaurant.companySlug}`} className="font-semibold hover:underline">
          {restaurant.companyName}
        </Link>
        <Button
          size="sm"
          className="bg-destructive text-white hover:bg-destructive/90"
          onClick={handleRemoveRestaurant}
        >
          Remover restaurante
        </Button>
      </div>

      <div className="flex flex-col divide-y rounded-lg border">
        {restaurant.items.map((item) => {
          const optionsTotal = item.options.reduce((s, o) => s + o.priceDelta, 0);
          const lineTotal = (item.unitPrice + optionsTotal) * item.quantity;
          return (
            <div key={item.key} className="flex items-start gap-3 p-3">
              {item.imageUrl && (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  width={56}
                  height={56}
                  className="size-14 shrink-0 rounded-lg object-cover"
                />
              )}
              <div className="flex flex-1 flex-col">
                <span className="font-medium">{item.name}</span>
                {item.description && (
                  <p className="line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
                )}
                {item.options.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {item.options.map((o) => o.name).join(", ")}
                  </span>
                )}
                <span className="mt-1 text-sm font-medium">{currency.format(lineTotal)}</span>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {item.quantity === 1 ? (
                  <Button
                    size="icon-sm"
                    variant="outline"
                    aria-label="Remover item"
                    onClick={() => removeItem(restaurant.companyId, item.key)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                ) : (
                  <Button
                    size="icon-sm"
                    variant="outline"
                    aria-label="Diminuir quantidade"
                    onClick={() =>
                      updateQuantity(restaurant.companyId, item.key, item.quantity - 1)
                    }
                  >
                    <Minus className="size-3.5" />
                  </Button>
                )}
                <span className="w-4 text-center text-sm">{item.quantity}</span>
                <Button
                  size="icon-sm"
                  variant="outline"
                  aria-label="Aumentar quantidade"
                  onClick={() => updateQuantity(restaurant.companyId, item.key, item.quantity + 1)}
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium">{currency.format(restaurantSubtotal(restaurant))}</span>
      </div>
      <p className="text-xs text-muted-foreground">A taxa de entrega é calculada no checkout.</p>

      <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] z-[1100] border-t bg-background p-3 sm:sticky sm:bottom-0 sm:mt-2 sm:border-0 sm:bg-transparent sm:p-0">
        <div className="mx-auto w-full max-w-2xl">
          <Button className="w-full" onClick={handleContinue}>
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
