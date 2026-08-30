"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const GIS_SRC = "https://accounts.google.com/gsi/client";
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

function loadGoogleScript(onLoad: () => void) {
  if (window.google?.accounts?.id) {
    onLoad();
    return;
  }
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`);
  if (existing) {
    existing.addEventListener("load", onLoad, { once: true });
    return;
  }
  const script = document.createElement("script");
  script.src = GIS_SRC;
  script.async = true;
  script.defer = true;
  script.addEventListener("load", onLoad, { once: true });
  document.head.appendChild(script);
}

/**
 * Runs the whole Google sign-in on this page (Google Identity Services +
 * Supabase's signInWithIdToken) instead of redirecting through Supabase's
 * own /auth/v1/authorize endpoint — so the Google account picker shows this
 * app's own domain instead of the raw Supabase project URL.
 */
export function GoogleSignInButton() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(
    CLIENT_ID ? null : "Login com Google não configurado.",
  );

  useEffect(() => {
    if (!CLIENT_ID) return;

    loadGoogleScript(() => {
      const container = containerRef.current;
      if (!window.google || !container) return;

      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: async (response) => {
          const supabase = createClient();
          const { error } = await supabase.auth.signInWithIdToken({
            provider: "google",
            token: response.credential,
          });
          if (error) {
            setError("Não foi possível entrar com o Google.");
            return;
          }
          router.push("/conta");
          router.refresh();
        },
      });

      window.google.accounts.id.renderButton(container, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: container.offsetWidth || 320,
      });
    });
  }, [router]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={containerRef} className="w-full [&>div]:!w-full" />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
