import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyDeliveryPartner } from "@/lib/domain/delivery";
import { ApplicationForm } from "@/components/delivery/application-form";
import { DocumentManager } from "@/components/delivery/document-manager";

const STATUS_LABEL: Record<string, string> = {
  pending:
    "Seu cadastro está em análise. Assim que um administrador revisar seus documentos, você poderá aceitar entregas.",
  rejected: "Seu cadastro foi rejeitado.",
  suspended: "Seu cadastro está suspenso.",
};

export default async function ValidationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: partner } = await getMyDeliveryPartner(supabase, user.id);

  if (partner?.status === "approved") redirect("/entregas");

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Fazer entregas</h1>
        <p className="text-sm text-muted-foreground">
          Envie seus documentos para começar a aceitar entregas no Box2eat.
        </p>
      </div>

      {!partner ? (
        <ApplicationForm userId={user.id} />
      ) : (
        <>
          <p className="rounded-lg border p-3 text-sm">
            {STATUS_LABEL[partner.status] ?? partner.status}
            {partner.rejection_reason && (
              <span className="mt-1 block text-destructive">
                Motivo: {partner.rejection_reason}
              </span>
            )}
          </p>
          <DocumentManager userId={user.id} />
        </>
      )}
    </div>
  );
}
