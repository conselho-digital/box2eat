"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { updateProfile } from "@/lib/domain/account";
import { profileSchema, type ProfileInput } from "@/lib/validations/account";

export function ProfileForm({
  userId,
  fullName,
  phone,
}: {
  userId: string;
  fullName: string;
  phone: string | null;
}) {
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName, phone: phone ?? "" },
  });

  async function onSubmit(values: ProfileInput) {
    setSuccess(false);
    const supabase = createClient();
    const { error } = await updateProfile(supabase, userId, values);
    if (!error) setSuccess(true);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName">Nome completo</Label>
        <Input id="fullName" {...register("fullName")} />
        {errors.fullName && (
          <p className="text-sm text-destructive">{errors.fullName.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Telefone</Label>
        <Input id="phone" placeholder="(11) 91234-5678" {...register("phone")} />
      </div>
      {success && <p className="text-sm text-primary">Perfil atualizado.</p>}
      <Button type="submit" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? "Salvando…" : "Salvar"}
      </Button>
    </form>
  );
}
