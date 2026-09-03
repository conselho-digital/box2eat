"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  acceptOrder,
  isActiveOrder,
  listCompanyOrders,
  markDelivered,
  markPreparing,
  markReady,
  rejectOrder,
  subscribeToCompanyOrders,
  type CompanyOrder,
} from "@/lib/domain/orders";
import { getCompanyDeliveryPreference, notifyPreferredDeliveryPartner } from "@/lib/domain/delivery";
import {
  DeliveryPreferenceSettings,
  deliveryPreferenceQueryKey,
} from "./delivery-preference-settings";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const timeFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

const STATUS_LABEL: Record<string, string> = {
  placed: "Novo pedido",
  accepted: "Aceito",
  preparing: "Em preparo",
  ready_for_pickup: "Pronto",
  delivered: "Entregue",
  rejected: "Recusado",
  cancelled: "Cancelado",
};

export function CompanyOrderQueue({ companyId }: { companyId: string }) {
  const queryClient = useQueryClient();
  const queryKey = ["company-orders", companyId];

  const { data: orders, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await listCompanyOrders(supabase, companyId);
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const supabase = createClient();
    return subscribeToCompanyOrders(supabase, companyId, () => {
      queryClient.invalidateQueries({ queryKey });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- queryKey is stable per companyId
  }, [companyId]);

  const { data: deliverySettings } = useQuery({
    queryKey: deliveryPreferenceQueryKey(companyId),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await getCompanyDeliveryPreference(supabase, companyId);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>;

  const active = (orders ?? []).filter((o) => isActiveOrder(o.status));
  const history = (orders ?? []).filter((o) => !isActiveOrder(o.status));

  return (
    <div className="flex flex-col gap-8">
      <DeliveryPreferenceSettings companyId={companyId} />

      <div className="flex flex-col gap-3">
        <h2 className="font-medium">Pedidos em andamento</h2>
        {active.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum pedido no momento.</p>
        )}
        {active.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            queryKey={queryKey}
            askDeliveryPreference={deliverySettings?.delivery_preference === "ask"}
          />
        ))}
      </div>

      {history.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-medium">Histórico</h2>
          {history.map((order) => (
            <OrderCard key={order.id} order={order} queryKey={queryKey} readOnly />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({
  order,
  queryKey,
  readOnly,
  askDeliveryPreference,
}: {
  order: CompanyOrder;
  queryKey: unknown[];
  readOnly?: boolean;
  askDeliveryPreference?: boolean;
}) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  function makeMutation(fn: (supabase: ReturnType<typeof createClient>) => Promise<{ error: unknown }>) {
    return async () => {
      setError(null);
      const supabase = createClient();
      const { error } = await fn(supabase);
      if (error) {
        setError(error instanceof Error ? error.message : "Não foi possível atualizar o pedido.");
        return;
      }
      queryClient.invalidateQueries({ queryKey });
    };
  }

  const accept = useMutation({ mutationFn: makeMutation((s) => acceptOrder(s, order.id)) });
  const reject = useMutation({
    mutationFn: makeMutation((s) => rejectOrder(s, order.id, window.prompt("Motivo (opcional):") || undefined)),
  });
  const preparing = useMutation({ mutationFn: makeMutation((s) => markPreparing(s, order.id)) });
  const ready = useMutation({ mutationFn: makeMutation((s) => markReady(s, order.id)) });
  const delivered = useMutation({ mutationFn: makeMutation((s) => markDelivered(s, order.id)) });
  const notifyPreferred = useMutation({
    mutationFn: makeMutation((s) => notifyPreferredDeliveryPartner(s, order.id)),
  });

  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{order.profiles.full_name || "Cliente"}</p>
          <p className="text-xs text-muted-foreground">
            {timeFormat.format(new Date(order.created_at))} · {STATUS_LABEL[order.status] ?? order.status}
          </p>
        </div>
        <p className="font-medium">{currency.format(order.total)}</p>
      </div>

      <ul className="mt-2 flex flex-col gap-0.5 text-sm text-muted-foreground">
        {order.order_items.map((item) => (
          <li key={item.id}>
            {item.quantity}× {item.item_name}
          </li>
        ))}
      </ul>
      {order.notes && <p className="mt-1 text-xs text-muted-foreground">Obs: {order.notes}</p>}
      {order.delivery_partners && (
        <p className="mt-1 text-xs text-muted-foreground">
          Entregador: {order.delivery_partners.vehicle_type}
          {order.delivery_partners.vehicle_plate && ` · ${order.delivery_partners.vehicle_plate}`}
        </p>
      )}

      {!readOnly && (
        <div className="mt-3 flex flex-wrap gap-2">
          {order.status === "placed" && (
            <>
              <Button size="sm" onClick={() => accept.mutate()} disabled={accept.isPending}>
                Aceitar
              </Button>
              <Button size="sm" variant="outline" onClick={() => reject.mutate()} disabled={reject.isPending}>
                Recusar
              </Button>
            </>
          )}
          {order.status === "accepted" && (
            <Button size="sm" onClick={() => preparing.mutate()} disabled={preparing.isPending}>
              Iniciar preparo
            </Button>
          )}
          {order.status === "preparing" && (
            <Button size="sm" onClick={() => ready.mutate()} disabled={ready.isPending}>
              Marcar pronto
            </Button>
          )}
          {order.status === "ready_for_pickup" && (
            <>
              <Button size="sm" onClick={() => delivered.mutate()} disabled={delivered.isPending}>
                Marcar entregue
              </Button>
              {askDeliveryPreference && !order.delivery_partner_id && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => notifyPreferred.mutate()}
                  disabled={notifyPreferred.isPending || notifyPreferred.isSuccess}
                >
                  {notifyPreferred.isSuccess
                    ? "Entregador notificado"
                    : notifyPreferred.isPending
                      ? "Notificando…"
                      : "Notificar entregador de preferência"}
                </Button>
              )}
            </>
          )}
        </div>
      )}
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}
