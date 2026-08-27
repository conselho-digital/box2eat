"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LocateFixed } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function HeroSearch({
  q,
  open,
  sort,
}: {
  q?: string;
  open?: string;
  sort?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(q ?? "");
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  function navigate(extra: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged: Record<string, string | undefined> = { q: value, open, sort, ...extra };
    if (merged.q) params.set("q", merged.q);
    if (merged.open) params.set("open", merged.open);
    if (merged.sort) params.set("sort", merged.sort);
    if (merged.lat) params.set("lat", merged.lat);
    if (merged.lng) params.set("lng", merged.lng);
    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  }

  function handleLocate() {
    if (!navigator.geolocation) {
      setLocateError("Geolocalização não suportada neste navegador");
      return;
    }
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        navigate({
          lat: String(position.coords.latitude),
          lng: String(position.coords.longitude),
        });
      },
      () => {
        setLocating(false);
        setLocateError("Não foi possível acessar sua localização");
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <form
        className="flex flex-col gap-2 rounded-2xl bg-card p-2 shadow-lg sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          navigate({});
        }}
      >
        <Input
          type="text"
          placeholder="Buscar empresas…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-11 flex-1 rounded-xl border-0 bg-muted px-4 text-foreground"
        />
        <Button
          type="button"
          variant="outline"
          className="h-11 gap-1.5 rounded-xl px-4 text-foreground"
          onClick={handleLocate}
          disabled={locating}
        >
          <LocateFixed className="size-4" />
          {locating ? "Localizando…" : "Próximas de mim"}
        </Button>
        <Button type="submit" className="h-11 rounded-xl px-6">
          Buscar
        </Button>
      </form>
      {locateError && <p className="text-sm text-primary-foreground/90">{locateError}</p>}
    </div>
  );
}
