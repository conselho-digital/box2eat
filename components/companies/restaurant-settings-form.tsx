"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { isSlugAvailable, updateCompanySettings } from "@/lib/domain/companies";
import { FOOD_CATEGORIES } from "@/lib/domain/categories";
import {
  updateCompanySettingsSchema,
  type UpdateCompanySettingsInput,
} from "@/lib/validations/company";

export function RestaurantSettingsForm({
  companyId,
  initial,
}: {
  companyId: string;
  initial: {
    name: string;
    slug: string;
    phone: string | null;
    category: string | null;
  };
}) {
  const [slugValue, setSlugValue] = useState(initial.slug);
  const [slugCheck, setSlugCheck] = useState<{
    slug: string;
    status: "checking" | "available" | "taken";
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateCompanySettingsInput>({
    resolver: zodResolver(updateCompanySettingsSchema),
    defaultValues: {
      name: initial.name,
      slug: initial.slug,
      phone: initial.phone ?? "",
      category: (initial.category as UpdateCompanySettingsInput["category"]) ?? undefined,
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (input: UpdateCompanySettingsInput) => {
      const supabase = createClient();
      const { error } = await updateCompanySettings(supabase, companyId, input);
      if (error) throw error;
    },
  });

  async function checkSlug(slug: string) {
    const trimmed = slug.trim().toLowerCase();
    if (!trimmed || trimmed === initial.slug) {
      setSlugCheck(null);
      return;
    }
    setSlugCheck({ slug: trimmed, status: "checking" });
    const supabase = createClient();
    const { available } = await isSlugAvailable(supabase, trimmed, companyId);
    setSlugCheck({ slug: trimmed, status: available ? "available" : "taken" });
  }

  // Stale once the field changes again after a check — re-blur to refresh.
  const slugStatus =
    slugCheck && slugCheck.slug === slugValue.trim().toLowerCase() ? slugCheck.status : "idle";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Dados do restaurante</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nome do restaurante</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="slug">URL</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">box2eat.com/</span>
              <Input
                id="slug"
                {...register("slug", {
                  onChange: (e) => setSlugValue(e.target.value),
                  onBlur: (e) => checkSlug(e.target.value),
                })}
              />
            </div>
            {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
            {!errors.slug && slugStatus === "checking" && (
              <p className="text-sm text-muted-foreground">Verificando…</p>
            )}
            {!errors.slug && slugStatus === "available" && (
              <p className="text-sm text-primary">URL disponível.</p>
            )}
            {!errors.slug && slugStatus === "taken" && (
              <p className="text-sm text-destructive">Essa URL já está em uso.</p>
            )}
            {!errors.slug && slugStatus === "idle" && slugValue !== initial.slug && (
              <p className="text-sm text-muted-foreground">Saia do campo para verificar disponibilidade.</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" {...register("phone")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category">Categoria</Label>
            <select
              id="category"
              {...register("category")}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="">Selecione…</option>
              {FOOD_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            disabled={saveMutation.isPending || slugStatus === "taken" || slugStatus === "checking"}
            className="w-fit"
          >
            {saveMutation.isPending ? "Salvando…" : "Salvar"}
          </Button>
          {saveMutation.isSuccess && <p className="text-sm text-primary">Salvo.</p>}
          {saveMutation.isError && (
            <p className="text-sm text-destructive">Não foi possível salvar. Tente de novo.</p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
