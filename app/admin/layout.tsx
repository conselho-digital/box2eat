import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser, getCachedAccountMenuData } from "@/lib/domain/current-user";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getCurrentUser();

  if (!user) redirect("/login");

  const { isAdmin } = await getCachedAccountMenuData(user.id);
  if (!isAdmin) notFound();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Painel admin</h1>
        <LogoutButton />
      </div>
      <nav className="flex gap-4 border-b pb-2 text-sm">
        <Link href="/admin/entregadores" className="hover:underline">
          Entregadores
        </Link>
        <Link href="/admin/empresas" className="hover:underline">
          Restaurantes
        </Link>
        <Link href="/admin/pedidos" className="hover:underline">
          Pedidos
        </Link>
        <Link href="/admin/tickets" className="hover:underline">
          Tickets
        </Link>
        <Link href="/admin/validacoes" className="hover:underline">
          Validações de usuário
        </Link>
        <Link href="/admin/whatsapp" className="hover:underline">
          WhatsApp
        </Link>
      </nav>
      {children}
    </div>
  );
}
