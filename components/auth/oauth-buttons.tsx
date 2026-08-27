"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { signInWithOAuth, type OAuthProvider } from "@/lib/domain/auth";

export function OAuthButtons() {
  const [loading, setLoading] = useState<OAuthProvider | null>(null);

  async function handleClick(provider: OAuthProvider) {
    setLoading(provider);
    const supabase = createClient();
    const { error } = await signInWithOAuth(supabase, provider);
    if (error) {
      setLoading(null);
    }
    // On success, the browser is redirected to the provider — no further
    // action needed here.
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        disabled={loading !== null}
        onClick={() => handleClick("google")}
      >
        <GoogleIcon className="size-4" />
        {loading === "google" ? "Conectando…" : "Continuar com Google"}
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={loading !== null}
        onClick={() => handleClick("apple")}
      >
        <AppleIcon className="size-4" />
        {loading === "apple" ? "Conectando…" : "Continuar com Apple"}
      </Button>
    </div>
  );
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.63H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.37l3.99-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.63l3.99 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

function AppleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16.36 1.43c0 1.14-.42 2.14-1.13 2.9-.78.83-2.03 1.47-3.15 1.38-.13-1.1.42-2.24 1.1-2.96.78-.85 2.11-1.47 3.18-1.32ZM20.24 17.24c-.32.75-.7 1.44-1.14 2.09-.6.9-1.34 1.98-2.35 1.99-1.02.01-1.31-.66-2.75-.66-1.44 0-1.78.65-2.79.67-1.02.02-1.8-.98-2.4-1.88C7.4 17.55 6.3 14.16 7.6 11.9c.65-1.14 1.82-1.86 3.1-1.87 1.02-.02 1.98.7 2.6.7.62 0 1.78-.86 3-.73.51.02 1.94.2 2.86 1.55-.07.05-1.71 1-1.7 2.97.02 2.36 2.06 3.14 2.08 3.15-.02.06-.32 1.11-.7 1.57Z" />
    </svg>
  );
}
