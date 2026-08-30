"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { signInWithPassword } from "@/lib/domain/auth";
import { loginSchema, isEmailIdentifier, type LoginInput } from "@/lib/validations/auth";
import { MfaChallengeForm } from "./mfa-challenge-form";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/conta";
  const [formError, setFormError] = useState<string | null>(null);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setFormError(null);

    if (!isEmailIdentifier(values.identifier)) {
      setFormError("Login por telefone chega em breve — por enquanto, use seu e-mail.");
      return;
    }

    const supabase = createClient();
    const { error } = await signInWithPassword(supabase, values.identifier, values.password);
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

    router.push(next);
    router.refresh();
  }

  if (mfaFactorId) {
    return <MfaChallengeForm factorId={mfaFactorId} next={next} />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="identifier">E-mail ou telefone</Label>
        <Input id="identifier" autoComplete="username" {...register("identifier")} />
        {errors.identifier && (
          <p className="text-sm text-destructive">{errors.identifier.message}</p>
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
      <Link
        href="/recuperar-acesso"
        className="text-sm text-muted-foreground underline underline-offset-4"
      >
        Esqueceu a senha ou perdeu acesso à conta?
      </Link>
      {formError && <p className="text-sm text-destructive">{formError}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
