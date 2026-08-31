"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { updateFullName } from "@/lib/domain/account";

const nameSchema = z.object({
  fullName: z.string().trim().min(2, "Informe seu nome completo"),
});

type NameInput = z.infer<typeof nameSchema>;

export function NameForm({
  userId,
  fullName,
  onSaved,
}: {
  userId: string;
  fullName: string;
  onSaved: (fullName: string) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NameInput>({
    resolver: zodResolver(nameSchema),
    defaultValues: { fullName },
  });

  async function onSubmit(values: NameInput) {
    setError(null);
    const supabase = createClient();
    const { error } = await updateFullName(supabase, userId, values.fullName);
    if (error) {
      setError("Não foi possível salvar. Tente novamente.");
      return;
    }
    onSaved(values.fullName);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="personal-fullName">Nome completo</Label>
        <Input id="personal-fullName" {...register("fullName")} />
        {errors.fullName && (
          <p className="text-sm text-destructive">{errors.fullName.message}</p>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? "Salvando…" : "Salvar"}
      </Button>
    </form>
  );
}
