"use client";

import dynamic from "next/dynamic";
import type { PublicCompany } from "@/lib/domain/companies";

const CompanyMap = dynamic(() => import("./company-map").then((mod) => mod.CompanyMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
      Carregando mapa…
    </div>
  ),
});

export function MapView(props: {
  companies: PublicCompany[];
  initialLat?: number;
  initialLng?: number;
}) {
  return <CompanyMap {...props} />;
}
