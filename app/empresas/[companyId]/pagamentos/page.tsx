import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyMembership } from "@/lib/domain/companies-detail";
import { AsaasConnectForm } from "@/components/payments/asaas-connect-form";
import { AcceptedPaymentMethodsForm } from "@/components/companies/accepted-payment-methods-form";

export default async function CompanyPaymentsPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: membership } = await getMyMembership(supabase, companyId, user.id);
  if (!membership) notFound();

  const company = membership.companies;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-medium">Recebimentos</h2>
        <p className="text-sm text-muted-foreground">
          Conecte sua conta Asaas para poder aceitar pedidos. O cliente paga pela plataforma e o
          valor é repassado depois que cada pedido é entregue e não há nenhuma reclamação aberta.
        </p>
      </div>
      <AsaasConnectForm
        entityType="company"
        entityId={company.id}
        connected={Boolean(company.asaas_account_id)}
        title="Asaas"
        description="Preencha os dados do restaurante para conectar a conta que vai receber os repasses."
      />
      <AcceptedPaymentMethodsForm
        companyId={company.id}
        initialMethods={company.accepted_payment_methods}
      />
    </div>
  );
}
