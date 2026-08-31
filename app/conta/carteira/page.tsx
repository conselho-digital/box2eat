import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listMyPaymentMethods } from "@/lib/domain/payments";

const PROVIDER_LABEL: Record<string, string> = {
  mercadopago: "Mercado Pago",
  stripe: "Stripe",
};

const METHOD_LABEL: Record<string, string> = {
  pix: "Pix",
  credit_card: "Cartão de crédito",
  debit_card: "Cartão de débito",
};

export default async function WalletPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: methods } = await listMyPaymentMethods(supabase, user.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold">Carteira</h2>
        <p className="text-sm text-muted-foreground">
          O Box2eat não guarda os dados do seu cartão — cada pagamento é feito direto com o
          Mercado Pago ou o Stripe no checkout.
        </p>
      </div>

      {methods && methods.length > 0 ? (
        <div className="flex flex-col divide-y rounded-lg border">
          {methods.map((method) => (
            <div key={`${method.provider}:${method.method}`} className="p-3 text-sm">
              <p className="font-medium">
                {method.method ? METHOD_LABEL[method.method] ?? method.method : "Pagamento"}
              </p>
              <p className="text-muted-foreground">
                via {PROVIDER_LABEL[method.provider] ?? method.provider}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Você ainda não fez nenhum pagamento — os métodos usados aparecem aqui depois do
          primeiro pedido.
        </p>
      )}
    </div>
  );
}
