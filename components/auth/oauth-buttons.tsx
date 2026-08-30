"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { signInWithOAuth, type OAuthProvider } from "@/lib/domain/auth";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";

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
      <GoogleSignInButton />
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

function AppleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16.36 1.43c0 1.14-.42 2.14-1.13 2.9-.78.83-2.03 1.47-3.15 1.38-.13-1.1.42-2.24 1.1-2.96.78-.85 2.11-1.47 3.18-1.32ZM20.24 17.24c-.32.75-.7 1.44-1.14 2.09-.6.9-1.34 1.98-2.35 1.99-1.02.01-1.31-.66-2.75-.66-1.44 0-1.78.65-2.79.67-1.02.02-1.8-.98-2.4-1.88C7.4 17.55 6.3 14.16 7.6 11.9c.65-1.14 1.82-1.86 3.1-1.87 1.02-.02 1.98.7 2.6.7.62 0 1.78-.86 3-.73.51.02 1.94.2 2.86 1.55-.07.05-1.71 1-1.7 2.97.02 2.36 2.06 3.14 2.08 3.15-.02.06-.32 1.11-.7 1.57Z" />
    </svg>
  );
}
