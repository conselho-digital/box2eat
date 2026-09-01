"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import L, { type LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { PublicCompany } from "@/lib/domain/companies";

const restaurantIcon = L.icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DEFAULT_CENTER: LatLngExpression = [-23.5505, -46.6333];

export function CompanyMap({
  companies,
  initialLat,
  initialLng,
}: {
  companies: PublicCompany[];
  initialLat?: number;
  initialLng?: number;
}) {
  const [userPosition, setUserPosition] = useState<LatLngExpression | null>(
    initialLat !== undefined && initialLng !== undefined ? [initialLat, initialLng] : null,
  );
  const [locating, setLocating] = useState(
    () => userPosition === null && typeof navigator !== "undefined" && !!navigator.geolocation,
  );

  useEffect(() => {
    if (userPosition || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition([position.coords.latitude, position.coords.longitude]);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: false, timeout: 8000 },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount, only if no initial position was given
  }, []);

  const companiesWithLocation = companies.filter(
    (c): c is PublicCompany & { lat: number; lng: number } => c.lat !== null && c.lng !== null,
  );

  const center: LatLngExpression =
    userPosition ??
    (companiesWithLocation.length > 0
      ? [companiesWithLocation[0].lat, companiesWithLocation[0].lng]
      : DEFAULT_CENTER);

  return (
    <div className="relative h-full w-full">
      <MapContainer center={center} zoom={13} scrollWheelZoom attributionControl={false} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {userPosition && (
          <CircleMarker
            center={userPosition}
            radius={8}
            pathOptions={{ color: "#fff", weight: 2, fillColor: "#ea580c", fillOpacity: 1 }}
          >
            <Popup>Você está aqui</Popup>
          </CircleMarker>
        )}
        {companiesWithLocation.map((company) => (
          <Marker key={company.id} position={[company.lat, company.lng]} icon={restaurantIcon}>
            <Popup>
              <div className="flex flex-col gap-1">
                <p className="font-medium">{company.name}</p>
                <p className="text-xs">{company.is_open ? "Aberto agora" : "Fechado"}</p>
                <Link href={`/${company.slug}`} className="text-xs underline">
                  Ver loja
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {locating && (
        <div className="absolute top-3 left-1/2 z-[1000] -translate-x-1/2 rounded-full bg-card px-3 py-1 text-xs shadow">
          Localizando você…
        </div>
      )}
    </div>
  );
}
