import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyMembership } from "@/lib/domain/companies-detail";
import { CouponManager } from "@/components/companies/coupon-manager";

export default async function CompanyCouponsPage({
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

  return <CouponManager companyId={companyId} />;
}
