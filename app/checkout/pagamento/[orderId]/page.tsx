import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PaymentPicker } from "@/components/checkout/payment-picker";

export default async function PaymentPickerPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/checkout/pagamento/${orderId}`);

  const { data: order } = await supabase
    .from("orders")
    .select("id, customer_id, status, total, companies(name)")
    .eq("id", orderId)
    .maybeSingle();

  if (!order || order.customer_id !== user.id) notFound();

  if (order.status !== "pending_payment") {
    redirect(`/pedidos/${orderId}`);
  }

  const company = Array.isArray(order.companies) ? order.companies[0] : order.companies;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 p-6">
      <PaymentPicker orderId={order.id} companyName={company?.name ?? ""} total={order.total} />
    </div>
  );
}
