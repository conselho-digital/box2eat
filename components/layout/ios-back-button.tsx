"use client";

import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useInstallApp } from "@/components/pwa/install-app-provider";

/** Standalone iOS PWA has no browser chrome (no native back button/gesture
 *  affordance), so give it one in the navbar next to the logo. Not needed
 *  on Android/desktop, which keep normal browser/OS back navigation. */
export function IosBackButton() {
  const { platform, isStandalone } = useInstallApp();
  const pathname = usePathname();
  const router = useRouter();

  if (platform !== "ios" || !isStandalone || pathname === "/") return null;

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Voltar"
      className="shrink-0 rounded-lg p-1.5 hover:bg-muted"
    >
      <ChevronLeft className="size-5" />
    </button>
  );
}
