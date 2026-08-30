"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoginMethods } from "@/components/auth/login-methods";
import { SignUpForm } from "@/components/auth/signup-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { Separator } from "@/components/ui/separator";

export function CompanyLanding() {
  const [mode, setMode] = useState<"login" | "signup">("signup");

  return (
    <div className="flex flex-1 flex-col items-center gap-10 p-6 sm:p-10">
      <div className="flex max-w-xl flex-col gap-3 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Venda sua comida no Box2eat
        </h1>
        <p className="text-muted-foreground">
          Cadastre sua empresa, monte seu cardápio e comece a receber pedidos perto de você.
        </p>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{mode === "signup" ? "Criar conta empresa" : "Entrar"}</CardTitle>
          <CardDescription>
            {mode === "signup"
              ? "Crie sua conta para cadastrar sua empresa."
              : "Entre para acessar suas empresas."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {mode === "signup" ? (
            <>
              <OAuthButtons />
              <div className="flex items-center gap-2">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">ou</span>
                <Separator className="flex-1" />
              </div>
              <SignUpForm />
              <p className="text-center text-sm text-muted-foreground">
                Já tem conta?{" "}
                <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setMode("login")}>
                  Entrar
                </Button>
              </p>
            </>
          ) : (
            <>
              <LoginMethods />
              <p className="text-center text-sm text-muted-foreground">
                Não tem conta?{" "}
                <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setMode("signup")}>
                  Criar conta empresa
                </Button>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
