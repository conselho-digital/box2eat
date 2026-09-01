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
  const [justAdded, setJustAdded] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

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

  return {
    open,
    setOpen,
    selected,
    hasOptions,
    justAdded,
    openDialog,
    toggleOption,
    isValid,
    confirmAdd,
    addSimple,
  };
}
