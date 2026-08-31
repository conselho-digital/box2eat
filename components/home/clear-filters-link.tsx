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
    <button
      type="button"
      onClick={handleClick}
      className="rounded-full bg-card px-3 py-1.5 text-foreground/80 shadow-sm hover:bg-muted hover:text-foreground"
    >
      Limpar filtros
    </button>
  );
}
