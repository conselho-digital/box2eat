import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NotificationPreferencesForm } from "@/components/notifications/notification-preferences-form";

export default async function AccountNotificationSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-medium">Notificações</h2>
      <p className="text-sm text-muted-foreground">
        Escolha quais notificações você quer receber como cliente.
      </p>
      <div className="mt-2">
        <NotificationPreferencesForm
          userId={user.id}
          categories={["notify_order_updates", "notify_promotions", "notify_courier_messages"]}
        />
      </div>
    </div>
  );
}
