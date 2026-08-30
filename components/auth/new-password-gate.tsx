"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

/**
 * Landing target for the recovery-e-mail link: verifies the token and sends
 * the user into the app. The actual "cadastre uma nova senha" prompt is a
 * modal (MustSetPasswordDialog, mounted globally) that shows up over
 * whatever page they land on, not this page itself.
 */
export function NewPasswordGate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "invalid">("loading");

  useEffect(() => {
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");

    async function run() {
      if (!tokenHash || type !== "magiclink") {
        setStatus("invalid");
        return;
      }

      const supabase = createClient();
      // Same mechanism the QR-login flow already relies on — it establishes
      // the session directly, without depending on Supabase's own
      // /auth/v1/verify redirect and its Site URL/Redirect URLs config.
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: "magiclink",
      });

      if (error) {
        setStatus("invalid");
        return;
      }

      router.push("/conta");
      router.refresh();
    }

    run();
  }, [searchParams, router]);

  if (status === "loading") return null;

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Link inválido ou expirado</CardTitle>
          <CardDescription>
            <Link href="/recuperar-acesso" className="underline underline-offset-4">
              Peça um novo link de recuperação
            </Link>
            .
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
