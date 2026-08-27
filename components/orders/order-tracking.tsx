"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  cancelOrder,
  getOrder,
  subscribeToOrder,
  type OrderWithItems,
} from "@/lib/domain/orders";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const STATUS_STEPS = [
  { key: "placed", label: "Pedido feito" },
  { key: "accepted", label: "Aceito pela empresa" },
  { key: "preparing", label: "Em preparo" },
  { key: "ready_for_pickup", label: "Pronto" },
  { key: "delivered", label: "Entregue" },
];

export function OrderTracking({
  orderId,
  initialOrder,
  isCustomer,
}: {
  orderId: string;
  initialOrder: OrderWithItems;
  isCustomer: boolean;
}) {
  const queryClient = useQueryClient();
  const queryKey = ["order", orderId];

  const { data: order } = useQuery({
    queryKey,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await getOrder(supabase, orderId);
      if (error) throw error;
      return data;
    },
    initialData: initialOrder,
  });

  useEffect(() => {
    const supabase = createClient();
    return subscribeToOrder(supabase, orderId, () => {
      queryClient.invalidateQueries({ queryKey });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- queryKey is stable per orderId
  }, [orderId]);

  const [cancelError, setCancelError] = useState<string | null>(null);
  const cancelMutation = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const { error } = await cancelOrder(supabase, orderId, "Cancelado pelo cliente");
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: (error: Error) => setCancelError(error.message),
  });

  if (!order) return null;

  const isRejectedOrCancelled = order.status === "rejected" || order.status === "cancelled";
  const canCancel = isCustomer && ["placed", "accepted"].includes(order.status);
  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">{order.companies.name}</h1>
        <p className="text-sm text-muted-foreground">
          Pedido feito em {new Date(order.created_at).toLocaleString("pt-BR")}
        </p>
      </div>

      {isRejectedOrCancelled ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          Pedido {order.status === "rejected" ? "recusado pela empresa" : "cancelado"}.
        </p>
      ) : (
        <ol className="flex flex-col gap-2">
          {STATUS_STEPS.map((step, i) => (
            <li
              key={step.key}
              className={`flex items-center gap-2 text-sm ${
                i <= currentStepIndex ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <span
                className={`size-2 rounded-full ${
                  i <= currentStepIndex ? "bg-primary" : "bg-muted"
                }`}
              />
              {step.label}
            </li>
          ))}
        </ol>
      )}

      <div className="flex flex-col divide-y rounded-lg border">
        {order.order_items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 text-sm">
            <span>
              {item.quantity}× {item.item_name}
            </span>
            <span className="text-muted-foreground">{currency.format(item.subtotal)}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{currency.format(order.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Entrega</span>
          <span>{currency.format(order.delivery_fee)}</span>
        </div>
        <div className="flex justify-between font-medium">
          <span>Total</span>
          <span>{currency.format(order.total)}</span>
        </div>
      </div>

      {canCancel && (
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            onClick={() => cancelMutation.mutate()}
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending ? "Cancelando…" : "Cancelar pedido"}
          </Button>
          {cancelError && <p className="text-sm text-destructive">{cancelError}</p>}
        </div>
      )}
    </div>
  );
}
