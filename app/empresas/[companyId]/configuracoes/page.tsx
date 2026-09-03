import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyMembership } from "@/lib/domain/companies-detail";
import { NotificationPreferencesForm } from "@/components/notifications/notification-preferences-form";

export default async function CompanyNotificationSettingsPage({
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

  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-medium">Notificações</h2>
      <p className="text-sm text-muted-foreground">
        Escolha quais notificações você quer receber como restaurante — vale para todas as lojas
        que você administra.
      </p>
      <div className="mt-2">
        <NotificationPreferencesForm
          userId={user.id}
          categories={[
            "notify_new_orders",
            "notify_company_order_updates",
            "notify_customer_messages",
            "notify_company_courier_messages",
          ]}
        />
      </div>
    </div>
  );
}
