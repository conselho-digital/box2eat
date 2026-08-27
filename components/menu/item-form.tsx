"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { createItem } from "@/lib/domain/menu";
import { menuItemSchema, type MenuItemInput } from "@/lib/validations/menu";
import { itemsQueryKey, useCategories } from "./hooks";

export function ItemForm({
  companyId,
  onCreated,
}: {
  companyId: string;
  onCreated?: () => void;
}) {
  const queryClient = useQueryClient();
  const { data: categories } = useCategories(companyId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MenuItemInput>({ resolver: zodResolver(menuItemSchema) });

  const mutation = useMutation({
    mutationFn: async (values: MenuItemInput) => {
      const supabase = createClient();
      const { error } = await createItem(supabase, companyId, values);
      if (error) throw error;
    },
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: itemsQueryKey(companyId) });
      onCreated?.();
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
        <select
          id="item-category"
          className="h-8 rounded-lg border border-border bg-background px-2.5 text-sm"
          {...register("categoryId")}
        >
          <option value="">Sem categoria</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Adicionando…" : "Adicionar item"}
      </Button>
    </form>
  );
}
