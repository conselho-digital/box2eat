"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { requestRecoveryLogin } from "@/lib/domain/auth";
import { emailSchema, type EmailInput } from "@/lib/validations/account";

export function RecoveryLoginForm() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailInput>({ resolver: zodResolver(emailSchema) });

  async function onSubmit(values: EmailInput) {
    const supabase = createClient();
    await requestRecoveryLogin(supabase, values.email);
    setSent(true);
  }

  if (sent) {
    return (
      <p className="text-sm text-muted-foreground">
        Se esse e-mail estiver cadastrado como e-mail de recuperação de alguma conta, enviamos um
        link para entrar. Confira sua caixa de entrada (e o spam).
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="recovery-email">E-mail de recuperação</Label>
        <Input id="recovery-email" type="email" autoComplete="email" {...register("email")} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enviando…" : "Enviar link de acesso"}
      </Button>
    </form>
  );
}
