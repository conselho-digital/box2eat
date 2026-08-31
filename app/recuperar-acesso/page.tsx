import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RecoveryAccessTabs } from "@/components/auth/recovery-access-tabs";

export default function RecoverAccessPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Recuperar acesso</CardTitle>
          <CardDescription>
            Sem acesso à senha? Entre pelo e-mail de recuperação cadastrado ou por um telefone já
            verificado na sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecoveryAccessTabs />
        </CardContent>
      </Card>
    </div>
  );
}
