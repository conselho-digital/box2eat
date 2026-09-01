"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { connectWhatsApp, getWhatsAppStatus } from "@/lib/domain/whatsapp";

const STATE_LABEL: Record<string, string> = {
  open: "Conectado",
  close: "Desconectado",
  connecting: "Conectando…",
};

export function WhatsAppConnect() {
  const queryClient = useQueryClient();
  const queryKey = ["admin-whatsapp-status"];
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    data: status,
    isLoading,
    error: statusError,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const supabase = createClient();
      return getWhatsAppStatus(supabase);
    },
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      return connectWhatsApp(supabase);
    },
    onMutate: () => setErrorMessage(null),
    onError: (error: Error) => setErrorMessage(error.message),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const state = status?.instance?.state;
  const isConnected = state === "open";
  const qr = mutation.data;

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-medium">WhatsApp oficial da plataforma</p>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Verificando status…"
              : statusError
                ? (statusError as Error).message
                : (STATE_LABEL[state ?? ""] ?? "Status desconhecido")}
          </p>
        </div>
        <Button
          size="sm"
          variant={isConnected ? "outline" : "default"}
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          {isConnected ? "Reconectar" : "Conectar WhatsApp"}
        </Button>
      </div>

      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

      {qr?.base64 && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Escaneie o QR code no WhatsApp do número oficial: Configurações → Aparelhos conectados →
            Conectar um aparelho.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element -- data URI from Evolution API, not an optimizable asset */}
          <img src={qr.base64} alt="QR code para conectar o WhatsApp" className="size-56 rounded-lg border" />
        </div>
      )}
      {qr?.pairingCode && !qr?.base64 && (
        <p className="text-sm">
          Código de pareamento: <span className="font-mono font-medium">{qr.pairingCode}</span>
        </p>
      )}
    </div>
  );
}
