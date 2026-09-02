"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { updateItem, type MenuItem } from "@/lib/domain/menu";
import { menuItemSchema, type MenuItemInput } from "@/lib/validations/menu";
import { itemsQueryKey } from "./hooks";
import { CategoryCombobox } from "./category-combobox";

export function ItemEditForm({
  item,
  companyId,
  onSaved,
}: {
  item: MenuItem;
  companyId: string;
  onSaved?: () => void;
}) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<MenuItemInput>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: item.name,
      description: item.description ?? "",
      price: item.price,
      categoryName: item.menu_categories?.name ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: MenuItemInput) => {
      const supabase = createClient();
      const { error } = await updateItem(supabase, companyId, item.id, values);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-item", item.id] });
      queryClient.invalidateQueries({ queryKey: itemsQueryKey(companyId) });
      onSaved?.();
    },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-name">Nome</Label>
        <Input id="edit-name" {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-description">Descrição</Label>
        <Input id="edit-description" {...register("description")} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-price">Preço (R$)</Label>
        <Input id="edit-price" type="number" step="0.01" min="0" {...register("price")} />
        {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-category">Categoria</Label>
        <Controller
          name="categoryName"
          control={control}
          render={({ field }) => (
            <CategoryCombobox
              id="edit-category"
              companyId={companyId}
              value={field.value ?? ""}
              onChange={field.onChange}
            />
          )}
        />
      </div>
      <Button type="submit" disabled={mutation.isPending || !isDirty} className="w-fit">
        {mutation.isPending ? "Salvando…" : "Salvar alterações"}
      </Button>
    </form>
  );
}
