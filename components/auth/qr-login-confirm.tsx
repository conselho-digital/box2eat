"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { confirmQrLogin } from "@/lib/domain/qr-login";

export function QrLoginConfirm({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "confirming" | "done" | "error">("idle");

  async function handleConfirm() {
    setState("confirming");
    try {
      const supabase = createClient();
      await confirmQrLogin(supabase, token);
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Conectar novo dispositivo</CardTitle>
        <CardDescription>
          Alguém está tentando entrar na sua conta Box2eat a partir de outro
          dispositivo. Confirme só se foi você.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state === "done" ? (
          <p className="text-sm text-primary">
            Dispositivo conectado! Você já pode fechar esta página.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <Button type="button" onClick={handleConfirm} disabled={state === "confirming"}>
              {state === "confirming" ? "Conectando…" : "Confirmar login"}
            </Button>
            {state === "error" && (
              <p className="text-sm text-destructive">
                Não foi possível confirmar — o código pode ter expirado.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
