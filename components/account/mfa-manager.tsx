"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import {
  enrollMfa,
  listMfaFactors,
  unenrollMfa,
  verifyMfaEnrollment,
} from "@/lib/domain/account";
import { mfaCodeSchema, type MfaCodeInput } from "@/lib/validations/account";

const FACTORS_QUERY_KEY = ["mfa-factors"];

export function MfaManager() {
  const queryClient = useQueryClient();
  const { data: factors } = useQuery({
    queryKey: FACTORS_QUERY_KEY,
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await listMfaFactors(supabase);
      return data?.totp ?? [];
    },
  });
  const [enrollment, setEnrollment] = useState<{
    factorId: string;
    qrCode: string;
    secret: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    queryClient.invalidateQueries({ queryKey: FACTORS_QUERY_KEY });
  }

  async function startEnrollment() {
    setError(null);
    const supabase = createClient();
    const { data, error } = await enrollMfa(supabase);
    if (error) {
      setError(error.message);
      return;
    }
    setEnrollment({
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
    });
  }

  async function cancelEnrollment() {
    if (enrollment) {
      const supabase = createClient();
      await unenrollMfa(supabase, enrollment.factorId);
    }
    setEnrollment(null);
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MfaCodeInput>({ resolver: zodResolver(mfaCodeSchema) });

  async function onVerify(values: MfaCodeInput) {
    if (!enrollment) return;
    setError(null);
    const supabase = createClient();
    const { error } = await verifyMfaEnrollment(supabase, enrollment.factorId, values.code);
    if (error) {
      setError("Código inválido. Tente novamente.");
      return;
    }
    setEnrollment(null);
    refresh();
  }

  async function remove(factorId: string) {
    const supabase = createClient();
    await unenrollMfa(supabase, factorId);
    refresh();
  }

  const hasVerifiedFactor = factors?.some((f) => f.status === "verified");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-medium">Autenticação de dois fatores</h2>
        <p className="text-sm text-muted-foreground">
          Protege sua conta exigindo um código do seu app autenticador (Google
          Authenticator, Authy, etc.) ao entrar.
        </p>
      </div>

      {factors?.filter((f) => f.status === "verified").map((factor) => (
        <div key={factor.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
          <span>{factor.friendly_name || "App autenticador"} — ativo</span>
          <Button size="sm" variant="ghost" onClick={() => remove(factor.id)}>
            Desativar
          </Button>
        </div>
      ))}

      {!hasVerifiedFactor && !enrollment && (
        <Button variant="outline" className="w-fit" onClick={startEnrollment}>
          Ativar autenticação de dois fatores
        </Button>
      )}

      {enrollment && (
        <div className="flex flex-col gap-4 rounded-lg border p-4">
          <p className="text-sm">
            Escaneie o QR code com seu app autenticador, ou insira a chave manualmente:
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element -- data: URI SVG from Supabase, not a Next-optimizable asset */}
          <img src={enrollment.qrCode} alt="QR code para configurar 2FA" className="size-40" />
          <p className="break-all font-mono text-xs text-muted-foreground">{enrollment.secret}</p>
          <form onSubmit={handleSubmit(onVerify)} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="enroll-code">Código de 6 dígitos</Label>
              <Input id="enroll-code" inputMode="numeric" maxLength={6} {...register("code")} />
              {errors.code && (
                <p className="text-sm text-destructive">{errors.code.message}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Confirmando…" : "Confirmar e ativar"}
              </Button>
              <Button type="button" variant="ghost" onClick={cancelEnrollment}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
