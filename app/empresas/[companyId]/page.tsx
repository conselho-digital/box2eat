import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyMembership } from "@/lib/domain/companies-detail";
import { CompanyCategoryForm } from "@/components/companies/company-category-form";

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
      <p>URL: box2eat.com/{company.slug}</p>
      {company.description && <p>{company.description}</p>}
      {company.phone && <p>Telefone: {company.phone}</p>}
      <div>
        <p className="mb-1.5">Categoria</p>
        <CompanyCategoryForm companyId={company.id} category={company.category} />
      </div>
    </div>
  );
}
