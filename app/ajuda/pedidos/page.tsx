import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { listMyOrders } from "@/lib/domain/orders";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" });

export default async function HelpOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/ajuda/pedidos");

  const { data: orders } = await listMyOrders(supabase);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <Link href="/ajuda" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" />
        Central de ajuda
      </Link>

      <div>
        <h1 className="text-xl font-semibold">Ajuda com um pedido</h1>
        <p className="text-sm text-muted-foreground">
          Escolha o pedido para reportar o restaurante ou pedir reembolso.
        </p>
      </div>

      {!orders || orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">Você ainda não fez nenhum pedido.</p>
      ) : (
        <div className="flex flex-col divide-y rounded-lg border">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/ajuda/pedidos/${order.id}`}
              className="flex items-center justify-between gap-3 p-4 hover:bg-muted/50"
            >
              <div>
                <p className="font-medium">{order.companies.name}</p>
                <p className="text-sm text-muted-foreground">
                  {dateFormat.format(new Date(order.created_at))} · {currency.format(order.total)}
                </p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
