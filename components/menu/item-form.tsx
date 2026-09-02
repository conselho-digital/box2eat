"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { createItem, updateItem, uploadMenuImage, type MenuItem } from "@/lib/domain/menu";
import { menuItemSchema, type MenuItemInput } from "@/lib/validations/menu";
import { itemsQueryKey } from "./hooks";
import { CategoryCombobox } from "./category-combobox";

export function ItemForm({
  companyId,
  onCreated,
}: {
  companyId: string;
  onCreated?: (item: MenuItem) => void;
}) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<MenuItemInput>({ resolver: zodResolver(menuItemSchema) });

  const mutation = useMutation({
    mutationFn: async (values: MenuItemInput) => {
      const supabase = createClient();
      const { data: created, error } = await createItem(supabase, companyId, values);
      if (error) throw error;
      if (!imageFile) return created;

      const { data: publicUrl, error: uploadError } = await uploadMenuImage(
        supabase,
        companyId,
        imageFile,
      );
      if (uploadError) throw uploadError;
      const { data: withImage, error: updateError } = await updateItem(
        supabase,
        companyId,
        created.id,
        { imageUrl: publicUrl },
      );
      if (updateError) throw updateError;
      return withImage;
    },
    onSuccess: (item) => {
      reset();
      setImageFile(null);
      setImagePreview(null);
      queryClient.invalidateQueries({ queryKey: itemsQueryKey(companyId) });
      onCreated?.(item);
    },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      className="flex flex-col gap-4"
    >
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
            ref={inputRef}
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
          <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
            Escolher foto
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="item-name">Nome do item</Label>
        <Input id="item-name" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="item-description">Descrição</Label>
        <Input id="item-description" {...register("description")} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="item-price">Preço (R$)</Label>
        <Input id="item-price" type="number" step="0.01" min="0" {...register("price")} />
        {errors.price && (
          <p className="text-sm text-destructive">{errors.price.message}</p>
        )}
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
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Adicionando…" : "Adicionar item"}
      </Button>
    </form>
  );
}
