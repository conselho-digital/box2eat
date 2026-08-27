"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { mfaCodeSchema, type MfaCodeInput } from "@/lib/validations/account";

export function MfaChallengeForm({ factorId }: { factorId: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MfaCodeInput>({ resolver: zodResolver(mfaCodeSchema) });

  async function onSubmit(values: MfaCodeInput) {
    setFormError(null);
    const supabase = createClient();
    const { data: challenge, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) {
      setFormError(challengeError.message);
      return;
    }
    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: values.code,
    });
    if (error) {
      setFormError("Código inválido. Tente novamente.");
      return;
    }
    router.push("/conta");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Digite o código de 6 dígitos do seu app autenticador.
      </p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="mfa-code">Código</Label>
        <Input
          id="mfa-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          {...register("code")}
        />
        {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
      </div>
      {formError && <p className="text-sm text-destructive">{formError}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Verificando…" : "Confirmar"}
      </Button>
    </form>
  );
}
