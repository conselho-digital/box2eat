"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import {
  createItem,
  updateItem,
  deleteItem,
  getItem,
  uploadMenuImage,
  setItemAddons,
  setItemAddonCategories,
  type MenuItem,
} from "@/lib/domain/menu";
import { menuItemSchema, type MenuItemInput } from "@/lib/validations/menu";
import { itemsQueryKey, useCategories, useMenuItems } from "./hooks";
import { CategoryCombobox } from "./category-combobox";
import { ItemAddonPicker, type AddonGroupDraft } from "./item-addon-picker";

function groupsFromItem(item: MenuItem | null): AddonGroupDraft[] {
  if (!item) return [];
  return item.menu_item_addon_categories.map((g) => ({
    key: g.id,
    categoryId: g.category_id,
    minSelect: g.min_select,
  }));
}

function selectedAddonsFromItem(item: MenuItem | null): Set<string> {
  return new Set(item?.menu_item_addons.map((a) => a.addon_item_id) ?? []);
}

export function ItemDialog({
  companyId,
  item,
  open,
  onOpenChange,
  onItemCreated,
}: {
  companyId: string;
  /** null means "create a new item" instead of editing one. */
  item: MenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called right after a new item is created, so the caller can switch
   *  this same dialog into edit mode for it. */
  onItemCreated?: (item: MenuItem) => void;
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: categories } = useCategories(companyId);
  const { data: items } = useMenuItems(companyId);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(item?.image_url ?? null);
  const [localAvailable, setLocalAvailable] = useState(item?.is_available ?? true);
  const [localShowAsAddon, setLocalShowAsAddon] = useState(item?.show_as_addon ?? true);
  const [addonGroups, setAddonGroups] = useState<AddonGroupDraft[]>(() => groupsFromItem(item));
  const [selectedAddonIds, setSelectedAddonIds] = useState<Set<string>>(() =>
    selectedAddonsFromItem(item),
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<MenuItemInput>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: item?.name ?? "",
      description: item?.description ?? "",
      price: item?.price,
      categoryName: item?.menu_categories?.name ?? "",
    },
  });

  function addGroup() {
    setAddonGroups((prev) => [{ key: crypto.randomUUID(), categoryId: "", minSelect: 0 }, ...prev]);
  }

  function setGroupCategory(key: string, categoryId: string) {
    setAddonGroups((prev) => prev.map((g) => (g.key === key ? { ...g, categoryId } : g)));
  }

  function setGroupMinSelect(key: string, minSelect: number) {
    setAddonGroups((prev) => prev.map((g) => (g.key === key ? { ...g, minSelect } : g)));
  }

  function removeGroup(key: string) {
    const group = addonGroups.find((g) => g.key === key);
    setAddonGroups((prev) => prev.filter((g) => g.key !== key));
    if (group?.categoryId) {
      const idsInCategory = new Set(
        (items ?? [])
          .filter((i) => i.category_id === group.categoryId)
          .map((i) => i.id),
      );
      setSelectedAddonIds((prev) => new Set([...prev].filter((id) => !idsInCategory.has(id))));
    }
  }

  function toggleAddon(itemId: string) {
    setSelectedAddonIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  const saveMutation = useMutation({
    mutationFn: async (values: MenuItemInput) => {
      const supabase = createClient();
      let savedId: string;

      if (item) {
        const { data, error } = await updateItem(supabase, companyId, item.id, {
          ...values,
          isAvailable: localAvailable,
          showAsAddon: localShowAsAddon,
        });
        if (error) throw error;
        savedId = data.id;
      } else {
        const { data: created, error } = await createItem(supabase, companyId, values);
        if (error) throw error;
        savedId = created.id;
        if (!localAvailable || !localShowAsAddon) {
          const { error: flagsError } = await updateItem(supabase, companyId, savedId, {
            isAvailable: localAvailable,
            showAsAddon: localShowAsAddon,
          });
          if (flagsError) throw flagsError;
        }
      }

      if (imageFile) {
        const { data: publicUrl, error: uploadError } = await uploadMenuImage(
          supabase,
          companyId,
          imageFile,
        );
        if (uploadError) throw uploadError;
        const { error: imageError } = await updateItem(supabase, companyId, savedId, {
          imageUrl: publicUrl,
        });
        if (imageError) throw imageError;
      }

      const { error: addonsError } = await setItemAddons(supabase, savedId, [...selectedAddonIds]);
      if (addonsError) throw addonsError;

      const validGroups = addonGroups.filter((g) => g.categoryId);
      const { error: categoriesError } = await setItemAddonCategories(
        supabase,
        savedId,
        validGroups.map((g) => ({ categoryId: g.categoryId, minSelect: g.minSelect })),
      );
      if (categoriesError) throw categoriesError;

      const { data: finalItem, error: fetchError } = await getItem(supabase, savedId);
      if (fetchError) throw fetchError;
      return { savedItem: finalItem, wasCreate: !item };
    },
    onSuccess: ({ savedItem, wasCreate }) => {
      queryClient.invalidateQueries({ queryKey: itemsQueryKey(companyId) });
      queryClient.invalidateQueries({ queryKey: ["menu-item", savedItem.id] });
      if (wasCreate) onItemCreated?.(savedItem);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!item) return;
      const supabase = createClient();
      const { error } = await deleteItem(supabase, item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemsQueryKey(companyId) });
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md" showCloseButton={false}>
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            disabled={saveMutation.isPending}
            onClick={handleSubmit((values) => saveMutation.mutate(values))}
          >
            {saveMutation.isPending ? "Salvando…" : "Salvar"}
          </Button>
          <DialogClose render={<Button variant="ghost" size="icon-sm" />}>
            <XIcon />
            <span className="sr-only">Fechar</span>
          </DialogClose>
        </div>

        <DialogHeader>
          <DialogTitle>{item ? "Editar item" : "Novo item"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Foto</Label>
            <div className="flex items-center gap-3">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt=""
                  width={64}
                  height={64}
                  unoptimized
                  className="size-16 rounded-lg object-cover"
                />
              ) : (
                <div className="flex size-16 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground">
                  Sem foto
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? "Trocar foto" : "Escolher foto"}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="item-name">Nome do item</Label>
            <Input id="item-name" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="item-description">Descrição</Label>
            <Input id="item-description" {...register("description")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="item-price">Preço (R$)</Label>
            <Input id="item-price" type="number" step="0.01" min="0" {...register("price")} />
            {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="item-category">Categoria</Label>
            <Controller
              name="categoryName"
              control={control}
              render={({ field }) => (
                <CategoryCombobox
                  id="item-category"
                  companyId={companyId}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="flex items-center gap-4 border-t pt-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={localAvailable}
                onChange={(e) => setLocalAvailable(e.target.checked)}
              />
              Item
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={localShowAsAddon}
                onChange={(e) => setLocalShowAsAddon(e.target.checked)}
              />
              Adicional
            </label>
            {item && (
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="ml-auto"
                onClick={() => {
                  if (window.confirm(`Excluir "${item.name}"?`)) deleteMutation.mutate();
                }}
              >
                Excluir item
              </Button>
            )}
          </div>

          <Separator />
          <ItemAddonPicker
            categories={categories ?? []}
            items={items ?? []}
            excludeItemId={item?.id}
            groups={addonGroups}
            onAddGroup={addGroup}
            onSetGroupCategory={setGroupCategory}
            onSetGroupMinSelect={setGroupMinSelect}
            onRemoveGroup={removeGroup}
            selectedAddonIds={selectedAddonIds}
            onToggleAddon={toggleAddon}
          />

          {saveMutation.isError && (
            <p className="text-sm text-destructive">Não foi possível salvar. Tente de novo.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
