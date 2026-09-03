import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type Client = SupabaseClient<Database>;

export const ANALYTICS_PERIODS = [
  { days: 7, label: "7 dias" },
  { days: 30, label: "30 dias" },
  { days: 90, label: "90 dias" },
] as const;

export type SalesDay = { day: string; revenue: number; orderCount: number };

export async function getCompanySalesOverTime(supabase: Client, companyId: string, days: number) {
  const { data, error } = await supabase.rpc("get_company_sales_over_time", {
    p_company_id: companyId,
    p_days: days,
  });
  if (error) return { data: null, error };
  const sales: SalesDay[] = data.map((row) => ({
    day: row.day,
    revenue: row.revenue,
    orderCount: row.order_count,
  }));
  return { data: sales, error: null };
}

export type TopProduct = { itemName: string; totalQuantity: number; totalRevenue: number };

export async function getCompanyTopProducts(
  supabase: Client,
  companyId: string,
  days: number,
  limit: number,
  offset: number,
) {
  const { data, error } = await supabase.rpc("get_company_top_products", {
    p_company_id: companyId,
    p_days: days,
    p_limit: limit,
    p_offset: offset,
  });
  if (error) return { data: null, error };
  const products: TopProduct[] = data.map((row) => ({
    itemName: row.item_name,
    totalQuantity: row.total_quantity,
    totalRevenue: row.total_revenue,
  }));
  return { data: products, error: null };
}

export type PaymentMethodUsage = { paymentMethod: string; orderCount: number; revenue: number };

export async function getCompanyPaymentMethodUsage(supabase: Client, companyId: string, days: number) {
  const { data, error } = await supabase.rpc("get_company_payment_method_usage", {
    p_company_id: companyId,
    p_days: days,
  });
  if (error) return { data: null, error };
  const usage: PaymentMethodUsage[] = data.map((row) => ({
    paymentMethod: row.payment_method,
    orderCount: row.order_count,
    revenue: row.revenue,
  }));
  return { data: usage, error: null };
}
