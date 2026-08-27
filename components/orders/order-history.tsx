"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { groupOrdersByCompany, listMyOrders } from "@/lib/domain/orders";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" });

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Aguardando pagamento",
  placed: "Pedido feito",
  accepted: "Aceito",
  rejected: "Recusado",
  preparing: "Em preparo",
  ready_for_pickup: "Pronto para retirada",
  assigned: "Entregador a caminho",
  picked_up: "Saiu para entrega",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

export function OrderHistory() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await listMyOrders(supabase);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>;

  const groups = groupOrdersByCompany(data ?? []);

  if (groups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Você ainda não fez nenhum pedido.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {groups.map(({ company, orders }) => (
        <details key={company.id} className="rounded-lg border">
          <summary className="cursor-pointer list-none p-3 font-medium marker:content-none">
            <span className="flex items-center justify-between">
              {company.name}
              <span className="text-sm font-normal text-muted-foreground">
                {orders.length} pedido{orders.length > 1 ? "s" : ""}
              </span>
            </span>
          </summary>
          <div className="flex flex-col divide-y border-t">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/pedidos/${order.id}`}
                className="flex flex-col gap-1 p-3 text-sm hover:bg-muted/50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {dateFormat.format(new Date(order.created_at))}
                  </span>
                  <span className="font-medium">{currency.format(order.total)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {STATUS_LABEL[order.status] ?? order.status}
                </p>
                <ul className="mt-1 flex flex-col gap-0.5">
                  {order.order_items.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <span>
                        {item.quantity}× {item.item_name}
                      </span>
                      <span className="text-muted-foreground">
                        {currency.format(item.subtotal)}
                      </span>
                    </li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
