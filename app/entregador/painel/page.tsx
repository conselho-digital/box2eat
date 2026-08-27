import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DeliveryDashboard } from "@/components/delivery/delivery-dashboard";

export default async function DeliveryPanelPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <DeliveryDashboard userId={user.id} />;
}
