"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-provider";
import { createClient } from "@/lib/supabase/client";
import { listAddonsForItems, type MenuItemAddonEntry } from "@/lib/domain/menu";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function CheckoutOpcionaisPage() {
  const router = useRouter();
  const { cart, hydrated } = useCart();
  const restaurant = cart?.length === 1 ? cart[0] : null;
  const menuItemIds = restaurant?.items.map((item) => item.menuItemId) ?? [];

  const { data: addons } = useQuery({
    queryKey: ["cart-addons", menuItemIds],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await listAddonsForItems(supabase, menuItemIds);
      if (error) throw error;
      return data;
    },
    enabled: menuItemIds.length > 0,
  });

  const cartIsEmpty = hydrated && (!cart || cart.length === 0);

  useEffect(() => {
    if (cartIsEmpty) router.replace("/carrinho");
  }, [cartIsEmpty, router]);

  if (!hydrated || cartIsEmpty) return null;

  if (!restaurant) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Você tem itens de mais de um restaurante no carrinho. Deixe apenas os itens de um
          restaurante para continuar.
        </p>
        <Button render={<Link href="/carrinho" />} nativeButton={false}>
          Voltar ao carrinho
        </Button>
      </div>
    );
  }

  const cartMenuItemIds = new Set(menuItemIds);
  const offeredById = new Map<string, MenuItemAddonEntry>();
  for (const addon of addons ?? []) {
    if (!addon.menu_items.is_available) continue;
    if (cartMenuItemIds.has(addon.addon_item_id)) continue;
    offeredById.set(addon.addon_item_id, addon);
  }
  const offered = [...offeredById.values()];

  const grouped = Object.values(
    offered.reduce<Record<string, { name: string; addons: MenuItemAddonEntry[] }>>(
      (acc, addon) => {
        const key = addon.menu_items.category_id ?? "__uncategorized";
        const name = addon.menu_items.menu_categories?.name ?? "Outros";
        (acc[key] ??= { name, addons: [] }).addons.push(addon);
        return acc;
      },
      {},
    ),
  );

  return (
    // pb clears the fixed "Continuar" button at the bottom of this page.
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 p-6 pb-[calc(env(safe-area-inset-bottom)+6rem)]">
      <div>
        <h1 className="text-lg font-semibold">Que tal completar seu pedido?</h1>
        <p className="text-sm text-muted-foreground">
          Sugestões de {restaurant.companyName} para acompanhar seus itens.
        </p>
      </div>

      {grouped.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhuma sugestão por aqui.</p>
      )}

      {grouped.map(({ name, addons: categoryAddons }) => (
        <div key={name} className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold">{name}</h2>
          <div className="flex flex-col divide-y rounded-lg border">
            {categoryAddons.map((addon) => (
              <Link
                key={addon.addon_item_id}
                href={`/${restaurant.companySlug}/produto/${addon.addon_item_id}`}
                className="flex items-center gap-3 p-3 hover:bg-muted"
              >
                {addon.menu_items.image_url && (
                  <Image
                    src={addon.menu_items.image_url}
                    alt=""
                    width={48}
                    height={48}
                    className="size-12 shrink-0 rounded-lg object-cover"
                  />
                )}
                <span className="flex-1 text-sm font-medium">{addon.menu_items.name}</span>
                <span className="text-sm text-muted-foreground">
                  {currency.format(addon.menu_items.price)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ))}

      <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] z-[1100] border-t bg-background p-3 sm:sticky sm:bottom-0 sm:mt-2 sm:border-0 sm:bg-transparent sm:p-0">
        <div className="mx-auto w-full max-w-2xl">
          <Button className="w-full" render={<Link href="/checkout" />} nativeButton={false}>
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
