"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, CircleMarker, Popup } from "react-leaflet";
import L, { type LatLngExpression, type LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { createClient } from "@/lib/supabase/client";
import {
  getDeliveryPartnerLocation,
  subscribeToDeliveryPartnerLocation,
} from "@/lib/domain/delivery";

const courierIcon = L.icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/** Live trip-tracking map for the customer once an order has been picked
 *  up — shows the courier's last reported position (delivery_partners is
 *  only updated when the courier taps "Atualizar localização", not a
 *  continuous stream) alongside the delivery destination. */
export function CourierTrackingMap({
  courierUserId,
  destination,
}: {
  courierUserId: string;
  destination: { lat: number; lng: number } | null;
}) {
  const queryClient = useQueryClient();
  const queryKey = ["delivery-partner-location", courierUserId];

  const { data: location } = useQuery({
    queryKey,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await getDeliveryPartnerLocation(supabase, courierUserId);
      if (error) throw error;
      return data;
    },
    refetchInterval: 15000,
  });

  useEffect(() => {
    const supabase = createClient();
    return subscribeToDeliveryPartnerLocation(supabase, courierUserId, () => {
      queryClient.invalidateQueries({ queryKey });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- queryKey is stable per courierUserId
  }, [courierUserId]);

  const courierPosition: LatLngExpression | null =
    location?.current_lat != null && location?.current_lng != null
      ? [location.current_lat, location.current_lng]
      : null;

  if (!courierPosition && !destination) {
    return (
      <p className="text-sm text-muted-foreground">
        Ainda não temos a localização do entregador.
      </p>
    );
  }

  const center = courierPosition ?? [destination!.lat, destination!.lng];
  const bounds: LatLngBoundsExpression | undefined =
    courierPosition && destination
      ? [
          [courierPosition[0] as number, courierPosition[1] as number],
          [destination.lat, destination.lng],
        ]
      : undefined;

  return (
    <div className="h-56 w-full overflow-hidden rounded-lg border">
      <MapContainer
        center={center}
        bounds={bounds}
        zoom={bounds ? undefined : 15}
        className="h-full w-full"
        zoomControl={false}
        scrollWheelZoom={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {courierPosition && (
          <Marker position={courierPosition} icon={courierIcon}>
            <Popup>Entregador</Popup>
          </Marker>
        )}
        {destination && (
          <CircleMarker
            center={[destination.lat, destination.lng]}
            radius={8}
            pathOptions={{ color: "#fff", weight: 2, fillColor: "#ea580c", fillOpacity: 1 }}
          >
            <Popup>Endereço de entrega</Popup>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  );
}
