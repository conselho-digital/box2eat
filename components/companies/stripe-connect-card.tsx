"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { createStripeConnectOnboardingLink } from "@/lib/domain/payments";

export function StripeConnectCard({
  companyId,
  chargesEnabled,
  hasAccount,
}: {
  companyId: string;
  chargesEnabled: boolean;
  hasAccount: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function connect() {
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { url } = await createStripeConnectOnboardingLink(supabase, companyId);
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível iniciar a conexão com o Stripe.");
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Stripe (cartão)</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {chargesEnabled ? (
          <p className="text-sm text-primary">Conta conectada — já é possível receber por cartão via Stripe.</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {hasAccount
                ? "Sua conexão com o Stripe ainda não foi concluída."
                : "Ainda não conectado. Sem isso, o pagamento por cartão via Stripe fica indisponível para essa empresa (Pix/cartão via Mercado Pago continuam funcionando normalmente)."}
            </p>
            <Button type="button" onClick={connect} disabled={loading} className="w-fit">
              {loading ? "Redirecionando…" : hasAccount ? "Concluir conexão" : "Conectar Stripe"}
            </Button>
          </>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
