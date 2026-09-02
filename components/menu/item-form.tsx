"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { createItem, type MenuItem } from "@/lib/domain/menu";
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
      const { data, error } = await createItem(supabase, companyId, values);
      if (error) throw error;
      return data;
    },
    onSuccess: (item) => {
      reset();
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
