"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { updatePassword } from "@/lib/domain/account";
import { passwordSchema, type PasswordInput } from "@/lib/validations/account";

export function PasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordInput>({ resolver: zodResolver(passwordSchema) });

  async function onSubmit(values: PasswordInput) {
    setMessage(null);
    setError(null);
    const supabase = createClient();
    const { error } = await updatePassword(supabase, values.password);
    if (error) {
      setError(error.message);
      return;
    }
    reset();
    setMessage("Senha atualizada.");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new-password">Nova senha</Label>
        <Input id="new-password" type="password" autoComplete="new-password" {...register("password")} />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>
      {message && <p className="text-sm text-primary">{message}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? "Salvando…" : "Trocar senha"}
      </Button>
    </form>
  );
}
