import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/logout-button";
import { NotificationBell } from "@/components/notifications/notification-bell";

export default async function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/entregador/cadastro");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Área do entregador</h1>
        <div className="flex items-center gap-1">
          <NotificationBell userId={user.id} />
          <LogoutButton />
        </div>
      </div>
      <nav className="flex gap-4 border-b pb-2 text-sm">
        <Link href="/entregador/cadastro" className="hover:underline">
          Cadastro
        </Link>
        <Link href="/entregador/painel" className="hover:underline">
          Painel
        </Link>
        <Link href="/entregador/historico" className="hover:underline">
          Histórico
        </Link>
        <Link href="/entregador/configuracoes" className="hover:underline">
          Configurações
        </Link>
      </nav>
      {children}
    </div>
  );
}
