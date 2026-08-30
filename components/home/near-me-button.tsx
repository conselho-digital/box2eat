"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  setLocationCookies,
  clearLocationCookies,
  setNearOffCookie,
  clearNearOffCookie,
} from "@/lib/domain/location-cookie";

/** "Próximas de mim" is on by default — geolocation is requested automatically
 * on load unless the user has explicitly turned it off. Location is kept in
 * cookies (not the URL) so it never shows up in the address bar or in
 * shared links. */
export function NearMeButton({
  lat,
  lng,
  nearOff,
}: {
  lat?: string;
  lng?: string;
  nearOff?: boolean;
}) {
  const router = useRouter();
  const [locating, setLocating] = useState(false);
  const active = Boolean(lat && lng);
  const requestedRef = useRef(false);

  function locate() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        setLocationCookies(position.coords.latitude, position.coords.longitude);
        clearNearOffCookie();
        router.refresh();
      },
      () => {
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

  useEffect(() => {
    if (!active && !nearOff && !requestedRef.current) {
      requestedRef.current = true;
      locate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle() {
    if (active) {
      clearLocationCookies();
      setNearOffCookie();
      router.refresh();
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
