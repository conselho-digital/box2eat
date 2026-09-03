import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyMembership } from "@/lib/domain/companies-detail";
import { StripeConnectCard } from "@/components/companies/stripe-connect-card";
import { MercadoPagoConnectCard } from "@/components/companies/mercadopago-connect-card";
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
          Conecte uma conta para receber os pagamentos dos pedidos. Sem conexão, os pagamentos por
          Pix e cartão via Mercado Pago continuam funcionando pela conta da plataforma.
        </p>
      </div>
      <MercadoPagoConnectCard companyId={company.id} connected={Boolean(company.mercadopago_user_id)} />
      <StripeConnectCard
        companyId={company.id}
        chargesEnabled={company.stripe_charges_enabled}
        hasAccount={Boolean(company.stripe_account_id)}
      />
      <AcceptedPaymentMethodsForm
        companyId={company.id}
        initialMethods={company.accepted_payment_methods}
      />
    </div>
  );
}
