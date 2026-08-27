import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyMembership } from "@/lib/domain/companies-detail";

export default async function CompanyOverviewPage({
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

  const company = membership.companies;

  return (
    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
      <p>URL: /loja/{company.slug}</p>
      {company.description && <p>{company.description}</p>}
      {company.phone && <p>Telefone: {company.phone}</p>}
    </div>
  );
}
