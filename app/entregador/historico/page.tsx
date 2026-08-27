import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DeliveryHistory } from "@/components/delivery/delivery-history";

export default async function DeliveryHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <DeliveryHistory userId={user.id} />;
}
