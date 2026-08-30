"use client";

import { useRouter } from "next/navigation";
import { clearLocationCookies, clearNearOffCookie } from "@/lib/domain/location-cookie";

export function ClearFiltersLink() {
  const router = useRouter();

  function handleClick() {
    clearLocationCookies();
    clearNearOffCookie();
    router.push("/");
    router.refresh();
  }

  return (
    <button type="button" onClick={handleClick} className="text-foreground/70 hover:underline">
      Limpar filtros
    </button>
  );
}
