"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import type { MenuItem } from "@/lib/domain/menu";

export function useMenuItemCart(
  item: MenuItem,
  companyId: string,
  companyName: string,
  companySlug: string,
) {
  const { addItem } = useCart();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [selectedAddonIds, setSelectedAddonIds] = useState<Set<string>>(new Set());
  const [justAdded, setJustAdded] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const hasOptions = item.menu_item_option_groups.length > 0 || item.menu_item_addons.length > 0;

  function openDialog() {
    setSelected(Object.fromEntries(item.menu_item_option_groups.map((g) => [g.id, []])));
    setSelectedAddonIds(new Set());
    setOpen(true);
  }

  function toggleAddon(addonItemId: string) {
    setSelectedAddonIds((current) => {
      const next = new Set(current);
      if (next.has(addonItemId)) next.delete(addonItemId);
      else next.add(addonItemId);
      return next;
    });
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
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setJustAdded(false), 1200);
  }

  function confirmAdd() {
    const options = item.menu_item_option_groups.flatMap((g) =>
      (selected[g.id] ?? []).map((optionId) => {
        const option = g.menu_item_options.find((o) => o.id === optionId)!;
        return { optionId, name: option.name, priceDelta: option.price_delta };
      }),
    );
    const addonOptions = item.menu_item_addons
      .filter((a) => selectedAddonIds.has(a.addon_item_id))
      .map((a) => ({
        optionId: a.addon_item_id,
        name: a.menu_items.name,
        priceDelta: a.menu_items.price,
      }));
    addItem({
      companyId,
      companyName,
      companySlug,
      menuItemId: item.id,
      name: item.name,
      unitPrice: item.price,
      quantity: 1,
      options: [...options, ...addonOptions],
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

  return {
    open,
    setOpen,
    selected,
    selectedAddonIds,
    hasOptions,
    justAdded,
    openDialog,
    toggleOption,
    toggleAddon,
    isValid,
    confirmAdd,
    addSimple,
  };
}
