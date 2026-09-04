"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { connectAsaasAccount } from "@/lib/domain/payments";
import { asaasOnboardingSchema, type AsaasOnboardingInput } from "@/lib/validations/payments";

/** Shared by the restaurant's Recebimentos tab and the courier's own
 *  settings — same Asaas subconta creation flow, no OAuth redirect: the
 *  KYC data is submitted directly and the account is created right away. */
export function AsaasConnectForm({
  entityType,
  entityId,
  connected,
  title,
  description,
}: {
  entityType: "company" | "delivery_partner";
  entityId: string;
  connected: boolean;
  title: string;
  description: string;
}) {
  const [isConnected, setIsConnected] = useState(connected);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AsaasOnboardingInput>({ resolver: zodResolver(asaasOnboardingSchema) });

  const connectMutation = useMutation({
    mutationFn: async (input: AsaasOnboardingInput) => {
      const supabase = createClient();
      return connectAsaasAccount(supabase, entityType, entityId, input);
    },
    onSuccess: () => setIsConnected(true),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isConnected ? (
          <p className="text-sm text-primary">Conta conectada.</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">{description}</p>
            <form
              onSubmit={handleSubmit((values) => connectMutation.mutate(values))}
              className="flex flex-col gap-3"
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="asaas-name">Nome completo ou razão social</Label>
                <Input id="asaas-name" {...register("name")} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="asaas-email">E-mail</Label>
                <Input id="asaas-email" type="email" {...register("email")} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="asaas-cpfCnpj">CPF ou CNPJ (só números)</Label>
                <Input id="asaas-cpfCnpj" inputMode="numeric" {...register("cpfCnpj")} />
                {errors.cpfCnpj && (
                  <p className="text-sm text-destructive">{errors.cpfCnpj.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="asaas-mobilePhone">Celular com DDD (só números)</Label>
                <Input id="asaas-mobilePhone" inputMode="numeric" {...register("mobilePhone")} />
                {errors.mobilePhone && (
                  <p className="text-sm text-destructive">{errors.mobilePhone.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="asaas-incomeValue">Faturamento/renda mensal (R$)</Label>
                <Input
                  id="asaas-incomeValue"
                  type="number"
                  min={0}
                  step="0.01"
                  {...register("incomeValue")}
                />
                {errors.incomeValue && (
                  <p className="text-sm text-destructive">{errors.incomeValue.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 flex flex-col gap-1.5 sm:col-span-1">
                  <Label htmlFor="asaas-address">Endereço</Label>
                  <Input id="asaas-address" {...register("address")} />
                  {errors.address && (
                    <p className="text-sm text-destructive">{errors.address.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="asaas-addressNumber">Número</Label>
                  <Input id="asaas-addressNumber" {...register("addressNumber")} />
                  {errors.addressNumber && (
                    <p className="text-sm text-destructive">{errors.addressNumber.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="asaas-province">Bairro</Label>
                  <Input id="asaas-province" {...register("province")} />
                  {errors.province && (
                    <p className="text-sm text-destructive">{errors.province.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="asaas-postalCode">CEP (só números)</Label>
                  <Input id="asaas-postalCode" inputMode="numeric" {...register("postalCode")} />
                  {errors.postalCode && (
                    <p className="text-sm text-destructive">{errors.postalCode.message}</p>
                  )}
                </div>
              </div>

              <Button type="submit" disabled={connectMutation.isPending} className="w-fit">
                {connectMutation.isPending ? "Conectando…" : "Conectar conta"}
              </Button>
              {connectMutation.isError && (
                <p className="text-sm text-destructive">
                  {connectMutation.error instanceof Error
                    ? connectMutation.error.message
                    : "Não foi possível conectar. Tente de novo."}
                </p>
              )}
            </form>
          </>
        )}
      </CardContent>
    </Card>
  );
}
