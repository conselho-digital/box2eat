"use client";

import { useState } from "react";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Check, X, Trash2, ImageOff, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { deleteItem, type MenuItem } from "@/lib/domain/menu";
import { itemsQueryKey, useCategories, useMenuItems } from "./hooks";
import { useLongPress } from "./use-long-press";
import { ItemDialog } from "./item-dialog";
import { PhotoLightbox } from "./photo-lightbox";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const ALL_CATEGORIES = "__all__";

function ItemCard({
  item,
  selectionMode,
  selected,
  onOpen,
  onToggleSelect,
}: {
  item: MenuItem;
  selectionMode: boolean;
  selected: boolean;
  onOpen: () => void;
  onToggleSelect: () => void;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const longPress = useLongPress({
    onLongPress: onToggleSelect,
    onClick: () => (selectionMode ? onToggleSelect() : onOpen()),
  });

  const photos = [
    ...(item.image_url ? [item.image_url] : []),
    ...item.menu_item_images
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((i) => i.url),
  ];

  return (
    <div
      role="button"
      tabIndex={0}
      {...longPress}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (selectionMode) onToggleSelect();
          else onOpen();
        }
      }}
      className="relative flex touch-manipulation items-center gap-3 rounded-lg border p-3 text-left select-none"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (selectionMode) {
            onToggleSelect();
            return;
          }
          if (photos.length > 0) setLightboxOpen(true);
        }}
        className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted"
      >
        {item.image_url ? (
          <Image src={item.image_url} alt="" fill className="object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <ImageOff className="size-5" />
          </div>
        )}
        {!selectionMode && photos.length > 0 && (
          <span className="absolute right-0.5 bottom-0.5 flex size-4 items-center justify-center rounded-full bg-black/60 text-white">
            <ZoomIn className="size-2.5" />
          </span>
        )}
        {selectionMode && (
          <div
            className={`absolute inset-0 flex items-center justify-center ${selected ? "bg-black/40" : "bg-black/0"}`}
          >
            <span
              className={`flex size-6 items-center justify-center rounded-full border-2 border-white ${selected ? "bg-primary" : "bg-black/20"}`}
            >
              {selected && <Check className="size-4 text-primary-foreground" strokeWidth={3} />}
            </span>
          </div>
        )}
      </button>
      <div className={`flex min-w-0 flex-1 flex-col ${!item.is_available ? "opacity-50" : ""}`}>
        <span className="truncate font-medium">{item.name}</span>
        <span className="text-sm text-muted-foreground">{currency.format(item.price)}</span>
        {!item.is_available && (
          <span className="text-xs text-muted-foreground">Indisponível</span>
        )}
        {item.menu_item_addons.length > 0 && (
          <div className="mt-1 flex flex-col gap-0.5">
            {item.menu_item_addons.map((addon) => (
              <span key={addon.addon_item_id} className="truncate text-xs text-muted-foreground">
                {addon.menu_items.menu_categories?.name ?? "Sem categoria"} · {addon.menu_items.name}{" "}
                · {currency.format(addon.menu_items.price)}
              </span>
            ))}
          </div>
        )}
      </div>

      <PhotoLightbox photos={photos} open={lightboxOpen} onOpenChange={setLightboxOpen} />
    </div>
  );
}

export function ItemList({ companyId }: { companyId: string }) {
  const queryClient = useQueryClient();
  const { data: items, isLoading } = useMenuItems(companyId);
  const { data: categories } = useCategories(companyId);

  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dialogItem, setDialogItem] = useState<MenuItem | null | "new">(null);

  const selectionMode = selectedIds.size > 0;

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const supabase = createClient();
      await Promise.all(
        ids.map(async (id) => {
          const { error } = await deleteItem(supabase, id);
          if (error) throw error;
        }),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemsQueryKey(companyId) });
      setSelectedIds(new Set());
    },
  });

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>;

  const showAll = categoryFilter === ALL_CATEGORIES;
  const filtered = showAll
    ? (items ?? [])
    : (items ?? []).filter((item) => item.category_id === categoryFilter);

  const categoryLabel = showAll
    ? "Todas as categorias"
    : (categories?.find((c) => c.id === categoryFilter)?.name ?? "Categoria");

  // Grouped by category so "Todas as categorias" can show a separator + label
  // between each category's items instead of one undifferentiated list.
  const groups = showAll
    ? Object.values(
        filtered.reduce<Record<string, { name: string; items: MenuItem[] }>>((acc, item) => {
          const key = item.category_id ?? "__uncategorized";
          const name = item.menu_categories?.name ?? "Sem categoria";
          (acc[key] ??= { name, items: [] }).items.push(item);
          return acc;
        }, {}),
      )
    : [{ name: categoryLabel, items: filtered }];

  return (
    <div className="flex flex-col gap-4">
      {selectionMode ? (
        <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Cancelar seleção"
              onClick={() => setSelectedIds(new Set())}
            >
              <X className="size-4" />
            </Button>
            <span className="text-sm font-medium">{selectedIds.size} selecionado(s)</span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={bulkDeleteMutation.isPending}
            onClick={() => {
              if (window.confirm(`Excluir ${selectedIds.size} item(ns)?`)) {
                bulkDeleteMutation.mutate([...selectedIds]);
              }
            }}
          >
            <Trash2 className="size-3.5" />
            Excluir
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button type="button" variant="outline" size="sm">
                  {categoryLabel}
                </Button>
              }
            />
            <DropdownMenuContent className="w-56">
              <DropdownMenuRadioGroup value={categoryFilter} onValueChange={setCategoryFilter}>
                <DropdownMenuRadioItem value={ALL_CATEGORIES}>
                  Todas as categorias
                </DropdownMenuRadioItem>
                {categories?.map((category) => (
                  <DropdownMenuRadioItem key={category.id} value={category.id}>
                    {category.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button type="button" size="sm" onClick={() => setDialogItem("new")}>
            <Plus className="size-3.5" />
            Novo item
          </Button>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum item no cardápio ainda.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {groups.map((group, index) => (
            <div key={group.name + index} className="flex flex-col gap-2">
              {showAll && (
                <>
                  {index > 0 && <Separator className="my-1" />}
                  <span className="text-xs font-medium text-muted-foreground">{group.name}</span>
                </>
              )}
              {group.items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  selectionMode={selectionMode}
                  selected={selectedIds.has(item.id)}
                  onOpen={() => setDialogItem(item)}
                  onToggleSelect={() => toggleSelect(item.id)}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      <ItemDialog
        companyId={companyId}
        item={dialogItem === "new" || dialogItem === null ? null : dialogItem}
        open={dialogItem !== null}
        onOpenChange={(open) => {
          if (!open) setDialogItem(null);
        }}
        onAddAnother={() => setDialogItem("new")}
      />
    </div>
  );
}
