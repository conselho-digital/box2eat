import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { listMyAddresses } from "@/lib/domain/address";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/checkout");

  const { data: addresses } = await listMyAddresses(supabase, user.id);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold">Checkout</h1>
      <CheckoutForm userId={user.id} initialAddresses={addresses ?? []} />
    </div>
  );
}
