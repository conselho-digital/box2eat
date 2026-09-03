import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { listMyAddresses } from "@/lib/domain/address";
import type { PaymentOption } from "@/lib/domain/payment-methods";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/checkout");

  const [{ data: addresses }, { data: profile }] = await Promise.all([
    listMyAddresses(supabase, user.id),
    supabase.from("profiles").select("phone, default_payment_method").eq("id", user.id).single(),
  ]);

  return (
    // pb clears the fixed CartBar (floats above the bottom nav on mobile)
    // so the "Confirmar pedido" button at the end of the form doesn't end
    // up hidden behind it — matches the same clearance added on /carrinho.
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6 pb-[calc(env(safe-area-inset-bottom)+8rem)] sm:pb-6">
      <CheckoutForm
        userId={user.id}
        initialAddresses={addresses ?? []}
        customerPhone={profile?.phone ?? null}
        initialDefaultPaymentMethod={(profile?.default_payment_method as PaymentOption | null) ?? null}
      />
    </div>
  );
}
