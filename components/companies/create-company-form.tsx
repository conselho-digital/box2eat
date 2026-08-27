"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { createCompany, describeCompanyError } from "@/lib/domain/companies";
import {
  createCompanySchema,
  type CreateCompanyInput,
} from "@/lib/validations/company";

export function CreateCompanyForm({ onCreated }: { onCreated?: () => void }) {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCompanyInput>({ resolver: zodResolver(createCompanySchema) });

  const mutation = useMutation({
    mutationFn: async (values: CreateCompanyInput) => {
      const supabase = createClient();
      const { error } = await createCompany(supabase, values);
      if (error) throw error;
    },
    onSuccess: () => {
      reset();
      setFormError(null);
      queryClient.invalidateQueries({ queryKey: ["my-companies"] });
      onCreated?.();
    },
    onError: (error: Error) => {
      setFormError(describeCompanyError(error.message));
    },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nome da empresa</Label>
        <Input id="name" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="slug">URL (ex: minha-pizzaria)</Label>
        <Input id="slug" {...register("slug")} />
        {errors.slug && (
          <p className="text-sm text-destructive">{errors.slug.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Telefone</Label>
        <Input id="phone" {...register("phone")} />
      </div>
      {formError && <p className="text-sm text-destructive">{formError}</p>}
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Criando…" : "Criar empresa"}
      </Button>
    </form>
  );
}
