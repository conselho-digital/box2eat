import { Separator } from "@/components/ui/separator";
import { PasswordForm } from "@/components/account/password-form";
import { MfaManager } from "@/components/account/mfa-manager";

export default function SecurityPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-medium">Senha</h2>
        <div className="mt-2">
          <PasswordForm />
        </div>
      </div>

      <Separator />

      <MfaManager />
    </div>
  );
}
