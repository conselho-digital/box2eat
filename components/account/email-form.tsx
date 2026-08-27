"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { updateEmail } from "@/lib/domain/account";
import { emailSchema, type EmailInput } from "@/lib/validations/account";

export function EmailForm({ currentEmail }: { currentEmail: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailInput>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: currentEmail },
  });

  async function onSubmit(values: EmailInput) {
    setMessage(null);
    setError(null);
    const supabase = createClient();
    const { error } = await updateEmail(supabase, values.email);
    if (error) {
      setError(error.message);
      return;
    }
    setMessage(
      "Enviamos um link de confirmação para o novo e-mail. Ele só passa a valer depois de confirmado.",
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        Esse é o e-mail usado para login e para recuperação de senha.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="account-email">E-mail de recuperação</Label>
          <Input id="account-email" type="email" {...register("email")} />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
        {message && <p className="text-sm text-primary">{message}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={isSubmitting} className="w-fit">
          {isSubmitting ? "Enviando…" : "Atualizar e-mail"}
        </Button>
      </form>
    </div>
  );
}
