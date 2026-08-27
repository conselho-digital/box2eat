"use client";

import { useState } from "react";
import Link from "next/link";
import { Suspense } from "react";
import { QrCode, ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/auth/login-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { QrLoginPanel } from "@/components/auth/qr-login-panel";

export function LoginMethods() {
  const [mode, setMode] = useState<"password" | "qr">("password");

  if (mode === "qr") {
    return (
      <div className="flex flex-col gap-4">
        <QrLoginPanel />
        <Button type="button" variant="ghost" size="sm" onClick={() => setMode("password")}>
          <ArrowLeft className="size-4" />
          Voltar para login com senha
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <OAuthButtons />
      <div className="flex items-center gap-2">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">ou</span>
        <Separator className="flex-1" />
      </div>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
      <Button type="button" variant="outline" onClick={() => setMode("qr")}>
        <QrCode className="size-4" />
        Entrar com QR code
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Não tem conta?{" "}
        <Link href="/cadastro" className="underline underline-offset-4">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
