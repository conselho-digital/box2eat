import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RecoveryLoginForm } from "@/components/auth/recovery-login-form";

export default function RecoverAccessPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Recuperar acesso</CardTitle>
          <CardDescription>
            Informe o e-mail de recuperação cadastrado na sua conta. Vamos te enviar um link para
            entrar sem precisar da senha ou do Google.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecoveryLoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
