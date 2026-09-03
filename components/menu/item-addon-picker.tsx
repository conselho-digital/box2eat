"use client";

import Image from "next/image";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MenuCategory, MenuItem } from "@/lib/domain/menu";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export type AddonGroupDraft = { key: string; categoryId: string; minSelect: number };

/** "Opcional": lets an item point at other real, separately-sellable menu
 *  items as add-ons (e.g. a burger's opcional pointing at a soda in
 *  Bebidas), grouped by category, with a minimum-selection requirement per
 *  group — e.g. a combo requiring at least 1 side AND 1 drink. Fully
 *  controlled: the parent dialog owns all the state (including which
 *  categories/items exist, so it can clean up selections when a group is
 *  removed) so it can be edited before the item itself has been saved. */
export function ItemAddonPicker({
  categories,
  items,
  excludeItemId,
  groups,
  onAddGroup,
  onSetGroupCategory,
  onSetGroupMinSelect,
  onRemoveGroup,
  selectedAddonIds,
  onToggleAddon,
}: {
  categories: MenuCategory[];
  items: MenuItem[];
  excludeItemId?: string;
  groups: AddonGroupDraft[];
  onAddGroup: () => void;
  onSetGroupCategory: (key: string, categoryId: string) => void;
  onSetGroupMinSelect: (key: string, minSelect: number) => void;
  onRemoveGroup: (key: string) => void;
  selectedAddonIds: Set<string>;
  onToggleAddon: (itemId: string) => void;
}) {
  const otherItems = items.filter((i) => i.id !== excludeItemId);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Opcional</h3>
        <Button type="button" size="sm" variant="outline" onClick={onAddGroup}>
          <Plus className="size-3.5" />
          Adicionar opcional
        </Button>
      </div>

      {groups.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nenhum opcional ainda. Adicione outros itens do cardápio (ex: bebidas) pra oferecer
          junto com este.
        </p>
      )}

      {groups.map((group) => {
        const usedElsewhere = new Set(
          groups.filter((g) => g.key !== group.key).map((g) => g.categoryId),
        );
        const availableCategories = categories.filter(
          (c) => c.id === group.categoryId || !usedElsewhere.has(c.id),
        );
        const categoryItems = otherItems.filter((i) => i.category_id === group.categoryId);

        return (
          <div key={group.key} className="flex flex-col gap-2 rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <select
                value={group.categoryId}
                onChange={(e) => onSetGroupCategory(group.key, e.target.value)}
                className="h-8 flex-1 rounded-lg border border-input bg-background px-2 text-sm"
              >
                <option value="">Selecione a categoria…</option>
                {availableCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => onRemoveGroup(group.key)}
                aria-label="Remover categoria de opcionais"
                className="rounded-full p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            {group.categoryId && (
              <>
                <div className="ml-auto flex w-44 flex-col gap-1">
                  <label className="text-xs text-muted-foreground">
                    Seleções obrigatórias
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={categoryItems.length}
                    value={group.minSelect}
                    onChange={(e) => onSetGroupMinSelect(group.key, Number(e.target.value) || 0)}
                    className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
                  />
                </div>

                {categoryItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum outro item nessa categoria ainda.
                  </p>
                ) : (
                  <div className="flex flex-col divide-y rounded-lg border">
                    {categoryItems.map((i) => (
                      <label key={i.id} className="flex items-center gap-3 p-2 text-sm">
                        {i.image_url ? (
                          <Image
                            src={i.image_url}
                            alt=""
                            width={36}
                            height={36}
                            className="size-9 shrink-0 rounded-md object-cover"
                          />
                        ) : (
                          <div className="size-9 shrink-0 rounded-md bg-muted" />
                        )}
                        <span className="flex-1">{i.name}</span>
                        <span className="text-muted-foreground">{currency.format(i.price)}</span>
                        <input
                          type="checkbox"
                          checked={selectedAddonIds.has(i.id)}
                          onChange={() => onToggleAddon(i.id)}
                        />
                      </label>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
