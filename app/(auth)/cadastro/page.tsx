import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignUpForm } from "@/components/auth/signup-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export default function SignUpPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Criar conta</CardTitle>
          <CardDescription>
            Peça comida ou cadastre seu restaurante no Box2eat.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <OAuthButtons />
          <div className="flex items-center gap-2">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">ou</span>
            <Separator className="flex-1" />
          </div>
          <SignUpForm />
          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Entrar
            </Link>
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Quer vender no Box2eat?{" "}
            <Link href="/empresas" className="underline underline-offset-4">
              Criar conta restaurante
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
