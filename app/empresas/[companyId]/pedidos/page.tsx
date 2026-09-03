import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CompanyOrderQueue } from "@/components/orders/company-order-queue";

export default async function CompanyOrdersPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/empresas/${companyId}/pedidos`);

  return <CompanyOrderQueue companyId={companyId} userId={user.id} />;
}
