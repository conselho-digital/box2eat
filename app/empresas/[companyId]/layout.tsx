import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyMembership } from "@/lib/domain/companies-detail";
import { CompanyDashboardHeaderSync } from "@/components/companies/company-dashboard-header-sync";

export default async function CompanyDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await getMyMembership(supabase, companyId, user.id);

  if (!membership) {
    notFound();
  }

  const company = membership.companies;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6">
      <CompanyDashboardHeaderSync name={company.name} slug={company.slug} />
      {children}
    </div>
  );
}
