import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginMethods } from "@/components/auth/login-methods";
import { AuthBrand } from "@/components/auth/auth-brand";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <AuthBrand />
          <CardTitle>Entrar</CardTitle>
          <CardDescription>Acesse sua conta Box2eat.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginMethods />
        </CardContent>
      </Card>
    </div>
  );
}
