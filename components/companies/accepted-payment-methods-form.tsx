"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { updateAcceptedPaymentMethods } from "@/lib/domain/companies";
import {
  ACCEPTED_PAYMENT_METHODS,
  ACCEPTED_METHOD_LABEL,
  type AcceptedPaymentMethod,
} from "@/lib/domain/payment-methods";

export function AcceptedPaymentMethodsForm({
  companyId,
  initialMethods,
}: {
  companyId: string;
  initialMethods: string[];
}) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Set<AcceptedPaymentMethod>>(
    () => new Set(initialMethods.filter((m): m is AcceptedPaymentMethod =>
      (ACCEPTED_PAYMENT_METHODS as readonly string[]).includes(m),
    )),
  );

  const saveMutation = useMutation({
    mutationFn: async (methods: AcceptedPaymentMethod[]) => {
      const supabase = createClient();
      const { error } = await updateAcceptedPaymentMethods(supabase, companyId, methods);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company", companyId] });
    },
  });

  function toggle(method: AcceptedPaymentMethod) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(method)) next.delete(method);
      else next.add(method);
      return next;
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Formas de pagamento aceitas</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Escolha quais formas de pagamento seus clientes podem usar no checkout.
        </p>
        <div className="flex flex-col gap-2">
          {ACCEPTED_PAYMENT_METHODS.map((method) => (
            <label key={method} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.has(method)}
                onChange={() => toggle(method)}
              />
              {ACCEPTED_METHOD_LABEL[method]}
            </label>
          ))}
        </div>
        <Button
          type="button"
          size="sm"
          className="w-fit"
          disabled={saveMutation.isPending}
          onClick={() => saveMutation.mutate([...selected])}
        >
          {saveMutation.isPending ? "Salvando…" : "Salvar"}
        </Button>
        {saveMutation.isSuccess && <p className="text-sm text-primary">Salvo.</p>}
        {saveMutation.isError && (
          <p className="text-sm text-destructive">Não foi possível salvar. Tente de novo.</p>
        )}
      </CardContent>
    </Card>
  );
}
