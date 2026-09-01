"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCart } from "@/components/cart/cart-provider";
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
  const { addItem } = useCart();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [justAdded, setJustAdded] = useState(false);

  const hasOptions = item.menu_item_option_groups.length > 0;

  function openDialog() {
    setSelected(Object.fromEntries(item.menu_item_option_groups.map((g) => [g.id, []])));
    setOpen(true);
  }

  function toggleOption(groupId: string, optionId: string, max: number) {
    setSelected((current) => {
      const group = current[groupId] ?? [];
      if (group.includes(optionId)) {
        return { ...current, [groupId]: group.filter((id) => id !== optionId) };
      }
      const next = max === 1 ? [optionId] : [...group, optionId];
      return { ...current, [groupId]: next.slice(-max) };
    });
  }

  function isValid() {
    return item.menu_item_option_groups.every((g) => {
      const count = selected[g.id]?.length ?? 0;
      return count >= g.min_select && count <= g.max_select;
    });
  }

  function flashAdded() {
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  function confirmAdd() {
    const options = item.menu_item_option_groups.flatMap((g) =>
      (selected[g.id] ?? []).map((optionId) => {
        const option = g.menu_item_options.find((o) => o.id === optionId)!;
        return { optionId, name: option.name, priceDelta: option.price_delta };
      }),
    );
    addItem({
      companyId,
      companyName,
      companySlug,
      menuItemId: item.id,
      name: item.name,
      unitPrice: item.price,
      quantity: 1,
      options,
    });
    setOpen(false);
    flashAdded();
  }

  function addSimple() {
    addItem({
      companyId,
      companyName,
      companySlug,
      menuItemId: item.id,
      name: item.name,
      unitPrice: item.price,
      quantity: 1,
      options: [],
    });
    flashAdded();
  }

  return (
    <>
      <div className="w-36 shrink-0 snap-start">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
          {item.image_url && <Image src={item.image_url} alt="" fill className="object-cover" />}
          <button
            type="button"
            onClick={hasOptions ? openDialog : addSimple}
            aria-label={`Adicionar ${item.name}`}
            className="absolute right-2 bottom-2 flex size-8 items-center justify-center rounded-full bg-card text-foreground shadow"
          >
            <Plus className="size-4" />
          </button>
          {justAdded && (
            <span className="absolute inset-0 flex items-center justify-center bg-background/80 text-sm font-medium">
              Adicionado ✓
            </span>
          )}
        </div>
        <p className="mt-2 font-semibold">{currency.format(item.price)}</p>
        <p className="line-clamp-2 text-sm">{item.name}</p>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{item.name}</DialogTitle>
            <DialogDescription>Escolha as opções do item.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {item.menu_item_option_groups.map((group) => (
              <div key={group.id} className="flex flex-col gap-1.5">
                <p className="text-sm font-medium">
                  {group.name}
                  {group.is_required && <span className="text-destructive"> *</span>}
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({group.max_select === 1 ? "escolha 1" : `até ${group.max_select}`})
                  </span>
                </p>
                <div className="flex flex-col gap-1">
                  {group.menu_item_options
                    .filter((o) => o.is_available)
                    .map((option) => {
                      const checked = (selected[group.id] ?? []).includes(option.id);
                      return (
                        <label key={option.id} className="flex items-center gap-2 text-sm">
                          <input
                            type={group.max_select === 1 ? "radio" : "checkbox"}
                            name={group.id}
                            checked={checked}
                            onChange={() => toggleOption(group.id, option.id, group.max_select)}
                          />
                          <span className="flex-1">{option.name}</span>
                          {option.price_delta !== 0 && (
                            <span className="text-muted-foreground">
                              +{currency.format(option.price_delta)}
                            </span>
                          )}
                        </label>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={confirmAdd} disabled={!isValid()}>
              Adicionar ao carrinho
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
