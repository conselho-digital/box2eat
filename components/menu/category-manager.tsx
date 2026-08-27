"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { createCategory, deleteCategory } from "@/lib/domain/menu";
import { categorySchema, type CategoryInput } from "@/lib/validations/menu";
import { categoriesQueryKey, useCategories } from "./hooks";

export function CategoryManager({ companyId }: { companyId: string }) {
  const queryClient = useQueryClient();
  const queryKey = categoriesQueryKey(companyId);

  const { data: categories } = useCategories(companyId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryInput>({ resolver: zodResolver(categorySchema) });

  const createMutation = useMutation({
    mutationFn: async (values: CategoryInput) => {
      const supabase = createClient();
      const { error } = await createCategory(supabase, companyId, values);
      if (error) throw error;
    },
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const supabase = createClient();
      const { error } = await deleteCategory(supabase, categoryId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const [showForm, setShowForm] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">Categorias</h2>
        <Button size="sm" variant="outline" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancelar" : "Nova categoria"}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit((values) => createMutation.mutate(values))}
          className="flex gap-2"
        >
          <Input placeholder="Ex: Lanches" {...register("name")} />
          <Button type="submit" disabled={createMutation.isPending}>
            Adicionar
          </Button>
        </form>
      )}
      {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}

      <div className="flex flex-wrap gap-2">
        {categories?.map((category) => (
          <span
            key={category.id}
            className="flex items-center gap-1 rounded-full border px-3 py-1 text-sm"
          >
            {category.name}
            <button
              type="button"
              aria-label={`Remover categoria ${category.name}`}
              className="text-muted-foreground hover:text-destructive"
              onClick={() => deleteMutation.mutate(category.id)}
            >
              ×
            </button>
          </span>
        ))}
        {categories?.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma categoria ainda.</p>
        )}
      </div>
    </div>
  );
}
