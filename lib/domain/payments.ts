import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

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

export async function createMercadoPagoCheckout(supabase: Client, orderId: string) {
  return invokePaymentFunction<{ url: string }>(supabase, "mercadopago-create-preference", {
    order_id: orderId,
    origin: window.location.origin,
  });
}

export async function createMercadoPagoConnectOnboardingLink(supabase: Client, companyId: string) {
  return invokePaymentFunction<{ url: string }>(supabase, "mercadopago-connect-onboarding", {
    company_id: companyId,
    origin: window.location.origin,
  });
}
