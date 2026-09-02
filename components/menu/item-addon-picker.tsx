"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { setItemAddons, type MenuItem } from "@/lib/domain/menu";
import { itemsQueryKey, useCategories, useMenuItems } from "./hooks";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** "Opcional": lets an item point at other real, separately-sellable menu
 *  items as add-ons (e.g. a burger's opcional pointing at a soda in
 *  Bebidas) — picked from the company's own categories/items, not typed
 *  in as free-text choices. */
export function ItemAddonPicker({ companyId, item }: { companyId: string; item: MenuItem }) {
  const queryClient = useQueryClient();
  const { data: categories } = useCategories(companyId);
  const { data: items } = useMenuItems(companyId);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(item.menu_item_addons.map((a) => a.addon_item_id)),
  );

  const saveMutation = useMutation({
    mutationFn: async (addonItemIds: string[]) => {
      const supabase = createClient();
      const { error } = await setItemAddons(supabase, item.id, addonItemIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemsQueryKey(companyId) });
      queryClient.invalidateQueries({ queryKey: ["menu-item", item.id] });
      setOpen(false);
    },
  });

  function openPicker() {
    setSelected(new Set(item.menu_item_addons.map((a) => a.addon_item_id)));
    setOpen(true);
  }

  function toggleItem(itemId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  function toggleCategory(categoryItemIds: string[], allSelected: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of categoryItemIds) {
        if (allSelected) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  }

  const otherItems = (items ?? []).filter((i) => i.id !== item.id);
  const groups = (categories ?? [])
    .map((category) => ({
      category,
      items: otherItems.filter((i) => i.category_id === category.id),
    }))
    .filter((g) => g.items.length > 0);
  const uncategorized = otherItems.filter((i) => !i.category_id);

  const selectedByCategory = groups
    .map((g) => ({ category: g.category, items: g.items.filter((i) => selected.has(i.id)) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Opcional</h3>
        <Button type="button" size="sm" variant="outline" onClick={openPicker}>
          Adicionar opcional
        </Button>
      </div>

      {!open && selectedByCategory.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nenhum opcional ainda. Adicione outros itens do cardápio (ex: bebidas) pra
          oferecer junto com este.
        </p>
      )}

      {!open &&
        selectedByCategory.map(({ category, items: catItems }) => (
          <div key={category.id} className="text-sm">
            <p className="font-medium">{category.name}</p>
            <ul className="text-muted-foreground">
              {catItems.map((i) => (
                <li key={i.id}>
                  {i.name} · {currency.format(i.price)}
                </li>
              ))}
            </ul>
          </div>
        ))}

      {open && (
        <div className="flex flex-col gap-3 rounded-lg border p-3">
          {groups.map(({ category, items: categoryItems }) => {
            const allSelected = categoryItems.every((i) => selected.has(i.id));
            return (
              <div key={category.id}>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() =>
                      toggleCategory(
                        categoryItems.map((i) => i.id),
                        allSelected,
                      )
                    }
                  />
                  {category.name}
                </label>
                <div className="mt-1 ml-6 flex flex-col gap-1">
                  {categoryItems.map((i) => (
                    <label key={i.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selected.has(i.id)}
                        onChange={() => toggleItem(i.id)}
                      />
                      <span className="flex-1">{i.name}</span>
                      <span className="text-muted-foreground">{currency.format(i.price)}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}

          {uncategorized.length > 0 && (
            <div>
              <p className="text-sm font-medium">Sem categoria</p>
              <div className="mt-1 ml-6 flex flex-col gap-1">
                {uncategorized.map((i) => (
                  <label key={i.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selected.has(i.id)}
                      onChange={() => toggleItem(i.id)}
                    />
                    <span className="flex-1">{i.name}</span>
                    <span className="text-muted-foreground">{currency.format(i.price)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {groups.length === 0 && uncategorized.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Cadastre outros itens no cardápio pra poder oferecê-los aqui como opcional.
            </p>
          )}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              disabled={saveMutation.isPending}
              onClick={() => saveMutation.mutate([...selected])}
            >
              {saveMutation.isPending ? "Salvando…" : "Salvar opcionais"}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
