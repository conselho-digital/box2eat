"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InfoIcon, PlusIcon, Trash2Icon, XIcon, ZoomInIcon } from "lucide-react";
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
  setItemImages,
  MAX_ITEM_PHOTOS,
  type MenuItem,
  type PromotionType,
} from "@/lib/domain/menu";
import { setPromotedMenuItemBanner, clearPromotedMenuItemBanner } from "@/lib/domain/companies";
import { menuItemSchema, type MenuItemInput } from "@/lib/validations/menu";
import { itemsQueryKey, useCategories, useMenuItems } from "./hooks";
import { CategoryCombobox } from "./category-combobox";
import { ItemAddonPicker, type AddonGroupDraft } from "./item-addon-picker";
import { PhotoLightbox } from "./photo-lightbox";
import { useCloseOnBack } from "@/components/hooks/use-close-on-back";

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

/** Existing (already-uploaded) photos or newly staged files, in display
 *  order — the first one is the item's cover photo (menu_items.image_url). */
type PhotoDraft =
  | { key: string; kind: "existing"; url: string }
  | { key: string; kind: "new"; file: File; previewUrl: string };

function photosFromItem(item: MenuItem | null): PhotoDraft[] {
  if (!item) return [];
  const urls: string[] = [];
  if (item.image_url) urls.push(item.image_url);
  urls.push(
    ...item.menu_item_images
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((i) => i.url),
  );
  return urls.map((url) => ({ key: crypto.randomUUID(), kind: "existing", url }));
}

export function ItemDialog({
  companyId,
  item,
  open,
  onOpenChange,
  onAddAnother,
}: {
  companyId: string;
  /** null means "create a new item" instead of editing one. */
  item: MenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after "Adicionar mais um" saves the current item, so the
   *  caller can treat this same (still-open) dialog as a fresh "new
   *  item" going forward. */
  onAddAnother?: () => void;
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: categories } = useCategories(companyId);
  const { data: items } = useMenuItems(companyId);

  const [photos, setPhotos] = useState<PhotoDraft[]>(() => photosFromItem(item));
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [localAvailable, setLocalAvailable] = useState(item?.is_available ?? true);
  const [localShowAsAddon, setLocalShowAsAddon] = useState(item?.show_as_addon ?? true);
  const [addonGroups, setAddonGroups] = useState<AddonGroupDraft[]>(() => groupsFromItem(item));
  const [selectedAddonIds, setSelectedAddonIds] = useState<Set<string>>(() =>
    selectedAddonsFromItem(item),
  );
  const [showAvailabilityInfo, setShowAvailabilityInfo] = useState(false);
  const [photoLimitNotice, setPhotoLimitNotice] = useState(false);
  const [promotionType, setPromotionType] = useState<PromotionType>(
    (item?.promotion_type as PromotionType) ?? "none",
  );
  const [bannerPhotoKey, setBannerPhotoKey] = useState<string | null>(null);
  const [promotionError, setPromotionError] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<string>(
    item?.discount_percent != null ? String(item.discount_percent) : "",
  );

  useCloseOnBack(open, () => onOpenChange(false));

  const {
    register,
    handleSubmit,
    control,
    reset,
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
    setAddonGroups((prev) => [{ key: crypto.randomUUID(), categoryId: "", minSelect: 1 }, ...prev]);
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

  function onPromotionChange(value: PromotionType) {
    setPromotionType(value);
    setPromotionError(null);
    if (value !== "none" && !bannerPhotoKey && photos.length > 0) {
      setBannerPhotoKey(photos[0].key);
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

  function addPhotos(files: FileList) {
    setPhotos((prev) => {
      const room = Math.max(0, MAX_ITEM_PHOTOS - prev.length);
      setPhotoLimitNotice(files.length > room);
      const drafts: PhotoDraft[] = Array.from(files)
        .slice(0, room)
        .map((file) => ({
          key: crypto.randomUUID(),
          kind: "new",
          file,
          previewUrl: URL.createObjectURL(file),
        }));
      return [...prev, ...drafts];
    });
  }

  function removePhoto(key: string) {
    setPhotos((prev) => prev.filter((p) => p.key !== key));
    setPhotoLimitNotice(false);
  }

  /** Clears the dialog back to a blank "new item" state without closing
   *  it — used after "Adicionar mais um" saves the current item. */
  function resetForCreate() {
    reset({ name: "", description: "", price: undefined, categoryName: "" });
    setPhotos([]);
    setPhotoLimitNotice(false);
    setLocalAvailable(true);
    setLocalShowAsAddon(true);
    setAddonGroups([]);
    setSelectedAddonIds(new Set());
    setPromotionType("none");
    setBannerPhotoKey(null);
    setPromotionError(null);
    setDiscountPercent("");
  }

  const saveMutation = useMutation({
    mutationFn: async ({ values, addAnother }: { values: MenuItemInput; addAnother: boolean }) => {
      const supabase = createClient();
      let savedId: string;
      const discountPercentValue = promotionType === "discount" ? Number(discountPercent) : null;

      if (item) {
        const { data, error } = await updateItem(supabase, companyId, item.id, {
          ...values,
          isAvailable: localAvailable,
          showAsAddon: localShowAsAddon,
          promotionType,
          discountPercent: discountPercentValue,
        });
        if (error) throw error;
        savedId = data.id;
      } else {
        const { data: created, error } = await createItem(supabase, companyId, values);
        if (error) throw error;
        savedId = created.id;
        if (!localAvailable || !localShowAsAddon || promotionType !== "none") {
          const { error: flagsError } = await updateItem(supabase, companyId, savedId, {
            isAvailable: localAvailable,
            showAsAddon: localShowAsAddon,
            promotionType,
            discountPercent: discountPercentValue,
          });
          if (flagsError) throw flagsError;
        }
      }

      const uploadedUrls = await Promise.all(
        photos.map(async (photo) => {
          if (photo.kind === "existing") return photo.url;
          const { data: publicUrl, error: uploadError } = await uploadMenuImage(
            supabase,
            companyId,
            photo.file,
          );
          if (uploadError) throw uploadError;
          return publicUrl;
        }),
      );
      const [coverUrl = null, ...galleryUrls] = uploadedUrls;
      const { error: imageError } = await updateItem(supabase, companyId, savedId, {
        imageUrl: coverUrl,
      });
      if (imageError) throw imageError;
      const { error: imagesError } = await setItemImages(supabase, savedId, galleryUrls);
      if (imagesError) throw imagesError;

      const bannerIndex = photos.findIndex((p) => p.key === bannerPhotoKey);
      const bannerUrl = bannerIndex >= 0 ? uploadedUrls[bannerIndex] : null;
      if (promotionType !== "none" && bannerUrl) {
        const { error: bannerError } = await setPromotedMenuItemBanner(
          supabase,
          companyId,
          savedId,
          bannerUrl,
        );
        if (bannerError) throw bannerError;
      } else if (promotionType === "none") {
        const { error: clearError } = await clearPromotedMenuItemBanner(supabase, companyId, savedId);
        if (clearError) throw clearError;
      }

      const { error: addonsError } = await setItemAddons(supabase, savedId, [...selectedAddonIds]);
      if (addonsError) throw addonsError;

      const validGroups = addonGroups.filter((g) => g.categoryId);
      // "+1 brinde" only means something if picking the free addon is
      // actually mandatory — force it even if staff left min_select at 0.
      const effectiveGroups =
        promotionType === "free_addon"
          ? validGroups.map((g) => ({ ...g, minSelect: Math.max(g.minSelect, 1) }))
          : validGroups;
      const { error: categoriesError } = await setItemAddonCategories(
        supabase,
        savedId,
        effectiveGroups.map((g) => ({ categoryId: g.categoryId, minSelect: g.minSelect })),
      );
      if (categoriesError) throw categoriesError;

      const { data: finalItem, error: fetchError } = await getItem(supabase, savedId);
      if (fetchError) throw fetchError;
      return { savedItem: finalItem, addAnother };
    },
    onSuccess: ({ savedItem, addAnother }) => {
      queryClient.invalidateQueries({ queryKey: itemsQueryKey(companyId) });
      queryClient.invalidateQueries({ queryKey: ["menu-item", savedItem.id] });
      if (addAnother) {
        resetForCreate();
        onAddAnother?.();
      } else {
        onOpenChange(false);
      }
    },
  });

  function validatePromotion(): boolean {
    if (promotionType === "none") {
      setPromotionError(null);
      return true;
    }
    if (photos.length === 0 || !bannerPhotoKey) {
      setPromotionError("Adicione uma foto para usar no banner desta promoção.");
      return false;
    }
    if (promotionType === "free_addon" && !addonGroups.some((g) => g.categoryId)) {
      setPromotionError("Adicione um opcional para o cliente escolher de graça nesta promoção.");
      return false;
    }
    if (promotionType === "discount") {
      const pct = Number(discountPercent);
      if (!discountPercent || !Number.isInteger(pct) || pct < 1 || pct > 99) {
        setPromotionError("Informe um percentual de desconto entre 1 e 99.");
        return false;
      }
    }
    setPromotionError(null);
    return true;
  }

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
          {item && (
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (window.confirm(`Excluir "${item.name}"?`)) deleteMutation.mutate();
              }}
            >
              <Trash2Icon />
              <span className="sr-only">Excluir item</span>
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={saveMutation.isPending}
            onClick={() => {
              if (!validatePromotion()) return;
              handleSubmit((values) => saveMutation.mutate({ values, addAnother: true }))();
            }}
          >
            Adicionar mais um
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={saveMutation.isPending}
            onClick={() => {
              if (!validatePromotion()) return;
              handleSubmit((values) => saveMutation.mutate({ values, addAnother: false }))();
            }}
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
            <Label>Fotos</Label>
            <p className="text-xs text-muted-foreground">Até {MAX_ITEM_PHOTOS} fotos por produto.</p>
            {photoLimitNotice && (
              <p className="text-xs text-destructive">
                Só é possível ter {MAX_ITEM_PHOTOS} fotos por produto — algumas fotos não foram
                adicionadas.
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              {photos.map((photo) => {
                const url = photo.kind === "existing" ? photo.url : photo.previewUrl;
                return (
                  <div key={photo.key} className="relative size-16 shrink-0">
                    <button
                      type="button"
                      onClick={() => setLightboxOpen(true)}
                      className="relative block size-16 overflow-hidden rounded-lg"
                    >
                      <Image
                        src={url}
                        alt=""
                        width={64}
                        height={64}
                        unoptimized
                        className="size-16 object-cover"
                      />
                      <span className="absolute right-0.5 bottom-0.5 flex size-4 items-center justify-center rounded-full bg-black/60 text-white">
                        <ZoomInIcon className="size-2.5" />
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.key)}
                      aria-label="Remover foto"
                      className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-foreground text-background"
                    >
                      <XIcon className="size-3" />
                    </button>
                  </div>
                );
              })}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) addPhotos(e.target.files);
                  e.target.value = "";
                }}
              />
              {photos.length < MAX_ITEM_PHOTOS && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Adicionar foto"
                  className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-dashed text-muted-foreground hover:bg-muted"
                >
                  <PlusIcon className="size-5" />
                </button>
              )}
            </div>
          </div>

          <PhotoLightbox
            photos={photos.map((p) => (p.kind === "existing" ? p.url : p.previewUrl))}
            open={lightboxOpen}
            onOpenChange={setLightboxOpen}
          />

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

          <div className="flex flex-col gap-1.5 border-t pt-4">
            <Label htmlFor="item-promotion">Promoção</Label>
            <select
              id="item-promotion"
              value={promotionType}
              onChange={(e) => onPromotionChange(e.target.value as PromotionType)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="none">Nenhuma</option>
              <option value="buy2_pay1">2x1 — Compre 2, pague 1</option>
              <option value="free_addon">+1 Brinde — compre e ganhe um opcional grátis</option>
              <option value="discount">Desconto — % off no preço</option>
            </select>
            {promotionType === "free_addon" && (
              <p className="text-xs text-muted-foreground">
                Adicione abaixo o opcional que o cliente vai poder escolher de graça.
              </p>
            )}
            {promotionType === "discount" && (
              <div className="flex items-center gap-2">
                <Input
                  id="item-discount-percent"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={99}
                  step={1}
                  placeholder="Ex.: 50"
                  value={discountPercent}
                  onChange={(e) => {
                    setDiscountPercent(e.target.value);
                    setPromotionError(null);
                  }}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">% de desconto</span>
              </div>
            )}
            {promotionType !== "none" && photos.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-xs text-muted-foreground">
                  Escolha a foto que vai virar o banner do restaurante enquanto esta promoção
                  estiver ativa:
                </p>
                <div className="flex flex-wrap gap-2">
                  {photos.map((photo) => {
                    const url = photo.kind === "existing" ? photo.url : photo.previewUrl;
                    return (
                      <button
                        key={photo.key}
                        type="button"
                        onClick={() => setBannerPhotoKey(photo.key)}
                        className={`relative size-16 shrink-0 overflow-hidden rounded-lg border ${
                          bannerPhotoKey === photo.key ? "ring-2 ring-primary" : ""
                        }`}
                      >
                        <Image src={url} alt="" fill unoptimized className="object-cover" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {promotionError && <p className="text-sm text-destructive">{promotionError}</p>}
          </div>

          <div className="flex flex-col gap-2 border-t pt-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setShowAvailabilityInfo((v) => !v)}
                aria-label="Sobre Item e Adicional"
                className="rounded-full p-1 text-muted-foreground hover:bg-muted"
              >
                <InfoIcon className="size-4" />
              </button>
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
            </div>
            {showAvailabilityInfo && (
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Item</strong> mostra este produto na lista do
                cardápio para os clientes comprarem diretamente.{" "}
                <strong className="text-foreground">Adicional</strong> faz ele aparecer como opção
                de &ldquo;opcional&rdquo; quando outros itens do cardápio o oferecem (ex: uma bebida
                ligada a um combo). São independentes: dá pra desmarcar um sem afetar o outro — por exemplo,
                esconder uma bebida em falta de todos os opcionais de uma vez, sem tirá-la do
                cardápio.
              </p>
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
