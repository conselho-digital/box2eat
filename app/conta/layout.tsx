import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountTabs } from "@/components/account/account-tabs";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("company_members")
    .select("id")
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  const tabs = [
    { href: "/conta", label: "Página inicial" },
    { href: "/conta/dados-pessoais", label: "Dados pessoais" },
    { href: "/conta/seguranca", label: "Segurança" },
    { href: "/conta/favoritos", label: "Favoritos" },
    { href: "/conta/pedidos", label: "Pedidos" },
    ...(membership ? [{ href: "/empresas", label: "Meus restaurantes" }] : []),
    { href: "/entregador/cadastro", label: "Seja um entregador" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold">Conta Box2eat</h1>
      <AccountTabs tabs={tabs} />
      {children}
    </div>
  );
}
