"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toE164BR } from "@/lib/domain/phone";
import {
  phoneVerificationSchema,
  otpCodeSchema,
  type PhoneVerificationInput,
  type OtpCodeInput,
} from "@/lib/validations/auth";

/**
 * "Esqueci a senha e não tenho acesso ao e-mail" path: logs in via a WhatsApp
 * OTP sent to the phone number already verified for login (Conta >
 * Segurança), then flags the account so the global "cadastre uma nova senha"
 * modal (MustSetPasswordDialog) shows up right after.
 */
export function PhoneRecoveryForm() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "code">("phone");
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
    const { error } = await supabase.auth.signInWithOtp({
      phone: e164,
      options: { shouldCreateUser: false },
    });
    if (error) {
      setFormError("Não foi possível enviar o código. Verifique o número e tente novamente.");
      return;
    }
    setPendingPhone(e164);
    setStep("code");
  }

  async function onSubmitCode(values: OtpCodeInput) {
    if (!pendingPhone) return;
    setFormError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      phone: pendingPhone,
      token: values.code,
      type: "sms",
    });
    if (error) {
      setFormError("Código inválido ou expirado.");
      return;
    }
    await supabase.auth.updateUser({ data: { must_set_password: true } });
    router.push("/conta");
    router.refresh();
  }

  if (step === "code" && pendingPhone) {
    return (
      <form onSubmit={codeForm.handleSubmit(onSubmitCode)} className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Enviamos um código de 6 dígitos por WhatsApp para{" "}
          <span className="font-medium">{pendingPhone}</span>.
        </p>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="recovery-phone-code">Código</Label>
          <Input
            id="recovery-phone-code"
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
            {codeForm.formState.isSubmitting ? "Confirmando…" : "Entrar"}
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
        Informe o telefone já verificado para login na sua conta. Vamos te enviar um código por
        WhatsApp.
      </p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="recovery-phone">Telefone</Label>
        <Input
          id="recovery-phone"
          placeholder="(11) 91234-5678"
          {...phoneForm.register("phone")}
        />
        {phoneForm.formState.errors.phone && (
          <p className="text-sm text-destructive">{phoneForm.formState.errors.phone.message}</p>
        )}
      </div>
      {formError && <p className="text-sm text-destructive">{formError}</p>}
      <Button type="submit" disabled={phoneForm.formState.isSubmitting}>
        {phoneForm.formState.isSubmitting ? "Enviando…" : "Enviar código por WhatsApp"}
      </Button>
    </form>
  );
}
