import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DeliveryPartnerReview } from "@/components/admin/delivery-partner-review";

export default async function AdminDeliveryPartnersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <DeliveryPartnerReview adminId={user.id} />;
}
