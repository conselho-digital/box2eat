"use client";

import dynamic from "next/dynamic";

const AddressMapPicker = dynamic(
  () => import("./address-map-picker").then((mod) => mod.AddressMapPicker),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-48 w-full items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
        Carregando mapa…
      </div>
    ),
  },
);

export function AddressMapView(props: {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}) {
  return <AddressMapPicker {...props} />;
}
