"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NewPasswordForm } from "@/components/auth/new-password-form";
import { createClient } from "@/lib/supabase/client";

export default function NewPasswordPage() {
  const [status, setStatus] = useState<"loading" | "ready" | "unauthenticated">("loading");

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setStatus(data.user ? "ready" : "unauthenticated");
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") setStatus("ready");
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Cadastre uma nova senha</CardTitle>
          <CardDescription>
            Você entrou pelo link de recuperação. Por segurança, cadastre uma nova senha antes de
            continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "loading" && (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          )}
          {status === "unauthenticated" && (
            <p className="text-sm text-destructive">
              Link inválido ou expirado.{" "}
              <Link href="/recuperar-acesso" className="underline underline-offset-4">
                Peça um novo link de recuperação
              </Link>
              .
            </p>
          )}
          {status === "ready" && <NewPasswordForm />}
        </CardContent>
      </Card>
    </div>
  );
}
