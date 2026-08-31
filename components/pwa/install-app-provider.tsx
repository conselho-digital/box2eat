"use client";

import { createContext, useContext, useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Platform = "ios" | "android" | "other";

type InstallAppContextValue = {
  platform: Platform;
  isStandalone: boolean;
  canPrompt: boolean;
  requestInstall: () => Promise<"accepted" | "dismissed" | "unavailable">;
};

const InstallAppContext = createContext<InstallAppContextValue>({
  platform: "other",
  isStandalone: false,
  canPrompt: false,
  requestInstall: async () => "unavailable",
});

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "other";
}

export function InstallAppProvider({ children }: { children: React.ReactNode }) {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<Platform>("other");
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // One-time read of client-only browser state after mount, to avoid an
    // SSR/client markup mismatch (the server can't know the UA or display mode).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlatform(detectPlatform());
    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
        Boolean((navigator as { standalone?: boolean }).standalone),
    );

    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  async function requestInstall() {
    if (!promptEvent) return "unavailable" as const;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    setPromptEvent(null);
    return outcome;
  }

  return (
    <InstallAppContext.Provider
      value={{ platform, isStandalone, canPrompt: Boolean(promptEvent), requestInstall }}
    >
      {children}
    </InstallAppContext.Provider>
  );
}

export function useInstallApp() {
  return useContext(InstallAppContext);
}
