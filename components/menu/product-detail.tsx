"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MenuItemOptionsDialog } from "@/components/menu/menu-item-options-dialog";
import { useMenuItemCart, type MenuItemCartCompany } from "@/components/menu/use-menu-item-cart";
import { getDiscountedPrice, type MenuItem } from "@/lib/domain/menu";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Public single-item page — reached by tapping an "opcional" suggestion on
 *  the pre-checkout screen. Adding the item here returns straight back to
 *  wherever the customer came from (usually that same offer screen). */
export function ProductDetail({ item, company }: { item: MenuItem; company: MenuItemCartCompany }) {
  const router = useRouter();
  const cart = useMenuItemCart(item, company);
  const hasDiscount = item.promotion_type === "discount" && !!item.discount_percent;
  const discountedPrice = hasDiscount
    ? getDiscountedPrice(item.price, item.discount_percent!)
    : null;

  function handleAddClick() {
    if (cart.hasOptions) {
      cart.openDialog();
      return;
    }
    cart.addSimple();
    router.back();
  }

  function handleConfirm() {
    cart.confirmAdd();
    router.back();
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Voltar
      </button>

      {item.image_url && (
        <Image
          src={item.image_url}
          alt={item.name}
          width={640}
          height={360}
          className="aspect-video w-full rounded-xl object-cover"
        />
      )}

      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">{item.name}</h1>
        {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
        {hasDiscount ? (
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm text-muted-foreground line-through">
              {currency.format(item.price)}
            </span>
            <span className="rounded bg-destructive px-1.5 py-0.5 text-xs font-semibold text-destructive-foreground">
              -{item.discount_percent}% OFF
            </span>
            <span className="text-lg font-semibold text-destructive">
              {currency.format(discountedPrice!)}
            </span>
          </div>
        ) : (
          <p className="mt-1 text-lg font-semibold">{currency.format(item.price)}</p>
        )}
      </div>

      <Button onClick={handleAddClick} disabled={!item.is_available} className="mt-2">
        {!item.is_available
          ? "Indisponível"
          : cart.justAdded
            ? "Adicionado ✓"
            : "Adicionar ao carrinho"}
      </Button>

      <MenuItemOptionsDialog
        item={item}
        open={cart.open}
        onOpenChange={cart.setOpen}
        selected={cart.selected}
        onToggleOption={cart.toggleOption}
        selectedAddonIds={cart.selectedAddonIds}
        onToggleAddon={cart.toggleAddon}
        isValid={cart.isValid()}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
