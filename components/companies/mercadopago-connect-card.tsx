"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { createMercadoPagoConnectOnboardingLink } from "@/lib/domain/payments";

export function MercadoPagoConnectCard({
  companyId,
  connected,
}: {
  companyId: string;
  connected: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function connect() {
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { url } = await createMercadoPagoConnectOnboardingLink(supabase, companyId);
      window.location.href = url;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível iniciar a conexão com o Mercado Pago.",
      );
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Mercado Pago</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {connected ? (
          <p className="text-sm text-primary">Conta conectada.</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Conecte sua conta Mercado Pago para receber Pix e cartão via Mercado Pago
              diretamente. Sem conexão, esses pagamentos continuam funcionando pela conta da
              plataforma.
            </p>
            <Button type="button" onClick={connect} disabled={loading} className="w-fit">
              {loading ? "Redirecionando…" : "Conectar Mercado Pago"}
            </Button>
          </>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
