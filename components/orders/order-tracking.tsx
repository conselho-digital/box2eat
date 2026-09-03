"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/components/reviews/review-form";
import { createClient } from "@/lib/supabase/client";
import {
  cancelOrder,
  getOrder,
  subscribeToOrder,
  type OrderWithItems,
} from "@/lib/domain/orders";
import { listReviewsForOrder } from "@/lib/domain/reviews";
import { OrderChat } from "./order-chat";

const CourierTrackingMap = dynamic(
  () => import("./courier-tracking-map").then((mod) => mod.CourierTrackingMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-56 w-full items-center justify-center rounded-lg border text-sm text-muted-foreground">
        Carregando mapa…
      </div>
    ),
  },
);

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const STATUS_STEPS = [
  { key: "placed", label: "Pedido feito" },
  { key: "accepted", label: "Aceito pelo restaurante" },
  { key: "preparing", label: "Em preparo" },
  { key: "ready_for_pickup", label: "Pronto" },
  { key: "assigned", label: "Entregador a caminho para retirada" },
  { key: "picked_up", label: "Coletado pelo entregador" },
  { key: "delivered", label: "Entregue" },
];

export function OrderTracking({
  orderId,
  initialOrder,
  isCustomer,
  userId,
}: {
  orderId: string;
  initialOrder: OrderWithItems;
  isCustomer: boolean;
  userId: string;
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

  const { data: reviews, refetch: refetchReviews } = useQuery({
    queryKey: ["order-reviews", orderId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await listReviewsForOrder(supabase, orderId);
      if (error) throw error;
      return data;
    },
    enabled: isCustomer && order?.status === "delivered",
  });

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
  const isPendingPayment = order.status === "pending_payment";
  const canCancel = isCustomer && ["pending_payment", "placed", "accepted"].includes(order.status);
  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">{order.companies.name}</h1>
        <p className="text-sm text-muted-foreground">
          Pedido feito em {new Date(order.created_at).toLocaleString("pt-BR")}
        </p>
      </div>

      {isPendingPayment ? (
        <div className="flex flex-col gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
          <p>
            {order.payment_status === "failed"
              ? "O pagamento não foi concluído."
              : "Aguardando confirmação do pagamento."}
          </p>
          {isCustomer && (
            <Button
              size="sm"
              className="w-fit"
              render={<Link href={`/checkout/pagamento/${orderId}`} />}
              nativeButton={false}
            >
              {order.payment_status === "failed" ? "Tentar pagar novamente" : "Ir para o pagamento"}
            </Button>
          )}
        </div>
      ) : isRejectedOrCancelled ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          Pedido {order.status === "rejected" ? "recusado pelo restaurante" : "cancelado"}.
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

      {isCustomer && order.delivery_partner_id && order.status === "picked_up" && (
        <CourierTrackingMap
          courierUserId={order.delivery_partner_id}
          destination={
            order.delivery_lat !== null && order.delivery_lng !== null
              ? { lat: order.delivery_lat, lng: order.delivery_lng }
              : null
          }
        />
      )}

      {isCustomer && order.delivery_partner_id && order.status === "picked_up" && order.delivery_code && (
        <p className="rounded-lg border border-dashed p-3 text-sm">
          Seu entregador está chegando! Mostre este código a ele para confirmar a entrega:{" "}
          <span className="font-mono text-base font-semibold">{order.delivery_code}</span>
        </p>
      )}

      {isCustomer &&
        order.delivery_partner_id &&
        (order.status === "picked_up" || order.status === "delivered") && (
          <OrderChat
            orderId={orderId}
            thread="courier_customer"
            currentUserId={userId}
            title="Chat com o entregador"
          />
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
        {order.discount_total > 0 && (
          <div className="flex justify-between text-primary">
            <span>Desconto</span>
            <span>-{currency.format(order.discount_total)}</span>
          </div>
        )}
        <div className="flex justify-between font-medium">
          <span>Total</span>
          <span>{currency.format(order.total)}</span>
        </div>
      </div>

      {isCustomer && !isPendingPayment && (
        <Link href={`/ajuda/pedidos/${orderId}`} className="text-sm text-primary underline underline-offset-4">
          Precisa de ajuda com esse pedido?
        </Link>
      )}

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

      {isCustomer && order.status === "delivered" && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">Avalie seu pedido</h2>
          <ReviewForm
            orderId={orderId}
            targetType="company"
            label={order.companies.name}
            existingReview={reviews?.find((r) => r.target_type === "company") ?? null}
            onSubmitted={() => refetchReviews()}
          />
          {order.delivery_partner_id && (
            <ReviewForm
              orderId={orderId}
              targetType="delivery_partner"
              label="Entregador"
              existingReview={reviews?.find((r) => r.target_type === "delivery_partner") ?? null}
              onSubmitted={() => refetchReviews()}
            />
          )}
        </div>
      )}
    </div>
  );
}
