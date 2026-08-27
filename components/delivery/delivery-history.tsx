"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { listMyDeliveryHistory } from "@/lib/domain/delivery";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" });

export function DeliveryHistory({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["delivery-history", userId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await listMyDeliveryHistory(supabase, userId);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>;

  if (!data || data.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma entrega concluída ainda.</p>;
  }

  return (
    <div className="flex flex-col divide-y rounded-lg border">
      {data.map((order) => (
        <div key={order.id} className="flex items-center justify-between p-3 text-sm">
          <div>
            <p className="font-medium">{order.companies.name}</p>
            <p className="text-xs text-muted-foreground">
              {order.delivered_at ? dateFormat.format(new Date(order.delivered_at)) : ""}
            </p>
          </div>
          <span>{currency.format(order.total)}</span>
        </div>
      ))}
    </div>
  );
}
