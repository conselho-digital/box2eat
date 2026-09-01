"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, ZoomControl, useMap } from "react-leaflet";
import L, { type LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { ListFilter, LocateFixed, Star } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { FOOD_CATEGORIES, type FoodCategory } from "@/lib/domain/categories";
import type { PublicCompany } from "@/lib/domain/companies";
import { useMapStats } from "@/components/map/map-stats-context";
import { CATEGORY_ICONS } from "@/components/home/category-chips";

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

const CIRCLE_BUTTON =
  "flex size-11 items-center justify-center rounded-full bg-card text-foreground shadow-md";

const RATING_OPTIONS = [1, 2, 3, 4, 5];

/** Imperatively re-centers the map when the GPS button is clicked — needs
 *  the Leaflet map instance, only available to a component rendered inside
 *  <MapContainer>. */
function RecenterController({ position, signal }: { position: LatLngExpression | null; signal: number }) {
  const map = useMap();
  useEffect(() => {
    if (signal > 0 && position) map.flyTo(position, 15);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only fires when the GPS button bumps the signal
  }, [signal]);
  return null;
}

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
  const [recenterSignal, setRecenterSignal] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<Set<FoodCategory>>(new Set());
  const [minRating, setMinRating] = useState(0);
  const { setVisibleCount } = useMapStats();

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

  const filteredCompanies = companiesWithLocation.filter((company) => {
    if (selectedCategories.size > 0) {
      if (!company.category || !selectedCategories.has(company.category as FoodCategory)) return false;
    }
    if (minRating > 0 && (company.rating_avg === null || company.rating_avg < minRating)) return false;
    return true;
  });

  useEffect(() => {
    setVisibleCount(filteredCompanies.length);
    return () => setVisibleCount(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setVisibleCount is a stable setState
  }, [filteredCompanies.length]);

  function toggleCategory(category: FoodCategory) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  function handleLocate() {
    if (userPosition) {
      setRecenterSignal((s) => s + 1);
      return;
    }
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition([position.coords.latitude, position.coords.longitude]);
        setLocating(false);
        setRecenterSignal((s) => s + 1);
      },
      () => setLocating(false),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

  const center: LatLngExpression =
    userPosition ??
    (companiesWithLocation.length > 0
      ? [companiesWithLocation[0].lat, companiesWithLocation[0].lng]
      : DEFAULT_CENTER);

  return (
    // The [&_...] rule pushes Leaflet's bottom-right zoom control up above
    // the fixed mobile bottom nav (it defaults to sitting flush with the
    // container's own bottom edge, which the nav now covers).
    <div className="relative h-full w-full [&_.leaflet-bottom.leaflet-right]:mb-[calc(env(safe-area-inset-bottom)+4.5rem)] sm:[&_.leaflet-bottom.leaflet-right]:mb-0">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom
        attributionControl={false}
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ZoomControl position="bottomright" />
        <RecenterController position={userPosition} signal={recenterSignal} />
        {userPosition && (
          <CircleMarker
            center={userPosition}
            radius={8}
            pathOptions={{ color: "#fff", weight: 2, fillColor: "#ea580c", fillOpacity: 1 }}
          >
            <Popup>Você está aqui</Popup>
          </CircleMarker>
        )}
        {filteredCompanies.map((company) => (
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

      <div className="absolute inset-x-0 top-3 z-[1000] flex items-center justify-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger aria-label="Filtrar por categoria" className={CIRCLE_BUTTON}>
            <ListFilter className="size-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {FOOD_CATEGORIES.map((category) => {
              const Icon = CATEGORY_ICONS[category];
              return (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={selectedCategories.has(category)}
                  onCheckedChange={() => toggleCategory(category)}
                  onSelect={(e) => e.preventDefault()}
                >
                  <Icon className="size-4" />
                  {category}
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger aria-label="Filtrar por avaliação" className={CIRCLE_BUTTON}>
            <Star className="size-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuRadioGroup value={String(minRating)} onValueChange={(v) => setMinRating(Number(v))}>
              <DropdownMenuRadioItem value="0">Qualquer avaliação</DropdownMenuRadioItem>
              {RATING_OPTIONS.map((n) => (
                <DropdownMenuRadioItem key={n} value={String(n)}>
                  {n}+ estrelas
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <button type="button" onClick={handleLocate} aria-label="Minha localização" className={CIRCLE_BUTTON}>
          <LocateFixed className="size-5" />
        </button>
      </div>

      {locating && (
        <div className="absolute top-17 left-1/2 z-[1000] -translate-x-1/2 rounded-full bg-card px-3 py-1 text-xs shadow">
          Localizando você…
        </div>
      )}
    </div>
  );
}
