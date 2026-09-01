import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { haversineDistanceKm } from "@/lib/geo";
import type { RestaurantCardData } from "@/lib/domain/restaurant-display";

type Client = SupabaseClient<Database>;

const CANDIDATE_COLUMNS =
  "id, name, slug, category, cover_image_url, delivery_fee_base, rating_avg, rating_count, avg_prep_time_minutes, delivered_orders_count, min_order_value, lat, lng" as const;

const RECOMMENDATION_LIMIT = 12;

/** "Restaurantes que você deve gostar": restaurants the customer has ordered
 *  from before, plus others in the same categories, ranked by rating, then
 *  price (using min order value as a proxy), then distance from the
 *  customer's current address. Falls back to the best-rated active
 *  restaurants for a customer with no order history yet. */
export async function listRecommendedCompanies(
  supabase: Client,
  userId: string,
  userLat: number | null,
  userLng: number | null,
) {
  const { data: pastOrders } = await supabase
    .from("orders")
    .select("company_id")
    .eq("customer_id", userId)
    .not("status", "in", "(pending_payment,cancelled,rejected)");

  const previousCompanyIds = [...new Set((pastOrders ?? []).map((o) => o.company_id))];

  let previousCategories: string[] = [];
  if (previousCompanyIds.length > 0) {
    const { data: previousCompanies } = await supabase
      .from("companies")
      .select("category")
      .in("id", previousCompanyIds)
      .not("category", "is", null);
    previousCategories = [...new Set((previousCompanies ?? []).map((c) => c.category as string))];
  }

  let query = supabase.from("companies").select(CANDIDATE_COLUMNS).eq("status", "active");

  if (previousCompanyIds.length > 0 || previousCategories.length > 0) {
    const orParts: string[] = [];
    if (previousCompanyIds.length > 0) orParts.push(`id.in.(${previousCompanyIds.join(",")})`);
    if (previousCategories.length > 0) {
      orParts.push(`category.in.(${previousCategories.map((c) => `"${c}"`).join(",")})`);
    }
    query = query.or(orParts.join(","));
  } else {
    query = query.order("rating_avg", { ascending: false, nullsFirst: false });
  }

  const { data, error } = await query.limit(50);
  if (error || !data) return { data: null, error };

  const ranked = [...data].sort((a, b) => {
    const ratingDiff = (b.rating_avg ?? 0) - (a.rating_avg ?? 0);
    if (ratingDiff !== 0) return ratingDiff;

    const priceDiff = a.min_order_value - b.min_order_value;
    if (priceDiff !== 0) return priceDiff;

    if (userLat !== null && userLng !== null) {
      const distA = a.lat !== null && a.lng !== null ? haversineDistanceKm(userLat, userLng, a.lat, a.lng) : Infinity;
      const distB = b.lat !== null && b.lng !== null ? haversineDistanceKm(userLat, userLng, b.lat, b.lng) : Infinity;
      return distA - distB;
    }
    return 0;
  });

  const cards: RestaurantCardData[] = ranked.slice(0, RECOMMENDATION_LIMIT).map((company) => ({
    id: company.id,
    name: company.name,
    slug: company.slug,
    coverImageUrl: company.cover_image_url,
    deliveryFeeBase: company.delivery_fee_base,
    ratingAvg: company.rating_avg,
    ratingCount: company.rating_count,
    avgPrepTimeMinutes: company.avg_prep_time_minutes,
    deliveredOrdersCount: company.delivered_orders_count,
    lat: company.lat,
    lng: company.lng,
  }));

  return { data: cards, error: null };
}
