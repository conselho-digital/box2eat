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
import { createAsaasCheckout } from "@/lib/domain/payments";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function PaymentPicker({
  orderId,
  companyName,
  total,
}: {
  orderId: string;
  companyName: string;
  total: number;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { url } = await createAsaasCheckout(supabase, orderId);
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível iniciar o pagamento.");
      setLoading(false);
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
        <Button type="button" onClick={pay} disabled={loading}>
          {loading ? "Redirecionando…" : "Pagar com Pix ou cartão"}
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
