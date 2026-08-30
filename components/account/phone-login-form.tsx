"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { requestPhoneVerification, verifyPhoneChange } from "@/lib/domain/auth";
import { toE164BR } from "@/lib/domain/phone";
import {
  phoneVerificationSchema,
  otpCodeSchema,
  type PhoneVerificationInput,
  type OtpCodeInput,
} from "@/lib/validations/auth";

export function PhoneLoginForm({
  initialPhone,
  initialConfirmed,
}: {
  initialPhone: string | null;
  initialConfirmed: boolean;
}) {
  const [confirmedPhone, setConfirmedPhone] = useState(
    initialConfirmed ? initialPhone : null,
  );
  const [step, setStep] = useState<"view" | "phone" | "code">(
    initialConfirmed ? "view" : "phone",
  );
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const phoneForm = useForm<PhoneVerificationInput>({
    resolver: zodResolver(phoneVerificationSchema),
  });
  const codeForm = useForm<OtpCodeInput>({ resolver: zodResolver(otpCodeSchema) });

  async function onSubmitPhone(values: PhoneVerificationInput) {
    setFormError(null);
    const e164 = toE164BR(values.phone);
    if (!e164) {
      setFormError("Informe um telefone válido, com DDD.");
      return;
    }
    const supabase = createClient();
    const { error } = await requestPhoneVerification(supabase, e164);
    if (error) {
      setFormError("Não foi possível enviar o código. Tente novamente.");
      return;
    }
    setPendingPhone(e164);
    setStep("code");
  }

  async function onSubmitCode(values: OtpCodeInput) {
    if (!pendingPhone) return;
    setFormError(null);
    const supabase = createClient();
    const { error } = await verifyPhoneChange(supabase, pendingPhone, values.code);
    if (error) {
      setFormError("Código inválido ou expirado.");
      return;
    }
    setConfirmedPhone(pendingPhone);
    setPendingPhone(null);
    setStep("view");
  }

  if (step === "view" && confirmedPhone) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-primary">Telefone verificado: {confirmedPhone}</p>
        <p className="text-sm text-muted-foreground">
          Você já pode entrar com telefone e senha, além de e-mail e senha.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => setStep("phone")}
        >
          Trocar número
        </Button>
      </div>
    );
  }

  if (step === "code" && pendingPhone) {
    return (
      <form onSubmit={codeForm.handleSubmit(onSubmitCode)} className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Enviamos um código de 6 dígitos por WhatsApp para{" "}
          <span className="font-medium">{pendingPhone}</span>.
        </p>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone-code">Código</Label>
          <Input
            id="phone-code"
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
        <div className="flex gap-2">
          <Button type="submit" disabled={codeForm.formState.isSubmitting}>
            {codeForm.formState.isSubmitting ? "Confirmando…" : "Confirmar"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setStep("phone")}>
            Usar outro número
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={phoneForm.handleSubmit(onSubmitPhone)} className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Verifique um telefone para poder entrar também com telefone e senha, sem precisar do
        e-mail.
      </p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="login-phone">Telefone</Label>
        <Input id="login-phone" placeholder="(11) 91234-5678" {...phoneForm.register("phone")} />
        {phoneForm.formState.errors.phone && (
          <p className="text-sm text-destructive">{phoneForm.formState.errors.phone.message}</p>
        )}
      </div>
      {formError && <p className="text-sm text-destructive">{formError}</p>}
      <Button type="submit" disabled={phoneForm.formState.isSubmitting} className="w-fit">
        {phoneForm.formState.isSubmitting ? "Enviando código…" : "Enviar código por WhatsApp"}
      </Button>
    </form>
  );
}
