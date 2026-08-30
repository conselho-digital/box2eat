"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";

/** "Próximas de mim" is on by default — geolocation is requested automatically
 * on load unless the user has explicitly turned it off (near=off). */
export function NearMeButton({
  q,
  open,
  sort,
  lat,
  lng,
  near,
}: {
  q?: string;
  open?: string;
  sort?: string;
  lat?: string;
  lng?: string;
  near?: string;
}) {
  const router = useRouter();
  const [locating, setLocating] = useState(false);
  const active = Boolean(lat && lng);
  const requestedRef = useRef(false);

  function navigate(extra: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged: Record<string, string | undefined> = { q, open, sort, lat, lng, near, ...extra };
    if (merged.q) params.set("q", merged.q);
    if (merged.open) params.set("open", merged.open);
    if (merged.sort) params.set("sort", merged.sort);
    if (merged.lat) params.set("lat", merged.lat);
    if (merged.lng) params.set("lng", merged.lng);
    if (merged.near) params.set("near", merged.near);
    const query = params.toString();
    router.replace(query ? `/?${query}` : "/");
  }

  function locate() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        navigate({
          lat: String(position.coords.latitude),
          lng: String(position.coords.longitude),
          near: undefined,
        });
      },
      () => {
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

  useEffect(() => {
    if (!active && near !== "off" && !requestedRef.current) {
      requestedRef.current = true;
      locate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle() {
    if (active) {
      navigate({ lat: undefined, lng: undefined, near: "off" });
    } else {
      locate();
    }
  }

  return (
    <Button
      type="button"
      variant={active ? "default" : "secondary"}
      size="sm"
      onClick={toggle}
      disabled={locating}
      className="gap-1.5"
    >
      <LocateFixed className="size-4" />
      {locating ? "Localizando…" : "Próximas de mim"}
    </Button>
  );
}
