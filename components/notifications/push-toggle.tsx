"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { getPushSubscriptionStatus, subscribeToPush, unsubscribeFromPush } from "@/lib/domain/push";

const STATUS_QUERY_KEY = ["push-subscription-status"];

export function PushToggle({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: status } = useQuery({
    queryKey: STATUS_QUERY_KEY,
    queryFn: getPushSubscriptionStatus,
  });

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      await subscribeToPush(supabase, userId);
    },
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: STATUS_QUERY_KEY });
    },
    onError: (err: Error) => setError(err.message),
  });

  const unsubscribeMutation = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      await unsubscribeFromPush(supabase);
    },
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: STATUS_QUERY_KEY });
    },
    onError: (err: Error) => setError(err.message),
  });

  if (status === "unsupported") {
    return (
      <p className="text-sm text-muted-foreground">
        Seu navegador não suporta notificações push.
      </p>
    );
  }

  if (status === "denied") {
    return (
      <p className="text-sm text-muted-foreground">
        Notificações bloqueadas para este site. Habilite nas configurações do navegador para ativar.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {status === "subscribed" ? (
        <Button
          variant="outline"
          className="w-fit"
          onClick={() => unsubscribeMutation.mutate()}
          disabled={unsubscribeMutation.isPending}
        >
          {unsubscribeMutation.isPending ? "Desativando…" : "Desativar notificações push"}
        </Button>
      ) : (
        <Button
          variant="outline"
          className="w-fit"
          onClick={() => subscribeMutation.mutate()}
          disabled={subscribeMutation.isPending}
        >
          {subscribeMutation.isPending ? "Ativando…" : "Ativar notificações push"}
        </Button>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
