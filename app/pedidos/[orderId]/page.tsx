import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrder } from "@/lib/domain/orders";
import { OrderTracking } from "@/components/orders/order-tracking";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/pedidos/${orderId}`);

  const { data: order, error } = await getOrder(supabase, orderId);
  if (error || !order) {
    // Reached via a link that no longer points anywhere real — a stale
    // notification, a removed order — rather than a broken route, so this
    // gets a plain in-context message instead of the framework's 404 page.
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="font-medium">Pedido não encontrado</p>
        <p className="text-sm text-muted-foreground">
          Esse pedido não existe mais ou você não tem acesso a ele.
        </p>
        <Link href="/conta/pedidos" className="mt-2 text-sm text-primary hover:underline">
          Ver meus pedidos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 p-6">
      <OrderTracking
        orderId={orderId}
        initialOrder={order}
        isCustomer={order.customer_id === user.id}
        userId={user.id}
      />
    </div>
  );
}
