import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyDeliveryPartner } from "@/lib/domain/delivery";
import { DeliveryDashboard } from "@/components/delivery/delivery-dashboard";

export default async function DeliveriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: partner } = await getMyDeliveryPartner(supabase, user.id);
  if (partner?.status !== "approved") redirect("/validacao");

  return <DeliveryDashboard userId={user.id} />;
}
