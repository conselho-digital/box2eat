import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { PasswordForm } from "@/components/account/password-form";
import { RecoveryEmailForm } from "@/components/account/recovery-email-form";
import { MfaManager } from "@/components/account/mfa-manager";
import { createClient } from "@/lib/supabase/server";

export default async function SecurityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("recovery_email")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-medium">Senha</h2>
        <div className="mt-2">
          <PasswordForm />
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="font-medium">E-mail de recuperação</h2>
        <div className="mt-2">
          <RecoveryEmailForm userId={user.id} recoveryEmail={profile?.recovery_email ?? null} />
        </div>
      </div>

      <Separator />

      <MfaManager />
    </div>
  );
}
