"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import {
  findDeliveryPartnerByEmail,
  getCompanyDeliveryPreference,
  getDeliveryPartnerName,
  setCompanyDeliveryPreference,
  type DeliveryPreference,
} from "@/lib/domain/delivery";

const OPTIONS: { value: DeliveryPreference; label: string; description: string }[] = [
  {
    value: "platform",
    label: "Buscar entregador na plataforma",
    description: "Qualquer entregador online pode aceitar o pedido assim que ele ficar pronto.",
  },
  {
    value: "preferred",
    label: "Entregador de preferência",
    description: "Sempre notifica o entregador escolhido abaixo quando um pedido fica pronto.",
  },
  {
    value: "ask",
    label: "Perguntar a cada pedido",
    description:
      "Você decide, pedido a pedido, se notifica o entregador de preferência ou deixa disponível na plataforma.",
  },
];

export function deliveryPreferenceQueryKey(companyId: string) {
  return ["company-delivery-preference", companyId];
}

export function DeliveryPreferenceSettings({ companyId }: { companyId: string }) {
  const queryClient = useQueryClient();
  const queryKey = deliveryPreferenceQueryKey(companyId);
  const [email, setEmail] = useState("");
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const { data } = useQuery({
    queryKey,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await getCompanyDeliveryPreference(supabase, companyId);
      if (error) throw error;
      return data;
    },
  });

  const { data: preferredName } = useQuery({
    queryKey: ["delivery-partner-name", data?.preferred_delivery_partner_id],
    queryFn: async () => {
      const supabase = createClient();
      const { data: name, error } = await getDeliveryPartnerName(
        supabase,
        data!.preferred_delivery_partner_id!,
      );
      if (error) throw error;
      return name;
    },
    enabled: !!data?.preferred_delivery_partner_id,
  });

  const saveMode = useMutation({
    mutationFn: async (deliveryPreference: DeliveryPreference) => {
      const supabase = createClient();
      const { error } = await setCompanyDeliveryPreference(supabase, companyId, {
        deliveryPreference,
        preferredDeliveryPartnerId: data?.preferred_delivery_partner_id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const lookupAndSave = useMutation({
    mutationFn: async () => {
      setLookupError(null);
      const supabase = createClient();
      const { data: matches, error } = await findDeliveryPartnerByEmail(supabase, email.trim());
      if (error) throw error;
      const match = matches?.[0];
      if (!match) {
        setLookupError("Nenhum entregador aprovado encontrado com esse e-mail.");
        return;
      }
      const { error: saveError } = await setCompanyDeliveryPreference(supabase, companyId, {
        deliveryPreference: (data?.delivery_preference as DeliveryPreference) ?? "preferred",
        preferredDeliveryPartnerId: match.user_id,
      });
      if (saveError) throw saveError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setEmail("");
    },
  });

  if (!data) return null;

  const currentOption = OPTIONS.find((o) => o.value === data.delivery_preference);

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center justify-between text-left"
      >
        <div>
          <h2 className="font-medium">Preferência de entrega</h2>
          <p className="text-xs text-muted-foreground">
            {currentOption?.label}
            {preferredName && ` · ${preferredName}`}
          </p>
        </div>
        <span className="text-xs text-muted-foreground">{expanded ? "Fechar" : "Alterar"}</span>
      </button>

      {expanded && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            {OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-start gap-2 text-sm">
                <input
                  type="radio"
                  name="delivery-preference"
                  className="mt-0.5"
                  checked={data.delivery_preference === opt.value}
                  onChange={() => saveMode.mutate(opt.value)}
                />
                <span>
                  <span className="font-medium">{opt.label}</span>
                  <span className="block text-xs text-muted-foreground">{opt.description}</span>
                </span>
              </label>
            ))}
          </div>

          {(data.delivery_preference === "preferred" || data.delivery_preference === "ask") && (
            <div className="flex flex-col gap-1.5 border-t pt-3">
              <label htmlFor="preferred-partner-email" className="text-xs text-muted-foreground">
                E-mail do entregador de preferência
              </label>
              <div className="flex gap-2">
                <Input
                  id="preferred-partner-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={preferredName ? `Atual: ${preferredName}` : "email@exemplo.com"}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={!email.trim() || lookupAndSave.isPending}
                  onClick={() => lookupAndSave.mutate()}
                >
                  {lookupAndSave.isPending ? "Buscando…" : "Definir"}
                </Button>
              </div>
              {lookupError && <p className="text-xs text-destructive">{lookupError}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
