import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NotificationPreferencesForm } from "@/components/notifications/notification-preferences-form";
import { AsaasConnectForm } from "@/components/payments/asaas-connect-form";

export default async function DeliveryNotificationSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/entregador/cadastro");

  const { data: partner } = await supabase
    .from("delivery_partners")
    .select("asaas_account_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-medium">Notificações</h2>
        <p className="text-sm text-muted-foreground">
          Escolha quais notificações você quer receber como entregador.
        </p>
        <div className="mt-2">
          <NotificationPreferencesForm
            userId={user.id}
            categories={[
              "notify_delivery_new_orders",
              "notify_restaurant_messages",
              "notify_delivery_customer_messages",
              "notify_delivery_order_updates",
            ]}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="font-medium">Recebimentos</h2>
        <p className="text-sm text-muted-foreground">
          Conecte sua conta Asaas para poder assumir entregas. O valor da taxa de entrega é
          repassado depois que cada pedido é entregue e não há nenhuma reclamação aberta.
        </p>
        <AsaasConnectForm
          entityType="delivery_partner"
          entityId={user.id}
          connected={Boolean(partner?.asaas_account_id)}
          title="Asaas"
          description="Preencha seus dados para conectar a conta que vai receber os repasses."
        />
      </div>
    </div>
  );
}
