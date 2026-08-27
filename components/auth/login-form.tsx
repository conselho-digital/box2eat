"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { signInWithPassword } from "@/lib/domain/auth";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { MfaChallengeForm } from "./mfa-challenge-form";

export function LoginForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setFormError(null);
    const supabase = createClient();
    const { error } = await signInWithPassword(supabase, values.email, values.password);
    if (error) {
      setFormError("E-mail ou senha inválidos.");
      return;
    }

    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== aal.nextLevel) {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const factor = factors?.totp.find((f) => f.status === "verified");
      if (factor) {
        setMfaFactorId(factor.id);
        return;
      }
    }

    router.push("/conta");
    router.refresh();
  }

  if (mfaFactorId) {
    return <MfaChallengeForm factorId={mfaFactorId} />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>
      {formError && <p className="text-sm text-destructive">{formError}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
