import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyIdentityVerification } from "@/lib/domain/identity";
import { IdentityVerificationForm } from "@/components/account/identity-verification-form";

export default async function IdentityVerificationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/conta/identidade");

  const { data: verification } = await getMyIdentityVerification(supabase, user.id);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Verificar identidade</h1>
        <p className="text-sm text-muted-foreground">
          Envie uma foto sua segurando um documento com foto (RG, CNH ou passaporte) abaixo do
          rosto, e uma selfie, para liberar a categoria Bebidas e outros itens com restrição de
          idade.
        </p>
      </div>
      <IdentityVerificationForm userId={user.id} initialVerification={verification} />
    </div>
  );
}
