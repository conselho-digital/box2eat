"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { updateRecoveryEmail } from "@/lib/domain/account";
import { recoveryEmailSchema, type RecoveryEmailInput } from "@/lib/validations/account";

export function RecoveryEmailForm({
  userId,
  recoveryEmail,
}: {
  userId: string;
  recoveryEmail: string | null;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecoveryEmailInput>({
    resolver: zodResolver(recoveryEmailSchema),
    defaultValues: { recoveryEmail: recoveryEmail ?? "" },
  });

  async function onSubmit(values: RecoveryEmailInput) {
    setMessage(null);
    setError(null);
    const supabase = createClient();
    const { error } = await updateRecoveryEmail(supabase, userId, values.recoveryEmail);
    if (error) {
      setError(error.message);
      return;
    }
    setMessage("E-mail de recuperação salvo.");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-muted-foreground">
          Esse é o e-mail que você pode usar para entrar na conta sem precisar da autenticação de dois
          fatores, caso perca acesso a ela. Se você entrar pelo link enviado a esse e-mail, vamos pedir
          que você cadastre uma nova senha antes de continuar.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="recovery-email">E-mail de recuperação</Label>
          <Input id="recovery-email" type="email" {...register("recoveryEmail")} />
          {errors.recoveryEmail && (
            <p className="text-sm text-destructive">{errors.recoveryEmail.message}</p>
          )}
        </div>
        {message && <p className="text-sm text-primary">{message}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={isSubmitting} className="w-fit">
          {isSubmitting ? "Salvando…" : "Salvar"}
        </Button>
      </form>
    </div>
  );
}
