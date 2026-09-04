import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { AsaasOnboardingInput } from "@/lib/validations/payments";

type Client = SupabaseClient<Database>;

export type Payment = Database["public"]["Tables"]["payments"]["Row"];

export async function getPayment(supabase: Client, orderId: string) {
  return supabase.from("payments").select("*").eq("order_id", orderId).maybeSingle();
}

export type PaymentMethodUsed = { provider: string; method: string | null };

export async function listMyPaymentMethods(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("payments(provider, method)")
    .eq("customer_id", userId)
    .not("payments", "is", null);
  if (error) return { data: null, error };

  const seen = new Map<string, PaymentMethodUsed>();
  for (const order of data ?? []) {
    const payment = order.payments;
    if (!payment) continue;
    const key = `${payment.provider}:${payment.method ?? ""}`;
    if (!seen.has(key)) seen.set(key, { provider: payment.provider, method: payment.method });
  }
  return { data: [...seen.values()], error: null };
}

async function invokePaymentFunction<T>(
  supabase: Client,
  name: string,
  body: Record<string, string>,
): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(name, { body });
  if (error) {
    // FunctionsHttpError's message is a generic "non-2xx status" string —
    // the actual reason is the plain-text response body on error.context.
    const context = (error as { context?: Response }).context;
    const detail = context ? await context.text().catch(() => null) : null;
    throw new Error(detail || error.message);
  }
  if (!data) throw new Error("Resposta vazia do provedor de pagamento");
  return data;
}

/** Cliente paga para a conta master da plataforma (sem split na cobrança)
 *  — restaurante e entregador só recebem depois que o pedido virar
 *  "completed" (ou for ajustado por uma disputa), via asaas-payout. */
export async function createAsaasCheckout(supabase: Client, orderId: string) {
  return invokePaymentFunction<{ url: string }>(supabase, "asaas-create-payment", {
    order_id: orderId,
    origin: window.location.origin,
  });
}

/** Cria a subconta Asaas do restaurante ou do entregador (KYC direto via
 *  API, sem redirect) e grava o walletId retornado como asaas_account_id
 *  na tabela certa — é o destino usado depois pelo repasse (asaas-payout). */
export async function connectAsaasAccount(
  supabase: Client,
  entityType: "company" | "delivery_partner",
  entityId: string,
  input: AsaasOnboardingInput,
) {
  const { data, error } = await supabase.functions.invoke<{ wallet_id: string }>(
    "asaas-onboarding",
    {
      body: { entity_type: entityType, entity_id: entityId, ...input },
    },
  );
  if (error) {
    const context = (error as { context?: Response }).context;
    const detail = context ? await context.text().catch(() => null) : null;
    throw new Error(detail || error.message);
  }
  if (!data) throw new Error("Resposta vazia do provedor de pagamento");
  return data;
}
