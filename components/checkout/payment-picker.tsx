"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { createMercadoPagoCheckout, createStripeCheckout } from "@/lib/domain/payments";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function PaymentPicker({
  orderId,
  companyName,
  total,
  stripeEnabled,
}: {
  orderId: string;
  companyName: string;
  total: number;
  stripeEnabled: boolean;
}) {
  const [loading, setLoading] = useState<"mercadopago" | "stripe" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function pay(provider: "mercadopago" | "stripe") {
    setError(null);
    setLoading(provider);
    try {
      const supabase = createClient();
      const { url } =
        provider === "mercadopago"
          ? await createMercadoPagoCheckout(supabase, orderId)
          : await createStripeCheckout(supabase, orderId);
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível iniciar o pagamento.");
      setLoading(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pagamento</CardTitle>
        <CardDescription>
          Pedido em {companyName} · {currency.format(total)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button type="button" onClick={() => pay("mercadopago")} disabled={loading !== null}>
          {loading === "mercadopago" ? "Redirecionando…" : "Pagar com Pix ou cartão (Mercado Pago)"}
        </Button>
        {stripeEnabled && (
          <Button
            type="button"
            variant="outline"
            onClick={() => pay("stripe")}
            disabled={loading !== null}
          >
            {loading === "stripe" ? "Redirecionando…" : "Pagar com cartão (Stripe)"}
          </Button>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
