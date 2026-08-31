import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyMembership } from "@/lib/domain/companies-detail";

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
      <div>
        <p className="text-sm text-muted-foreground">
          {membership.role === "owner" ? "Dono" : "Funcionário"}
        </p>
        <h1 className="text-xl font-semibold">{company.name}</h1>
      </div>
      <nav className="flex gap-4 border-b pb-2 text-sm">
        <Link href={`/empresas/${companyId}`} className="hover:underline">
          Visão geral
        </Link>
        <Link href={`/empresas/${companyId}/cardapio`} className="hover:underline">
          Cardápio
        </Link>
        <Link href={`/empresas/${companyId}/pedidos`} className="hover:underline">
          Pedidos
        </Link>
        <Link href={`/empresas/${companyId}/pagamentos`} className="hover:underline">
          Pagamentos
        </Link>
        <Link href={`/empresas/${companyId}/cupons`} className="hover:underline">
          Cupons
        </Link>
        <Link href={`/${company.slug}`} className="hover:underline" target="_blank">
          Ver loja pública
        </Link>
      </nav>
      {children}
    </div>
  );
}
