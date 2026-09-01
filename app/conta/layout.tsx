import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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

  const tabs = [
    { href: "/conta", label: "Página inicial" },
    { href: "/conta/dados-pessoais", label: "Dados pessoais" },
    { href: "/conta/seguranca", label: "Segurança" },
    { href: "/conta/favoritos", label: "Favoritos" },
    { href: "/conta/pedidos", label: "Pedidos" },
    { href: "/entregador/cadastro", label: "Seja um entregador" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <div className="flex items-center gap-2 border-b pb-1">
        <Link
          href="/"
          aria-label="Voltar"
          className="shrink-0 rounded-lg p-1.5 hover:bg-muted"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <AccountTabs tabs={tabs} />
      </div>
      {children}
    </div>
  );
}
