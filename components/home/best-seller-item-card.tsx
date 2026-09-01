"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { MenuItemOptionsDialog } from "@/components/menu/menu-item-options-dialog";
import { useMenuItemCart } from "@/components/menu/use-menu-item-cart";
import type { MenuItem } from "@/lib/domain/menu";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function BestSellerItemCard({
  item,
  companyId,
  companyName,
  companySlug,
}: {
  item: MenuItem;
  companyId: string;
  companyName: string;
  companySlug: string;
}) {
  const cart = useMenuItemCart(item, companyId, companyName, companySlug);

  return (
    <>
      <div className="w-36 shrink-0 snap-start">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
          {item.image_url && <Image src={item.image_url} alt="" fill className="object-cover" />}
          <button
            type="button"
            onClick={cart.hasOptions ? cart.openDialog : cart.addSimple}
            aria-label={`Adicionar ${item.name}`}
            className="absolute right-2 bottom-2 flex size-8 items-center justify-center rounded-full bg-card text-foreground shadow"
          >
            <Plus className="size-4" />
          </button>
          {cart.justAdded && (
            <span className="absolute inset-0 flex items-center justify-center bg-background/80 text-sm font-medium">
              Adicionado ✓
            </span>
          )}
        </div>
        <p className="mt-2 font-semibold">{currency.format(item.price)}</p>
        <p className="line-clamp-2 text-sm">{item.name}</p>
      </div>

      <MenuItemOptionsDialog
        item={item}
        open={cart.open}
        onOpenChange={cart.setOpen}
        selected={cart.selected}
        onToggleOption={cart.toggleOption}
        isValid={cart.isValid()}
        onConfirm={cart.confirmAdd}
      />
    </>
  );
}
