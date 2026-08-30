"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { clearLocationCookies, setNearOffCookie } from "@/lib/domain/location-cookie";

/** Switching to "best rated" is an explicit opt-out of proximity sorting,
 * so it also drops the location cookies (not just visually — clicking
 * this should stop filtering by distance). */
export function RatingSortButton({ active, href }: { active: boolean; href: string }) {
  const router = useRouter();

  function handleClick() {
    clearLocationCookies();
    setNearOffCookie();
    router.push(href);
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant={active ? "default" : "secondary"}
      size="sm"
      onClick={handleClick}
    >
      Mais bem avaliadas
    </Button>
  );
}
