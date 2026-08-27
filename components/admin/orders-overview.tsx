"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { listAllOrders } from "@/lib/domain/admin";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Aguardando pagamento",
  placed: "Pedido feito",
  accepted: "Aceito",
  rejected: "Recusado",
  preparing: "Em preparo",
  ready_for_pickup: "Pronto",
  assigned: "Entregador a caminho",
  picked_up: "Saiu para entrega",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

export function OrdersOverview() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await listAllOrders(supabase);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>;

  if (!orders || orders.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum pedido ainda.</p>;
  }

  return (
    <div className="flex flex-col divide-y rounded-lg border">
      {orders.map((order) => (
        <div key={order.id} className="flex items-center justify-between gap-2 p-3 text-sm">
          <div>
            <p className="font-medium">
              {order.companies.name} · {order.profiles.full_name || "Cliente"}
            </p>
            <p className="text-xs text-muted-foreground">
              {dateFormat.format(new Date(order.created_at))} ·{" "}
              {STATUS_LABEL[order.status] ?? order.status}
            </p>
          </div>
          <span className="font-medium">{currency.format(order.total)}</span>
        </div>
      ))}
    </div>
  );
}
