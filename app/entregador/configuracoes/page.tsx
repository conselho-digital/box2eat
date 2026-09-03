import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NotificationPreferencesForm } from "@/components/notifications/notification-preferences-form";

export default async function DeliveryNotificationSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/entregador/cadastro");

  return (
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
  );
}
