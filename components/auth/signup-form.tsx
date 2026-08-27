"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { signUpWithEmailOtp, verifyEmailOtp } from "@/lib/domain/auth";
import {
  signUpIdentifierSchema,
  otpCodeSchema,
  type SignUpIdentifierInput,
  type OtpCodeInput,
} from "@/lib/validations/auth";

function isEmail(value: string) {
  return value.includes("@");
}

export function SignUpForm() {
  const router = useRouter();
  const [step, setStep] = useState<"identifier" | "code">("identifier");
  const [email, setEmail] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const identifierForm = useForm<SignUpIdentifierInput>({
    resolver: zodResolver(signUpIdentifierSchema),
  });
  const codeForm = useForm<OtpCodeInput>({ resolver: zodResolver(otpCodeSchema) });

  async function onSubmitIdentifier(values: SignUpIdentifierInput) {
    setFormError(null);
    const identifier = values.identifier.trim();

    if (!isEmail(identifier)) {
      setFormError(
        "Cadastro por telefone chega em breve — por enquanto, use seu e-mail.",
      );
      return;
    }

    const supabase = createClient();
    const { error } = await signUpWithEmailOtp(supabase, values.fullName, identifier);
    if (error) {
      setFormError("Não foi possível enviar o código. Tente novamente.");
      return;
    }
    setEmail(identifier);
    setStep("code");
  }

  async function onSubmitCode(values: OtpCodeInput) {
    if (!email) return;
    setFormError(null);
    const supabase = createClient();
    const { error } = await verifyEmailOtp(supabase, email, values.code);
    if (error) {
      setFormError("Código inválido ou expirado.");
      return;
    }
    router.push("/conta");
    router.refresh();
  }

  if (step === "code" && email) {
    return (
      <form
        onSubmit={codeForm.handleSubmit(onSubmitCode)}
        className="flex flex-col gap-4"
      >
        <p className="text-sm text-muted-foreground">
          Enviamos um código de 6 dígitos para <span className="font-medium">{email}</span>.
        </p>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="code">Código</Label>
          <Input
            id="code"
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            {...codeForm.register("code")}
          />
          {codeForm.formState.errors.code && (
            <p className="text-sm text-destructive">{codeForm.formState.errors.code.message}</p>
          )}
        </div>
        {formError && <p className="text-sm text-destructive">{formError}</p>}
        <Button type="submit" disabled={codeForm.formState.isSubmitting}>
          {codeForm.formState.isSubmitting ? "Confirmando…" : "Confirmar"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setStep("identifier")}>
          Usar outro e-mail
        </Button>
      </form>
    );
  }

  return (
    <form
      onSubmit={identifierForm.handleSubmit(onSubmitIdentifier)}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName">Nome completo</Label>
        <Input id="fullName" autoComplete="name" {...identifierForm.register("fullName")} />
        {identifierForm.formState.errors.fullName && (
          <p className="text-sm text-destructive">
            {identifierForm.formState.errors.fullName.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="identifier">E-mail ou telefone</Label>
        <Input
          id="identifier"
          autoComplete="email"
          placeholder="voce@email.com"
          {...identifierForm.register("identifier")}
        />
        {identifierForm.formState.errors.identifier && (
          <p className="text-sm text-destructive">
            {identifierForm.formState.errors.identifier.message}
          </p>
        )}
      </div>
      {formError && <p className="text-sm text-destructive">{formError}</p>}
      <Button type="submit" disabled={identifierForm.formState.isSubmitting}>
        {identifierForm.formState.isSubmitting ? "Enviando código…" : "Criar conta"}
      </Button>
    </form>
  );
}
