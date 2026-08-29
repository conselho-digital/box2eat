import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold">Minha conta</h1>
      <nav className="flex gap-4 border-b pb-2 text-sm">
        <Link href="/conta" className="hover:underline">
          Perfil
        </Link>
        <Link href="/conta/seguranca" className="hover:underline">
          Segurança
        </Link>
        <Link href="/conta/favoritos" className="hover:underline">
          Favoritos
        </Link>
        <Link href="/conta/pedidos" className="hover:underline">
          Pedidos
        </Link>
        {membership && (
          <Link href="/empresas" className="hover:underline">
            Minhas empresas
          </Link>
        )}
        <Link href="/entregador/cadastro" className="hover:underline">
          Seja um entregador
        </Link>
      </nav>
      {children}
    </div>
  );
}
