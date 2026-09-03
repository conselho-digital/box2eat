"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MenuItemOptionsDialog } from "@/components/menu/menu-item-options-dialog";
import { useMenuItemCart, type MenuItemCartCompany } from "@/components/menu/use-menu-item-cart";
import type { MenuItem } from "@/lib/domain/menu";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function MenuItemCard({
  item,
  company,
}: {
  item: MenuItem;
  company: MenuItemCartCompany;
}) {
  const cart = useMenuItemCart(item, company);

  return (
    <>
      <div className="flex gap-3 p-3">
        {item.image_url && (
          <Image
            src={item.image_url}
            alt={item.name}
            width={64}
            height={64}
            className="size-16 shrink-0 rounded-lg object-cover"
          />
        )}
        <div className="flex flex-1 flex-col">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-medium">{item.name}</span>
            <span className="text-sm text-muted-foreground">{currency.format(item.price)}</span>
          </div>
          {item.description && (
            <p className="text-sm text-muted-foreground">{item.description}</p>
          )}
          <div className="mt-2">
            <Button size="sm" onClick={cart.hasOptions ? cart.openDialog : cart.addSimple}>
              {cart.justAdded ? "Adicionado ✓" : "Adicionar"}
            </Button>
          </div>
        </div>
      </div>

      <MenuItemOptionsDialog
        item={item}
        open={cart.open}
        onOpenChange={cart.setOpen}
        selected={cart.selected}
        onToggleOption={cart.toggleOption}
        selectedAddonIds={cart.selectedAddonIds}
        onToggleAddon={cart.toggleAddon}
        isValid={cart.isValid()}
        onConfirm={cart.confirmAdd}
      />
    </>
  );
}
