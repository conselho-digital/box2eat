"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, AttributionControl, useMap } from "react-leaflet";
import L, { type LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

const pinIcon = L.icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DEFAULT_CENTER: LatLngExpression = [-23.5505, -46.6333];

function RecenterOnChange({ position }: { position: LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the position itself changes
  }, [position]);
  return null;
}

export function AddressMapPicker({
  lat,
  lng,
  onChange,
}: {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}) {
  const position: LatLngExpression = lat !== null && lng !== null ? [lat, lng] : DEFAULT_CENTER;

  return (
    <div className="h-48 w-full overflow-hidden rounded-lg">
      <MapContainer center={position} zoom={16} scrollWheelZoom={false} attributionControl={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <AttributionControl position="bottomright" prefix={false} />
        <RecenterOnChange position={position} />
        <Marker
          position={position}
          icon={pinIcon}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target as L.Marker;
              const { lat: newLat, lng: newLng } = marker.getLatLng();
              onChange(newLat, newLng);
            },
          }}
        />
      </MapContainer>
    </div>
  );
}
