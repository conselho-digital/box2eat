import { notFound, redirect } from "next/navigation";
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
  if (error || !order) notFound();

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
