import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { CouponInput } from "@/lib/validations/coupon";

type Client = SupabaseClient<Database>;

export type Coupon = Database["public"]["Tables"]["coupons"]["Row"];

export async function listCompanyCoupons(supabase: Client, companyId: string) {
  return supabase
    .from("coupons")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .returns<Coupon[]>();
}

export async function createCoupon(supabase: Client, companyId: string, input: CouponInput) {
  return supabase.from("coupons").insert({
    company_id: companyId,
    code: input.code.trim().toUpperCase(),
    promo_type: input.promoType,
    discount_type: input.discountType,
    discount_value: input.discountValue,
    min_order_value: input.minOrderValue || 0,
    max_uses: input.maxUses || null,
    max_uses_per_user: input.maxUsesPerUser || null,
    valid_until: input.validUntil || null,
  });
}

export async function setCouponActive(supabase: Client, couponId: string, isActive: boolean) {
  return supabase.from("coupons").update({ is_active: isActive }).eq("id", couponId);
}

export type PromotedCompany = {
  id: string;
  name: string;
  slug: string;
  promoType: string;
  discountType: string;
  discountValue: number;
  code: string;
};

export async function listPromotedCompanies(supabase: Client) {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("coupons")
    .select("code, promo_type, discount_type, discount_value, companies!inner(id, name, slug, status)")
    .eq("is_active", true)
    .eq("companies.status", "active")
    .lte("valid_from", nowIso)
    .or(`valid_until.is.null,valid_until.gte.${nowIso}`);
  if (error) return { data: null, error };

  const promotions: PromotedCompany[] = data.map((row) => ({
    id: row.companies.id,
    name: row.companies.name,
    slug: row.companies.slug,
    promoType: row.promo_type,
    discountType: row.discount_type,
    discountValue: row.discount_value,
    code: row.code,
  }));

  return { data: promotions, error: null };
}

// validate_coupon is declared RETURNS TABLE(...) (genuinely array-shaped,
// unlike the single-row-returning order/company RPCs elsewhere in this
// codebase) — .single() is correct and safe here since the function always
// emits exactly one row.
export async function validateCoupon(
  supabase: Client,
  companyId: string,
  code: string,
  subtotal: number,
) {
  return supabase
    .rpc("validate_coupon", { p_company_id: companyId, p_code: code, p_subtotal: subtotal })
    .single();
}
