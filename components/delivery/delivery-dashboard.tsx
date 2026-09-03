"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  claimOrder,
  getMyDeliveryPartner,
  listAvailableOrders,
  listMyActiveDeliveries,
  setOnline,
  updateLocation,
  type AvailableOrder,
} from "@/lib/domain/delivery";
import { markDelivered, subscribeToDeliveryUpdates } from "@/lib/domain/orders";
import { formatDeliveryAddress } from "@/lib/domain/checkout";
import { buildGoogleMapsDirectionsUrl } from "@/lib/geo";
import { PreferredPartnerRequests } from "./preferred-partner-requests";
import { OrderChat } from "../orders/order-chat";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function DeliveryDashboard({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const partnerKey = ["delivery-partner", userId];
  const availableKey = ["available-orders"];
  const activeKey = ["my-active-deliveries", userId];

  const { data: partner } = useQuery({
    queryKey: partnerKey,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await getMyDeliveryPartner(supabase, userId);
      if (error) throw error;
      return data;
    },
  });

  const { data: available } = useQuery({
    queryKey: availableKey,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await listAvailableOrders(supabase);
      if (error) throw error;
      return data;
    },
    enabled: Boolean(partner?.is_online),
  });

  const { data: active } = useQuery({
    queryKey: activeKey,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await listMyActiveDeliveries(supabase, userId);
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const supabase = createClient();
    return subscribeToDeliveryUpdates(supabase, userId, () => {
      queryClient.invalidateQueries({ queryKey: availableKey });
      queryClient.invalidateQueries({ queryKey: activeKey });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keys are stable
  }, [userId]);

  const toggleOnline = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const { error } = await setOnline(supabase, userId, !partner?.is_online);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: partnerKey }),
  });

  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  function updateMyLocation() {
    if (!navigator.geolocation) {
      setLocationMessage("Geolocalização não disponível neste navegador.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const supabase = createClient();
        await updateLocation(supabase, userId, position.coords.latitude, position.coords.longitude);
        setLocationMessage("Localização atualizada.");
        queryClient.invalidateQueries({ queryKey: partnerKey });
      },
      () => setLocationMessage("Não foi possível obter sua localização."),
    );
  }

  const claim = useMutation({
    mutationFn: async (orderId: string) => {
      const supabase = createClient();
      const { error } = await claimOrder(supabase, orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: availableKey });
      queryClient.invalidateQueries({ queryKey: activeKey });
    },
  });

  const deliver = useMutation({
    mutationFn: async (orderId: string) => {
      const supabase = createClient();
      const { error } = await markDelivered(supabase, orderId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: activeKey }),
  });

  if (!partner || partner.status !== "approved") {
    return (
      <p className="text-sm text-muted-foreground">
        Seu cadastro ainda não foi aprovado. Acompanhe o status na aba Cadastro.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <PreferredPartnerRequests userId={userId} />

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <p className="font-medium">{partner.is_online ? "Você está online" : "Você está offline"}</p>
          {locationMessage && <p className="text-xs text-muted-foreground">{locationMessage}</p>}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={updateMyLocation}>
            Atualizar localização
          </Button>
          <Button size="sm" onClick={() => toggleOnline.mutate()} disabled={toggleOnline.isPending}>
            {partner.is_online ? "Ficar offline" : "Ficar online"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-medium">Minhas entregas</h2>
        {(!active || active.length === 0) && (
          <p className="text-sm text-muted-foreground">Nenhuma entrega em andamento.</p>
        )}
        {active?.map((order) => (
          <div key={order.id} className="rounded-lg border p-3 text-sm">
            <p className="font-medium">{order.companies.name}</p>
            <p className="text-xs text-muted-foreground">
              {order.companies.street}, {order.companies.city}
            </p>
            <p className="mt-1">{currency.format(order.total)}</p>
            <div className="mt-2 flex flex-col gap-2">
              {order.status === "assigned" && (
                <>
                  <p className="rounded-md border border-dashed p-2 text-sm">
                    Mostre este código ao restaurante para confirmar a coleta:{" "}
                    <span className="font-mono text-base font-semibold">{order.pickup_code}</span>
                  </p>
                  <OrderChat
                    orderId={order.id}
                    thread="restaurant_courier"
                    currentUserId={userId}
                    title="Chat com o restaurante"
                  />
                </>
              )}
              {order.status === "picked_up" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    render={
                      <a
                        href={buildGoogleMapsDirectionsUrl(
                          order.delivery_lat !== null && order.delivery_lng !== null
                            ? { lat: order.delivery_lat, lng: order.delivery_lng }
                            : {
                                address: formatDeliveryAddress(
                                  (order.delivery_address ?? {}) as Record<string, string | null>,
                                ),
                              },
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                    nativeButton={false}
                  >
                    Rota até o cliente
                  </Button>
                  <Button size="sm" onClick={() => deliver.mutate(order.id)} disabled={deliver.isPending}>
                    Marcar entregue
                  </Button>
                  <OrderChat
                    orderId={order.id}
                    thread="courier_customer"
                    currentUserId={userId}
                    title="Chat com o cliente"
                  />
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {partner.is_online && (
        <div className="flex flex-col gap-3">
          <h2 className="font-medium">Entregas disponíveis</h2>
          {(!available || available.length === 0) && (
            <p className="text-sm text-muted-foreground">Nenhuma entrega disponível agora.</p>
          )}
          {available?.map((order: AvailableOrder) => (
            <div key={order.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <div>
                <p className="font-medium">{order.companies.name}</p>
                <p className="text-xs text-muted-foreground">
                  {order.companies.street}, {order.companies.city}
                </p>
              </div>
              <Button size="sm" onClick={() => claim.mutate(order.id)} disabled={claim.isPending}>
                Aceitar
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
