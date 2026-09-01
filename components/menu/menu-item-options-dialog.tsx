"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MenuItem } from "@/lib/domain/menu";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function MenuItemOptionsDialog({
  item,
  open,
  onOpenChange,
  selected,
  onToggleOption,
  isValid,
  onConfirm,
}: {
  item: MenuItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: Record<string, string[]>;
  onToggleOption: (groupId: string, optionId: string, max: number) => void;
  isValid: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                          onChange={() => onToggleOption(group.id, option.id, group.max_select)}
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
          <Button onClick={onConfirm} disabled={!isValid}>
            Adicionar ao carrinho
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
