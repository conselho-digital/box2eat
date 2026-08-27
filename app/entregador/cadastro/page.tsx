import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyDeliveryPartner } from "@/lib/domain/delivery";
import { ApplicationForm } from "@/components/delivery/application-form";
import { DocumentManager } from "@/components/delivery/document-manager";

const STATUS_LABEL: Record<string, string> = {
  pending: "Seu cadastro está em análise. Assim que um administrador revisar seus documentos, você poderá aceitar entregas.",
  approved: "Cadastro aprovado! Vá para o painel para ficar online e aceitar entregas.",
  rejected: "Seu cadastro foi rejeitado.",
  suspended: "Seu cadastro está suspenso.",
};

export default async function DeliverySignupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: partner } = await getMyDeliveryPartner(supabase, user.id);

  if (!partner) {
    return <ApplicationForm userId={user.id} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="rounded-lg border p-3 text-sm">
        {STATUS_LABEL[partner.status] ?? partner.status}
        {partner.rejection_reason && (
          <span className="mt-1 block text-destructive">
            Motivo: {partner.rejection_reason}
          </span>
        )}
      </p>
      <DocumentManager userId={user.id} />
    </div>
  );
}
