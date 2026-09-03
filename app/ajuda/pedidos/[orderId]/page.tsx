import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getOrder } from "@/lib/domain/orders";
import { OrderIssueActions } from "@/components/orders/order-issue-actions";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" });

export default async function HelpOrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/ajuda/pedidos/${orderId}`);

  const { data: order, error } = await getOrder(supabase, orderId);
  if (error || !order || order.customer_id !== user.id) notFound();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <Link href="/ajuda/pedidos" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" />
        Ajuda com um pedido
      </Link>

      <div>
        <h1 className="text-xl font-semibold">{order.companies.name}</h1>
        <p className="text-sm text-muted-foreground">
          Pedido feito em {dateFormat.format(new Date(order.created_at))}
        </p>
      </div>

      <div className="flex flex-col divide-y rounded-lg border">
        {order.order_items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 text-sm">
            <span>
              {item.quantity}× {item.item_name}
            </span>
            <span className="text-muted-foreground">{currency.format(item.subtotal)}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between text-sm font-medium">
        <span>Total</span>
        <span>{currency.format(order.total)}</span>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">O que você precisa?</h2>
        <OrderIssueActions orderId={orderId} hasDeliveryPartner={Boolean(order.delivery_partner_id)} />
      </div>

      <Link href={`/pedidos/${orderId}`} className="text-sm text-primary underline underline-offset-4">
        Ver acompanhamento do pedido
      </Link>
    </div>
  );
}
